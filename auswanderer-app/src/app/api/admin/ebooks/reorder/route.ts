import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminWrite, getEbooksTable } from '@/lib/admin'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'

// ============================================
// Validation Schema
// ============================================

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number().int().min(0),
  })).min(1).max(100), // Reasonable limit
})

// ============================================
// PATCH: Reorder ebooks
// FIX: Better error handling with individual error tracking
// ============================================

export async function PATCH(request: NextRequest) {
  const { error, status, user } = await verifyAdminWrite()
  if (error || !user) {
    return NextResponse.json({ error }, { status })
  }

  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = reorderSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: `Ungültige Daten: ${errors}` }, { status: 400 })
    }

    const { items } = parseResult.data
    const supabase = createAdminClient()

    // Verify all IDs exist before updating
    const ids = items.map(item => item.id)
    const { data: existingEbooks, error: fetchError } = await getEbooksTable(supabase)
      .select('id')
      .in('id', ids)
      .is('deleted_at', null)

    if (fetchError) {
      console.error('Error verifying ebooks:', fetchError)
      return NextResponse.json({ error: 'Fehler beim Verifizieren der E-Books' }, { status: 500 })
    }

    const existingIds = new Set((existingEbooks || []).map((e: { id: string }) => e.id))
    const missingIds = ids.filter(id => !existingIds.has(id))

    if (missingIds.length > 0) {
      return NextResponse.json({ 
        error: `E-Books nicht gefunden: ${missingIds.length} von ${ids.length} IDs sind ungültig` 
      }, { status: 400 })
    }

    // FIX: Track individual update results for better error reporting
    const updateResults: { id: string; success: boolean; error?: string }[] = []
    
    // Process updates sequentially to maintain consistency
    // Note: For better atomicity, consider using a stored procedure
    for (const item of items) {
      const { error: updateError } = await getEbooksTable(supabase)
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
      
      if (updateError) {
        console.error(`Failed to update sort_order for ${item.id}:`, updateError)
        updateResults.push({ 
          id: item.id, 
          success: false, 
          error: updateError.message 
        })
      } else {
        updateResults.push({ id: item.id, success: true })
      }
    }

    const failures = updateResults.filter(r => !r.success)
    const successes = updateResults.filter(r => r.success)

    // Log the operation
    await logAuditEvent({
      action: 'EBOOKS_REORDERED',
      targetId: 'batch',
      targetType: 'ebook',
      adminId: user.id,
      metadata: { 
        total: items.length,
        successful: successes.length,
        failed: failures.length,
        failedIds: failures.map(f => f.id),
      },
    })

    // FIX: Return appropriate response based on results
    if (failures.length === items.length) {
      // All failed
      return NextResponse.json({ 
        success: false,
        error: 'Alle Sortierungs-Updates fehlgeschlagen',
        details: failures 
      }, { status: 500 })
    }

    if (failures.length > 0) {
      // Partial success - return warning
      return NextResponse.json({ 
        success: true, 
        warning: `${failures.length} von ${items.length} Updates fehlgeschlagen`,
        failedIds: failures.map(f => f.id),
      })
    }

    // All successful
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Ebook reorder error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
