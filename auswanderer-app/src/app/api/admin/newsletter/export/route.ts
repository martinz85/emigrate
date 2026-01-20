import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

/**
 * Admin API: Export Newsletter Subscribers
 * 
 * Supports CSV and JSON formats for Odoo/Mailchimp integration.
 * Limited to MAX_EXPORT_SIZE to prevent memory issues.
 */

const MAX_EXPORT_SIZE = 10000 // Limit to prevent memory issues

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Validate date filters
  if (from && isNaN(Date.parse(from))) {
    return NextResponse.json({ error: 'Ungültiges Von-Datum' }, { status: 400 })
  }
  if (to && isNaN(Date.parse(to))) {
    return NextResponse.json({ error: 'Ungültiges Bis-Datum' }, { status: 400 })
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

  // Build query with pagination limit
  let query = supabase
    .from('newsletter_subscribers')
    .select('email, opted_in_at, source, unsubscribed_at', { count: 'exact' })
    .order('opted_in_at', { ascending: false })
    .limit(MAX_EXPORT_SIZE)

  if (from) query = query.gte('opted_in_at', from)
  if (to) query = query.lte('opted_in_at', to)

  const { data, count, error } = await query

  // Check if export was truncated
  const isTruncated = count !== null && count > MAX_EXPORT_SIZE

  if (error) {
    console.error('Newsletter export error:', error)
    return NextResponse.json({ error: 'Export fehlgeschlagen' }, { status: 500 })
  }

  // Persist audit log
  await logAuditEvent({
    action: 'NEWSLETTER_EXPORTED',
    targetType: 'newsletter',
    adminId: user.id,
    metadata: { format, recordCount: data?.length || 0, from, to },
  })

  if (format === 'json') {
    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      count: data?.length || 0,
      totalCount: count || data?.length || 0,
      truncated: isTruncated,
      warning: isTruncated 
        ? `Export limitiert auf ${MAX_EXPORT_SIZE} von ${count} Abonnenten. Nutze Datumsfilter für vollständigen Export.`
        : null,
      subscribers: data,
    })
  }

  // CSV format - escape ALL fields to prevent CSV injection
  const csvLines = [
    'email,opted_in_at,source,status',
    ...(data || []).map(row => 
      `${escapeCSV(row.email)},${escapeCSV(row.opted_in_at || '')},${escapeCSV(row.source || '')},${escapeCSV(row.unsubscribed_at ? 'unsubscribed' : 'active')}`
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

/**
 * Escape CSV value to prevent formula injection and handle special chars.
 * 
 * Security: Prefixes dangerous characters (=, +, -, @, tab, carriage return)
 * with a single quote to prevent Excel/Sheets formula injection.
 * 
 * @see https://owasp.org/www-community/attacks/CSV_Injection
 */
function escapeCSV(value: string): string {
  if (!value) return ''
  
  let escaped = value
  
  // Prevent CSV formula injection: prefix dangerous leading chars with single quote
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r']
  if (dangerousChars.some(char => escaped.startsWith(char))) {
    escaped = "'" + escaped
  }
  
  // Standard CSV escaping: wrap in quotes if contains comma, quote, or newline
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped.replace(/"/g, '""')}"`
  }
  
  return escaped
}

