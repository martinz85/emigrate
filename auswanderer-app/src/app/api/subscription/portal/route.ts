/**
 * Stripe Customer Portal API
 * Story 8.3: Subscription Management
 * 
 * Creates a Stripe Customer Portal session for managing payment methods,
 * viewing invoices, and other billing actions.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// App URL
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Keine Zahlungsinformationen gefunden' },
        { status: 404 }
      )
    }

    // Create Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${BASE_URL}/dashboard/subscription`,
    })

    console.log(`✅ Customer Portal session created for user ${user.id}`)

    return NextResponse.json({
      url: session.url,
    })

  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { error: 'Portal konnte nicht geöffnet werden' },
      { status: 500 }
    )
  }
}

