/**
 * Admin API: AI Catalog
 *
 * GET - Get pending updates and last check info
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPendingUpdates, getRecentChecks } from '@/lib/ai'

export async function GET() {
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
    const pendingUpdates = await getPendingUpdates()
    const recentChecks = await getRecentChecks(1)

    return NextResponse.json({
      pendingUpdates,
      lastCheck: recentChecks[0] || null,
    })
  } catch (error) {
    console.error('Failed to fetch catalog data:', error)
    return NextResponse.json({ error: 'Laden fehlgeschlagen' }, { status: 500 })
  }
}

