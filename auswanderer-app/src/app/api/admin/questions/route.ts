import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'
import type { AnalysisQuestionWithCategory, CreateQuestionInput } from '@/types/questions'

// ============================================
// Validation Schema
// ============================================

const createQuestionSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  question_text: z.string().min(10, 'Frage muss mindestens 10 Zeichen haben'),
  question_key: z.string().nullable().optional(),
  help_text: z.string().nullable().optional(),
  question_type: z.enum(['boolean', 'rating', 'text', 'select']),
  select_options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).nullable().optional(),
  weight: z.number().min(0).max(10).default(1.00),
  sort_order: z.number().int().optional(),
  image_path: z.string().nullable().optional(),
  is_required: z.boolean().default(true),
  is_active: z.boolean().default(true),
  // Optional text input per question
  allow_text_input: z.boolean().default(false),
  text_input_label: z.string().nullable().optional(),
  text_input_placeholder: z.string().nullable().optional(),
})

// ============================================
// GET: List all questions (admin sees all, including inactive)
// ============================================

export async function GET(request: NextRequest) {
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

    // Fetch all questions with category info
    const { data: questions, error } = await supabase
      .from('analysis_questions')
      .select(`
        *,
        category:question_categories(*)
      `)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
    }

    return NextResponse.json({ data: questions as AnalysisQuestionWithCategory[] })
  } catch (error) {
    console.error('Questions GET error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// POST: Create new question
// ============================================

export async function POST(request: NextRequest) {
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
    const parseResult = createQuestionSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => e.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const input = parseResult.data as CreateQuestionInput

    // Validate select_options for select type
    if (input.question_type === 'select' && (!input.select_options || input.select_options.length === 0)) {
      return NextResponse.json({ 
        error: 'Auswahl-Fragen benötigen mindestens eine Option' 
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get max sort_order if not provided
    if (input.sort_order === undefined) {
      const { data: maxOrder } = await supabase
        .from('analysis_questions')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      input.sort_order = (maxOrder?.sort_order ?? 0) + 1
    }

    // Debug log
    console.log('[API] POST question - input:', input)
    console.log('[API] POST question - allow_text_input:', input.allow_text_input)

    // Insert question
    const insertData = {
      category_id: input.category_id || null,
      question_text: input.question_text,
      question_key: input.question_key || null,
      help_text: input.help_text || null,
      question_type: input.question_type,
      select_options: input.select_options || null,
      weight: input.weight ?? 1.00,
      sort_order: input.sort_order,
      image_path: input.image_path || null,
      is_required: input.is_required ?? true,
      is_active: input.is_active ?? true,
      // Optional text input fields
      allow_text_input: input.allow_text_input ?? false,
      text_input_label: input.text_input_label || null,
      text_input_placeholder: input.text_input_placeholder || null,
    }
    console.log('[API] POST question - insertData:', insertData)

    const { data: question, error: insertError } = await supabase
      .from('analysis_questions')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating question:', insertError)
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'QUESTION_CREATED',
      targetId: question.id,
      targetType: 'analysis_question',
      adminId: user.id,
      metadata: { question_text: input.question_text.substring(0, 50) },
    })

    return NextResponse.json({ data: question }, { status: 201 })
  } catch (error) {
    console.error('Question POST error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

