import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import Stripe from 'stripe'

// Initialize Stripe (optional - graceful degradation if not configured)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

/**
 * Admin API: Create Discount Code
 * 
 * Creates both a Supabase record and a Stripe Coupon for checkout integration.
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

    // Validate date formats
    if (validFrom && isNaN(Date.parse(validFrom))) {
      return NextResponse.json({ error: 'Ungültiges Startdatum' }, { status: 400 })
    }

    if (validUntil && isNaN(Date.parse(validUntil))) {
      return NextResponse.json({ error: 'Ungültiges Enddatum' }, { status: 400 })
    }

    // Validate date logic
    if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json({ error: 'Startdatum muss vor Enddatum liegen' }, { status: 400 })
    }

    // Validate maxUses
    if (maxUses !== null && maxUses !== undefined && (typeof maxUses !== 'number' || maxUses < 1)) {
      return NextResponse.json({ error: 'Max. Nutzungen muss mindestens 1 sein' }, { status: 400 })
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

    // Create Stripe Coupon (if Stripe is configured)
    let stripeCouponId: string | null = null
    
    if (stripe) {
      try {
        const coupon = await stripe.coupons.create({
          percent_off: discountPercent,
          duration: 'once',
          id: code.toUpperCase(), // Use code as coupon ID for easy reference
          max_redemptions: maxUses || undefined,
          redeem_by: validUntil 
            ? Math.floor(new Date(validUntil).getTime() / 1000) 
            : undefined,
        })
        stripeCouponId = coupon.id
        console.log(`Stripe coupon created: ${stripeCouponId}`)
      } catch (stripeError) {
        console.error('Stripe coupon creation failed:', stripeError)
        // Continue without Stripe coupon - can be synced later
      }
    } else {
      console.log('Stripe not configured - skipping coupon creation')
    }

    // Create discount code in Supabase
    const { error: insertError } = await supabase
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(),
        discount_percent: discountPercent,
        valid_from: validFrom || null,
        valid_until: validUntil || null,
        max_uses: maxUses || null,
        current_uses: 0,
        stripe_coupon_id: stripeCouponId,
      })

    if (insertError) {
      console.error('Error creating discount:', insertError)
      // Try to cleanup Stripe coupon if DB insert failed
      if (stripe && stripeCouponId) {
        try {
          await stripe.coupons.del(stripeCouponId)
        } catch { /* ignore cleanup errors */ }
      }
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
    }

    // Persist audit log
    await logAuditEvent({
      action: 'DISCOUNT_CREATED',
      targetId: code.toUpperCase(),
      targetType: 'discount_code',
      adminId: user.id,
      metadata: { discountPercent, validFrom, validUntil, maxUses },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Discount creation error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}

