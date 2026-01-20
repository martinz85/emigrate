/**
 * E-Book Download API
 * Story 7.3: E-Book Download
 * 
 * Streams the e-book PDF directly to the user (auth-bound).
 * The download is only accessible with valid authentication.
 * 
 * SECURITY: This proxy approach ensures the download link is user-bound,
 * unlike signed URLs which can be shared with anyone.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  getEbookForDownload,
  checkUserOwnsEbook,
  getEbookSlug,
  findBundlesContainingSlug,
  checkUserOwnsBundles,
} from '@/lib/supabase/ebooks-queries'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: ebookId } = await params

    // Get user session
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert. Bitte einloggen.' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Fetch the ebook
    const { data: ebook, error: ebookError } = await getEbookForDownload(supabaseAdmin, ebookId)

    if (ebookError || !ebook) {
      return NextResponse.json(
        { error: 'E-Book nicht gefunden' },
        { status: 404 }
      )
    }

    // Check if ebook has a PDF
    if (!ebook.pdf_path) {
      return NextResponse.json(
        { error: 'E-Book PDF noch nicht verfügbar' },
        { status: 404 }
      )
    }

    // Check access rights
    const hasAccess = await checkEbookAccess(supabaseAdmin, user.id, ebookId)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Kein Zugang zu diesem E-Book. Bitte kaufen oder PRO werden.' },
        { status: 403 }
      )
    }

    // Download the file from Supabase Storage and stream it to the user
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from('ebooks')
      .download(ebook.pdf_path)

    if (fileError || !fileData) {
      console.error('Failed to download ebook file:', fileError)
      return NextResponse.json(
        { error: 'Download fehlgeschlagen' },
        { status: 500 }
      )
    }

    // Get file size for Content-Length header
    const fileBuffer = await fileData.arrayBuffer()

    // Return the PDF as a downloadable response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${ebook.slug}.pdf"`,
        'Content-Length': String(fileBuffer.byteLength),
        // Prevent caching of the file
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('E-Book download error:', error)
    return NextResponse.json(
      { error: 'Download fehlgeschlagen' },
      { status: 500 }
    )
  }
}

/**
 * Check if user has access to an ebook
 * Access is granted if:
 * 1. User is PRO subscriber
 * 2. User has purchased this specific ebook
 * 3. User has purchased a bundle containing this ebook
 */
async function checkEbookAccess(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  ebookId: string
): Promise<boolean> {
  // 1. Check PRO status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (profile?.subscription_tier === 'pro') {
    return true
  }

  // 2. Check direct purchase
  const { data: directPurchase } = await checkUserOwnsEbook(supabase, userId, ebookId)

  if (directPurchase) {
    return true
  }

  // 3. Check bundle purchases
  const { data: ebook } = await getEbookSlug(supabase, ebookId)

  if (ebook) {
    // Find bundles containing this ebook's slug
    const { data: bundles } = await findBundlesContainingSlug(supabase, ebook.slug)

    if (bundles && bundles.length > 0) {
      const bundleIds = bundles.map(b => b.id)
      const { data: bundlePurchase } = await checkUserOwnsBundles(supabase, userId, bundleIds)

      if (bundlePurchase) {
        return true
      }
    }
  }

  return false
}
