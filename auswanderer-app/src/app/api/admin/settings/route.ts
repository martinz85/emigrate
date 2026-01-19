import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { clearSettingsCache } from '@/lib/rate-limit'

/**
 * GET /api/admin/settings
 * List all system settings
 */
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

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('key')

  if (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Laden fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}

/**
 * PUT /api/admin/settings
 * Update a system setting
 */
export async function PUT(request: NextRequest) {
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

  // Only super_admin can modify settings
  if (!adminUser || adminUser.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Nur Super-Admins können Einstellungen ändern' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Ungültiger Key' }, { status: 400 })
    }

    if (!value || typeof value !== 'object') {
      return NextResponse.json({ error: 'Ungültiger Wert' }, { status: 400 })
    }

    // Validate specific settings
    const validations: Record<string, (v: Record<string, number>) => string | null> = {
      rate_limit_ip_daily: (v) => {
        if (v.limit < 1 || v.limit > 100) return 'Limit muss zwischen 1 und 100 sein'
        return null
      },
      rate_limit_session_total: (v) => {
        if (v.limit < 1 || v.limit > 100) return 'Limit muss zwischen 1 und 100 sein'
        return null
      },
      rate_limit_global_daily: (v) => {
        if (v.limit < 10 || v.limit > 10000) return 'Limit muss zwischen 10 und 10.000 sein'
        return null
      },
      budget_daily_usd: (v) => {
        if (v.limit < 1 || v.limit > 1000) return 'Budget muss zwischen $1 und $1.000 sein'
        if (v.warning_percent < 50 || v.warning_percent > 99) return 'Warnung muss zwischen 50% und 99% sein'
        return null
      },
      budget_monthly_usd: (v) => {
        if (v.limit < 10 || v.limit > 10000) return 'Budget muss zwischen $10 und $10.000 sein'
        if (v.warning_percent < 50 || v.warning_percent > 99) return 'Warnung muss zwischen 50% und 99% sein'
        return null
      },
      claude_cost_per_1k_input: (v) => {
        if (v.cost < 0.001 || v.cost > 1) return 'Kosten müssen zwischen $0.001 und $1 sein'
        return null
      },
      claude_cost_per_1k_output: (v) => {
        if (v.cost < 0.001 || v.cost > 1) return 'Kosten müssen zwischen $0.001 und $1 sein'
        return null
      },
    }

    const validate = validations[key]
    if (validate) {
      const error = validate(value)
      if (error) {
        return NextResponse.json({ error }, { status: 400 })
      }
    }

    const supabase = createAdminClient()

    // Fetch old value for audit log
    const { data: oldSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single()

    // Update setting
    const { error: updateError } = await supabase
      .from('system_settings')
      .update({
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('key', key)

    if (updateError) {
      console.error('Failed to update setting:', updateError)
      return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
    }

    // Clear settings cache so changes take effect immediately
    clearSettingsCache()

    // Audit log
    await logAuditEvent({
      action: 'SETTINGS_UPDATED' as any,
      targetId: key,
      targetType: 'settings' as any,
      adminId: user.id,
      metadata: {
        oldValue: oldSetting?.value,
        newValue: value,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

