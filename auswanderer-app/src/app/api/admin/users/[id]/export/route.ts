import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

/**
 * Admin API: Export User Data (DSGVO Art. 20)
 * 
 * Returns all data associated with a user for data portability.
 */
export async function GET(
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

  const supabase = createAdminClient()

  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Fetch analyses
    const { data: analyses } = await supabase
      .from('analyses')
      .select('id, created_at, paid, paid_at, ratings, result')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Fetch newsletter subscription (DSGVO Art. 20: all user data)
    let newsletterSubscription = null
    if (profile?.email) {
      const { data: newsletter } = await supabase
        .from('newsletter_subscribers')
        .select('email, source, opted_in_at, language')
        .eq('email', profile.email)
        .single()
      
      newsletterSubscription = newsletter || null
    }

    // Compile export data (DSGVO Art. 20: complete data portability)
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: 'admin',
      user: {
        id: userId,
        email: profile?.email,
        fullName: profile?.full_name,
        createdAt: profile?.created_at,
        subscriptionTier: profile?.subscription_tier,
        newsletterOptIn: profile?.newsletter_opt_in,
      },
      analyses: analyses?.map(a => ({
        id: a.id,
        createdAt: a.created_at,
        paid: a.paid,
        paidAt: a.paid_at,
        ratings: a.ratings,
        result: a.result,
      })) || [],
      newsletterSubscription: newsletterSubscription,
      metadata: {
        totalAnalyses: analyses?.length || 0,
        paidAnalyses: analyses?.filter(a => a.paid).length || 0,
        hasNewsletterSubscription: !!newsletterSubscription,
      },
    }

    // Persist audit log (DSGVO compliance)
    await logAuditEvent({
      action: 'USER_EXPORTED',
      targetId: userId,
      targetType: 'user',
      adminId: currentUser.id,
      metadata: { reason: 'DSGVO Art. 20 request' },
    })

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('User export error:', error)
    return NextResponse.json(
      { error: 'Export fehlgeschlagen' },
      { status: 500 }
    )
  }
}

