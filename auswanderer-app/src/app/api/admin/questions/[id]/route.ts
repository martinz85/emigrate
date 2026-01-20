import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'

// ============================================
// Validation Schema for Update
// ============================================

const updateQuestionSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  question_text: z.string().min(10).optional(),
  question_key: z.string().nullable().optional(),
  help_text: z.string().nullable().optional(),
  question_type: z.enum(['boolean', 'rating', 'text', 'select']).optional(),
  select_options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).nullable().optional(),
  weight: z.number().min(0).max(10).optional(),
  sort_order: z.number().int().optional(),
  image_path: z.string().nullable().optional(),
  is_required: z.boolean().optional(),
  is_active: z.boolean().optional(),
  // Optional text input per question
  allow_text_input: z.boolean().optional(),
  text_input_label: z.string().nullable().optional(),
  text_input_placeholder: z.string().nullable().optional(),
})

// ============================================
// GET: Single question
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

    const { data: question, error } = await supabase
      .from('analysis_questions')
      .select(`
        *,
        category:question_categories(*)
      `)
      .eq('id', id)
      .single()

    if (error || !question) {
      return NextResponse.json({ error: 'Frage nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ data: question })
  } catch (error) {
    console.error('Question GET error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// PATCH: Update question
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
    const parseResult = updateQuestionSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(e => e.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const input = parseResult.data

    // Validate select_options for select type
    if (input.question_type === 'select' && input.select_options !== undefined) {
      if (!input.select_options || input.select_options.length === 0) {
        return NextResponse.json({ 
          error: 'Auswahl-Fragen benötigen mindestens eine Option' 
        }, { status: 400 })
      }
    }

    const supabase = createAdminClient()

    // Check if question exists
    const { data: existing } = await supabase
      .from('analysis_questions')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Frage nicht gefunden' }, { status: 404 })
    }

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {}
    if (input.category_id !== undefined) updateData.category_id = input.category_id
    if (input.question_text !== undefined) updateData.question_text = input.question_text
    if (input.question_key !== undefined) updateData.question_key = input.question_key
    if (input.help_text !== undefined) updateData.help_text = input.help_text
    if (input.question_type !== undefined) updateData.question_type = input.question_type
    if (input.select_options !== undefined) updateData.select_options = input.select_options
    if (input.weight !== undefined) updateData.weight = input.weight
    if (input.sort_order !== undefined) updateData.sort_order = input.sort_order
    if (input.image_path !== undefined) updateData.image_path = input.image_path
    if (input.is_required !== undefined) updateData.is_required = input.is_required
    if (input.is_active !== undefined) updateData.is_active = input.is_active
    // Optional text input fields
    if (input.allow_text_input !== undefined) updateData.allow_text_input = input.allow_text_input
    if (input.text_input_label !== undefined) updateData.text_input_label = input.text_input_label
    if (input.text_input_placeholder !== undefined) updateData.text_input_placeholder = input.text_input_placeholder

    const { data: question, error: updateError } = await supabase
      .from('analysis_questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating question:', updateError)
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'QUESTION_UPDATED',
      targetId: id,
      targetType: 'analysis_question',
      adminId: user.id,
      metadata: { updated_fields: Object.keys(updateData) },
    })

    return NextResponse.json({ data: question })
  } catch (error) {
    console.error('Question PATCH error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// DELETE: Delete question
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

    // Get question for audit log
    const { data: existing } = await supabase
      .from('analysis_questions')
      .select('question_text')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Frage nicht gefunden' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('analysis_questions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting question:', deleteError)
      return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'QUESTION_DELETED',
      targetId: id,
      targetType: 'analysis_question',
      adminId: user.id,
      metadata: { question_text: existing.question_text.substring(0, 50) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Question DELETE error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

