import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * Admin API: Delete User (DSGVO Art. 17)
 * 
 * Completely removes a user and all their data.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    return NextResponse.json(
      { error: 'Ungültige User-ID' },
      { status: 400 }
    )
  }

  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user: currentUser } } = await supabaseAuth.auth.getUser()
  
  if (!currentUser) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  // Prevent self-deletion
  if (userId === currentUser.id) {
    return NextResponse.json(
      { error: 'Du kannst dich nicht selbst löschen' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    // 1. Delete analyses
    const { error: analysesError } = await supabase
      .from('analyses')
      .delete()
      .eq('user_id', userId)

    if (analysesError) {
      console.error('Error deleting analyses:', analysesError)
    }

    // 2. Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
    }

    // 3. Delete auth user (requires admin client)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json(
        { error: `Auth-Löschung fehlgeschlagen: ${authError.message}` },
        { status: 500 }
      )
    }

    // Audit log
    console.log(`[AUDIT] User ${userId} deleted by admin ${currentUser.id} at ${new Date().toISOString()}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Löschung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

