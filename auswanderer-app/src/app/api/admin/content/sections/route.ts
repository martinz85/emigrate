import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const contentSchema = z.object({
  section: z.string(),
  key: z.string(),
  content: z.string().min(1, 'Content darf nicht leer sein').max(500, 'Maximal 500 Zeichen'),
  content_type: z.string().optional().default('text'),
  label: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/admin/content/sections - Liste aller Sections mit Item Count
export async function GET() {
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

    // Get distinct sections with item counts
    const { data: sections, error } = await supabase
      .from('site_content')
      .select('section')
      .order('section')

    if (error) {
      console.error('Error fetching sections:', error)
      return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
    }

    // Count items per section
    const sectionCounts = sections.reduce((acc: Record<string, number>, item) => {
      acc[item.section] = (acc[item.section] || 0) + 1
      return acc
    }, {})

    // Convert to array format
    const sectionsArray = Object.entries(sectionCounts).map(([section, itemCount]) => ({
      section,
      itemCount
    }))

    return NextResponse.json({ sections: sectionsArray })
  } catch (error) {
    console.error('Error in GET /api/admin/content/sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/content/sections - Neue Section erstellen (falls needed)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

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

    const validatedData = contentSchema.parse(body)

    const { data, error } = await supabase
      .from('site_content')
      .insert([{
        ...validatedData,
        created_by: user.id,
        updated_by: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating content:', error)
      return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
    }

    // Log audit event
    await supabase.from('audit_logs').insert([{
      user_id: user.id,
      action: 'create',
      table_name: 'site_content',
      record_id: data.id,
      old_values: null,
      new_values: data,
      metadata: { section: validatedData.section, key: validatedData.key }
    }])

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    console.error('Error in POST /api/admin/content/sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
