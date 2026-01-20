import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'

// ============================================
// Validation Schema
// ============================================

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  name_key: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
})

// ============================================
// GET: Single category
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  try {
    const supabase = createAdminClient()

    const { data: category, error } = await supabase
      .from('question_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !category) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('Category GET error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// PATCH: Update category
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = updateCategorySchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => e.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const input = parseResult.data
    const supabase = createAdminClient()

    // Check if category exists
    const { data: existing } = await supabase
      .from('question_categories')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.name_key !== undefined) updateData.name_key = input.name_key
    if (input.description !== undefined) updateData.description = input.description
    if (input.icon !== undefined) updateData.icon = input.icon
    if (input.sort_order !== undefined) updateData.sort_order = input.sort_order

    const { data: category, error: updateError } = await supabase
      .from('question_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating category:', updateError)
      if (updateError.code === '23505') {
        return NextResponse.json({ error: 'Kategorie mit diesem Key existiert bereits' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'CATEGORY_UPDATED',
      targetId: id,
      targetType: 'question_category',
      adminId: user.id,
      metadata: { updated_fields: Object.keys(updateData) },
    })

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('Category PATCH error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// DELETE: Delete category
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  try {
    const supabase = createAdminClient()

    // Get category for audit log
    const { data: existing } = await supabase
      .from('question_categories')
      .select('name')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
    }

    // Check if category has questions
    const { count } = await supabase
      .from('analysis_questions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (count && count > 0) {
      return NextResponse.json({ 
        error: `Kategorie hat noch ${count} Fragen. Bitte erst die Fragen verschieben oder löschen.` 
      }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('question_categories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting category:', deleteError)
      return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'CATEGORY_DELETED',
      targetId: id,
      targetType: 'question_category',
      adminId: user.id,
      metadata: { name: existing.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category DELETE error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

