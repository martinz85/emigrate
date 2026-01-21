import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// GET /api/content/media/[section] - Get active media for a section (public)
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const supabase = await createClient()
    const section = params.section

    // Validate section parameter
    if (!['hero', 'loading_screen'].includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    // Get active media for the section
    const { data: media, error } = await supabase
      .from('site_media')
      .select('*')
      .eq('usage_section', section)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching media:', error)
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    // If no media found, return null (frontend will use fallback)
    if (!media) {
      return NextResponse.json({ media: null })
    }

    // Add media URL to response
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const mediaWithUrl = {
      ...media,
      url: `${supabaseUrl}/storage/v1/object/public/site-media/${media.file_path}`
    }

    return NextResponse.json({ media: mediaWithUrl })

  } catch (error) {
    console.error('Error in GET /api/content/media/[section]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
