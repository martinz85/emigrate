import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

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
    // DSGVO Art. 17: Complete data deletion in correct order
    // Abort on any error to maintain data consistency

    // 1. Delete analyses
    const { error: analysesError } = await supabase
      .from('analyses')
      .delete()
      .eq('user_id', userId)

    if (analysesError) {
      console.error('Error deleting analyses:', analysesError)
      return NextResponse.json(
        { error: 'Analysen konnten nicht gelöscht werden. Löschung abgebrochen.' },
        { status: 500 }
      )
    }

    // 2. Delete newsletter subscription (DSGVO: alle User-Daten löschen)
    // Note: newsletter_subscribers may use email instead of user_id
    // Fetch user email first for newsletter deletion
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userProfile?.email) {
      const { error: newsletterError } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('email', userProfile.email)

      if (newsletterError) {
        console.error('Error deleting newsletter subscription:', newsletterError)
        // Non-critical: continue with deletion but log warning
      }
    }

    // 3. Delete admin_users entry (if user was admin)
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId)

    if (adminError) {
      // Non-critical: user might not be an admin
      console.log('No admin entry to delete or error:', adminError.message)
    }

    // 4. Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return NextResponse.json(
        { error: 'Profil konnte nicht gelöscht werden. Löschung abgebrochen.' },
        { status: 500 }
      )
    }

    // 5. Delete auth user (requires admin client)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json(
        { error: `Auth-Löschung fehlgeschlagen: ${authError.message}` },
        { status: 500 }
      )
    }

    // Persist audit log (DSGVO compliance)
    await logAuditEvent({
      action: 'USER_DELETED',
      targetId: userId,
      targetType: 'user',
      adminId: currentUser.id,
      metadata: { 
        userEmail: userProfile?.email ? '***' : null, // Don't store PII
        reason: 'DSGVO Art. 17 request',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Löschung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

