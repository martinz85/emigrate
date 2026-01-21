import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/content/[section] - Get public site content for a section
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const supabase = await createClient()
    const section = params.section

    // Fetch all content for this section
    const { data: content, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', section)
      .order('key')

    if (error) {
      console.error('Error fetching section content:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    // Transform to key-value pairs for easier frontend consumption
    const contentMap: Record<string, string> = {}
    content?.forEach(item => {
      contentMap[item.key] = item.content
    })

    return NextResponse.json({ section, content: contentMap })
  } catch (error) {
    console.error('Error in GET /api/content/[section]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

