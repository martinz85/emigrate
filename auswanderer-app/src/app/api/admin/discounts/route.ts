import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * Admin API: Create Discount Code
 */
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
    const { code, discountPercent, validFrom, validUntil, maxUses } = await request.json()

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code ist erforderlich' }, { status: 400 })
    }

    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: 'Rabatt muss zwischen 1-100% sein' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if code already exists
    const { data: existing } = await supabase
      .from('discount_codes')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Dieser Code existiert bereits' }, { status: 400 })
    }

    // Create discount code
    const { error: insertError } = await supabase
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(),
        discount_percent: discountPercent,
        valid_from: validFrom || null,
        valid_until: validUntil || null,
        max_uses: maxUses || null,
        current_uses: 0,
      })

    if (insertError) {
      console.error('Error creating discount:', insertError)
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
    }

    console.log(`[AUDIT] Discount code ${code} created by admin ${user.id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Discount creation error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}

