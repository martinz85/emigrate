/**
 * Admin API: Trigger Manual Catalog Check
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runCatalogCheck } from '@/lib/ai'

export async function POST() {
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
    const result = await runCatalogCheck(user.id, 'manual')

    return NextResponse.json({
      success: true,
      checkId: result.checkId,
      updatesFound: result.updatesFound,
    })
  } catch (error) {
    console.error('Catalog check failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Check fehlgeschlagen' },
      { status: 500 }
    )
  }
}

