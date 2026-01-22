/**
 * E-Book Cover API
 * Returns a signed URL for the ebook cover image
 * Public endpoint - covers should be visible for marketing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: ebookId } = await params

    const supabaseAdmin = createAdminClient()

    // Fetch the ebook to get cover_path
    const { data: ebook, error: ebookError } = await (supabaseAdmin as any)
      .from('ebooks')
      .select('cover_path')
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

    // Check if ebook has a cover
    if (!ebook.cover_path) {
      return NextResponse.json(
        { error: 'Cover nicht verfügbar' },
        { status: 404 }
      )
    }

    // Generate signed URL (24 hours validity for public covers)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('ebooks')
      .createSignedUrl(ebook.cover_path, 24 * 3600) // 24 hours

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('Failed to generate cover URL:', urlError)
      return NextResponse.json(
        { error: 'Fehler beim Generieren der Cover-URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      coverUrl: signedUrlData.signedUrl,
    })

  } catch (error) {
    console.error('E-Book cover error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Covers' },
      { status: 500 }
    )
  }
}

