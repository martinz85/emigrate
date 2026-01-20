/**
 * E-Book Download API
 * Story 7.3: E-Book Download
 * 
 * Generates a signed URL for downloading an e-book PDF.
 * Validates user has access (purchased, bundle, or PRO).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Signed URL validity (1 hour)
const SIGNED_URL_EXPIRY = 3600

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
    const { data: ebook, error: ebookError } = await (supabaseAdmin as any)
      .from('ebooks')
      .select('id, slug, title, pdf_path, is_bundle, bundle_items')
      .eq('id', ebookId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

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

    // Generate signed URL for download
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('ebooks')
      .createSignedUrl(ebook.pdf_path, SIGNED_URL_EXPIRY, {
        download: `${ebook.slug}.pdf`,
      })

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Failed to create signed URL:', signedUrlError)
      return NextResponse.json(
        { error: 'Download konnte nicht generiert werden' },
        { status: 500 }
      )
    }

    // Return the signed URL
    return NextResponse.json({
      downloadUrl: signedUrlData.signedUrl,
      filename: `${ebook.slug}.pdf`,
      expiresIn: SIGNED_URL_EXPIRY,
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
  const { data: directPurchase } = await (supabase as any)
    .from('user_ebooks')
    .select('id')
    .eq('user_id', userId)
    .eq('ebook_id', ebookId)
    .maybeSingle()

  if (directPurchase) {
    return true
  }

  // 3. Check bundle purchases
  // Get all bundles that contain this ebook
  const { data: ebook } = await (supabase as any)
    .from('ebooks')
    .select('slug')
    .eq('id', ebookId)
    .single()

  if (ebook) {
    // Find bundles containing this ebook's slug
    const { data: bundles } = await (supabase as any)
      .from('ebooks')
      .select('id')
      .eq('is_bundle', true)
      .contains('bundle_items', [ebook.slug])

    if (bundles && bundles.length > 0) {
      // Check if user has purchased any of these bundles
      const bundleIds = bundles.map((b: { id: string }) => b.id)
      
      const { data: bundlePurchase } = await (supabase as any)
        .from('user_ebooks')
        .select('id')
        .eq('user_id', userId)
        .in('ebook_id', bundleIds)
        .maybeSingle()

      if (bundlePurchase) {
        return true
      }
    }
  }

  return false
}


