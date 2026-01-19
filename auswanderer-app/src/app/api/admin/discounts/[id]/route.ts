import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * Admin API: Delete Discount Code
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const discountId = params.id

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(discountId)) {
    return NextResponse.json(
      { error: 'Ungültige Discount-ID' },
      { status: 400 }
    )
  }

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

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('discount_codes')
    .delete()
    .eq('id', discountId)

  if (error) {
    console.error('Error deleting discount:', error)
    return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 })
  }

  console.log(`[AUDIT] Discount ${discountId} deleted by admin ${user.id}`)

  return NextResponse.json({ success: true })
}

