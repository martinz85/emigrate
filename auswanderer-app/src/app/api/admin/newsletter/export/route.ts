import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * Admin API: Export Newsletter Subscribers
 * 
 * Supports CSV and JSON formats for Odoo/Mailchimp integration.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

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

  // Build query
  let query = supabase
    .from('newsletter_subscribers')
    .select('email, opted_in_at, source, language')
    .order('opted_in_at', { ascending: false })

  if (from) query = query.gte('opted_in_at', from)
  if (to) query = query.lte('opted_in_at', to)

  const { data, error } = await query

  if (error) {
    console.error('Newsletter export error:', error)
    return NextResponse.json({ error: 'Export fehlgeschlagen' }, { status: 500 })
  }

  console.log(`[AUDIT] Newsletter export (${format}) by admin ${user.id}, ${data?.length || 0} records`)

  if (format === 'json') {
    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      count: data?.length || 0,
      subscribers: data,
    })
  }

  // CSV format
  const csvLines = [
    'email,opted_in_at,source,language',
    ...(data || []).map(row => 
      `${escapeCSV(row.email)},${row.opted_in_at},${row.source || ''},${row.language || 'de'}`
    )
  ]

  const csv = csvLines.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="newsletter-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

