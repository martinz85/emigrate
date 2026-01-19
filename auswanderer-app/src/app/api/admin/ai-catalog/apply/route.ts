/**
 * Admin API: Apply Model Update
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyModelUpdate } from '@/lib/ai'

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

  if (!adminUser || adminUser.role !== 'super_admin') {
    return NextResponse.json({ error: 'Nur Super-Admins können Updates anwenden' }, { status: 403 })
  }

  try {
    const { updateId } = await request.json()

    if (!updateId) {
      return NextResponse.json({ error: 'updateId erforderlich' }, { status: 400 })
    }

    await applyModelUpdate(updateId, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Apply update failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Anwenden fehlgeschlagen' },
      { status: 500 }
    )
  }
}

