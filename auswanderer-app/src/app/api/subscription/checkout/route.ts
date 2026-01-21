/**
 * Subscription Checkout API
 * Story 8.2: Subscription Checkout
 * 
 * Creates a Stripe Checkout Session for PRO subscription.
 * Supports monthly and yearly billing cycles.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// Validation schema
const checkoutSchema = z.object({
  billing: z.enum(['monthly', 'yearly']),
})

// App URLs
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Price IDs from environment
const PRICE_IDS = {
  monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
}

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe is configured
    if (!stripe) {
      console.error('Stripe not configured')
      return NextResponse.json(
        { error: 'Zahlungssystem nicht konfiguriert' },
        { status: 503 }
      )
    }

    // Validate price IDs are configured
    if (!PRICE_IDS.monthly || !PRICE_IDS.yearly) {
      console.error('Stripe PRO price IDs not configured')
      return NextResponse.json(
        { error: 'PRO-Preise nicht konfiguriert' },
        { status: 503 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parseResult = checkoutSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Ungültiger Billing-Zyklus' },
        { status: 400 }
      )
    }

    const { billing } = parseResult.data

    // Get user session - subscription requires auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Bitte logge dich ein, um PRO zu werden.' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Check if user already has active subscription
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier, subscription_status, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'Du bist bereits PRO-Mitglied!' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Select price based on billing cycle
    const priceId = billing === 'yearly' ? PRICE_IDS.yearly : PRICE_IDS.monthly

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        type: 'subscription',
        user_id: user.id,
        billing: billing,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          billing: billing,
        },
      },
      success_url: `${BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/pricing`,
      // Allow promotion codes
      allow_promotion_codes: true,
    })

    console.log(`✅ Subscription checkout session created: ${session.id} for user: ${user.id}, billing: ${billing}`)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}

