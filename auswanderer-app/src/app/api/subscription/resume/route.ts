/**
 * Resume Subscription API
 * Story 8.3: Subscription Management
 * 
 * Revokes a pending cancellation (user decided to stay).
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
        { error: 'Kein Abo gefunden' },
        { status: 404 }
      )
    }

    // Check if subscription is actually pending cancellation
    if (profile.subscription_status !== 'canceled') {
      return NextResponse.json(
        { error: 'Abo ist nicht gekündigt' },
        { status: 400 }
      )
    }

    // Resume subscription (revoke cancellation)
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      { cancel_at_period_end: false }
    )

    // Check if subscription is still active
    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Abo kann nicht fortgesetzt werden - bitte erneut abonnieren' },
        { status: 400 }
      )
    }

    // Update local status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      // Don't fail - Stripe update was successful
    }

    console.log(`✅ Subscription resumed for user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Dein Abo wurde erfolgreich fortgesetzt!',
    })

  } catch (error) {
    console.error('Resume subscription error:', error)
    return NextResponse.json(
      { error: 'Abo konnte nicht fortgesetzt werden' },
      { status: 500 }
    )
  }
}

