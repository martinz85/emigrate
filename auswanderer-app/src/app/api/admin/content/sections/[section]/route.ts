import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateContentSchema = z.object({
  key: z.string(),
  content: z.string().min(1, 'Content darf nicht leer sein').max(500, 'Maximal 500 Zeichen'),
  content_type: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
})

const updateSectionSchema = z.array(updateContentSchema)

// GET /api/admin/content/sections/[section] - Alle Texte einer Section
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const supabase = await createClient()
    const section = params.section

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

    const { data: content, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', section)
      .order('key')

    if (error) {
      console.error('Error fetching section content:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    return NextResponse.json({ section, content })
  } catch (error) {
    console.error('Error in GET /api/admin/content/sections/[section]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/content/sections/[section] - Section aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const supabase = await createClient()
    const section = params.section
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

    const updates = updateSectionSchema.parse(body)

    // Batch fetch all current values for audit logging (avoid N+1)
    const keys = updates.map(u => u.key)
    const { data: currentValues } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', section)
      .in('key', keys)
    
    const currentMap = new Map(currentValues?.map(c => [c.key, c]) || [])

    // Process each update
    const results = []
    const auditLogs = []
    
    for (const update of updates) {
      const current = currentMap.get(update.key)
      
      // Update the content
      const { data, error } = await supabase
        .from('site_content')
        .update({
          content: update.content,
          content_type: update.content_type || 'text',
          label: update.label,
          description: update.description,
          updated_by: user.id
        })
        .eq('section', section)
        .eq('key', update.key)
        .select()
        .single()

      if (error) {
        console.error('Error updating content:', error)
        return NextResponse.json({ error: `Failed to update ${update.key}` }, { status: 500 })
      }

      // Prepare audit log entry (don't block on insert)
      auditLogs.push({
        user_id: user.id,
        action: 'update',
        table_name: 'site_content',
        record_id: data.id,
        old_values: current ? {
          content: current.content,
          content_type: current.content_type,
          label: current.label,
          description: current.description
        } : null,
        new_values: {
          content: data.content,
          content_type: data.content_type,
          label: data.label,
          description: data.description
        },
        metadata: { section, key: update.key }
      })

      results.push(data)
    }

    // Insert audit logs (non-blocking, don't fail request if this fails)
    try {
      await supabase.from('audit_logs').insert(auditLogs)
    } catch (auditError) {
      console.error('Audit logging failed (non-critical):', auditError)
    }

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    console.error('Error in PATCH /api/admin/content/sections/[section]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
