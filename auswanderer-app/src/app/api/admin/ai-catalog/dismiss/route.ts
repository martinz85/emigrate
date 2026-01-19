/**
 * Admin API: Dismiss Model Update
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dismissModelUpdate } from '@/lib/ai'

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
    const { updateId, reason } = await request.json()

    if (!updateId) {
      return NextResponse.json({ error: 'updateId erforderlich' }, { status: 400 })
    }

    await dismissModelUpdate(updateId, user.id, reason)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dismiss update failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ablehnen fehlgeschlagen' },
      { status: 500 }
    )
  }
}

