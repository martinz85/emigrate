import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'
import type { QuestionCategory } from '@/types/questions'

// ============================================
// Validation Schema
// ============================================

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  name_key: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
})

// ============================================
// GET: List all categories
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

    const { data: categories, error } = await supabase
      .from('question_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
    }

    return NextResponse.json({ data: categories as QuestionCategory[] })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// POST: Create new category
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
    const parseResult = createCategorySchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(e => e.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const input = parseResult.data
    const supabase = createAdminClient()

    // Get max sort_order if not provided
    if (input.sort_order === undefined) {
      const { data: maxOrder } = await supabase
        .from('question_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      input.sort_order = (maxOrder?.sort_order ?? 0) + 1
    }

    // Insert category
    const { data: category, error: insertError } = await supabase
      .from('question_categories')
      .insert({
        name: input.name,
        name_key: input.name_key || null,
        description: input.description || null,
        icon: input.icon || null,
        sort_order: input.sort_order,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating category:', insertError)
      if (insertError.code === '23505') { // Unique constraint
        return NextResponse.json({ error: 'Kategorie mit diesem Key existiert bereits' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'CATEGORY_CREATED',
      targetId: category.id,
      targetType: 'question_category',
      adminId: user.id,
      metadata: { name: input.name },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    console.error('Category POST error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

