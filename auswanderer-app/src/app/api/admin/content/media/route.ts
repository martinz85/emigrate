import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// GET /api/admin/content/media - Get all media files
// ============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin access using is_admin() function
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use is_admin() function for consistent admin checking
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
    if (adminError || !isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'image', 'gif', 'video', or null for all
    const section = searchParams.get('section') // section filter

    let query = supabase
      .from('site_media')
      .select('*')
      .order('uploaded_at', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('file_type', type)
    }

    if (section) {
      query = query.eq('usage_section', section)
    }

    const { data: media, error } = await query

    if (error) {
      console.error('Error fetching media:', error)
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    // Add media URLs to response
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const mediaWithUrls = media.map(item => ({
      ...item,
      url: `${supabaseUrl}/storage/v1/object/public/site-media/${item.file_path}`
    }))

    return NextResponse.json({ media: mediaWithUrls })
  } catch (error) {
    console.error('Error in GET /api/admin/content/media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
