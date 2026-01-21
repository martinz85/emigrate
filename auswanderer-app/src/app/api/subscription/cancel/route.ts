/**
 * Cancel Subscription API
 * Story 8.3: Subscription Management
 * 
 * Cancels user's subscription at period end (user keeps access until then).
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

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

    // Get user session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Get user's subscription
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Kein aktives Abo gefunden' },
        { status: 404 }
      )
    }

    // Check if already canceled
    if (profile.subscription_status === 'canceled') {
      return NextResponse.json(
        { error: 'Abo ist bereits gekündigt' },
        { status: 400 }
      )
    }

    // Cancel subscription at period end (user keeps access until then)
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      { cancel_at_period_end: true }
    )

    // Update local status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        // Keep subscription_tier as 'pro' until period_end
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      // Don't fail - Stripe cancellation was successful
    }

    const cancelAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toLocaleDateString('de-DE')
      : new Date(subscription.current_period_end * 1000).toLocaleDateString('de-DE')

    console.log(`✅ Subscription canceled for user ${user.id} - ends at ${cancelAt}`)

    return NextResponse.json({
      success: true,
      cancelAt: cancelAt,
      message: `Dein Abo wurde zum ${cancelAt} gekündigt.`,
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Kündigung konnte nicht durchgeführt werden' },
      { status: 500 }
    )
  }
}

