import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'

// ============================================
// Validation Schema
// ============================================

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number().int().min(0),
  })).min(1),
})

// ============================================
// PATCH: Reorder questions (batch update sort_order)
// ============================================

export async function PATCH(request: NextRequest) {
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
    const parseResult = reorderSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Ungültige Daten' }, { status: 400 })
    }

    const { items } = parseResult.data
    const supabase = createAdminClient()

    // Update each question's sort_order
    // Using a transaction-like approach with Promise.all
    const updates = items.map(item => 
      supabase
        .from('analysis_questions')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    )

    const results = await Promise.all(updates)
    
    // Check for any errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Reorder errors:', errors.map(e => e.error))
      return NextResponse.json({ error: 'Fehler beim Sortieren' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'QUESTIONS_REORDERED',
      targetId: 'batch',
      targetType: 'analysis_question',
      adminId: user.id,
      metadata: { count: items.length },
    })

    return NextResponse.json({ success: true, updated: items.length })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

