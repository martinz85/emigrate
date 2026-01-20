/**
 * E-Book Checkout API
 * Story 7.2: E-Book Checkout
 * 
 * Creates a Stripe Checkout Session for e-book purchases.
 * Supports single e-books and bundles.
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
  ebookId: z.string().uuid('Ungültige E-Book ID'),
})

// App URLs
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

    // Parse and validate request body
    const body = await request.json()
    const parseResult = checkoutSchema.safeParse(body)
    
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(e => e.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { ebookId } = parseResult.data

    // Get Supabase clients
    const supabaseAuth = await createClient()
    const supabaseAdmin = createAdminClient()

    // Check if user is logged in
    const { data: { user } } = await supabaseAuth.auth.getUser()

    // Check if user is PRO (if logged in)
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_tier === 'pro') {
        return NextResponse.json(
          { error: 'Als PRO-User hast du bereits Zugang zu allen E-Books.' },
          { status: 400 }
        )
      }

      // Check if user already owns this ebook
      const { data: existingPurchase } = await (supabaseAdmin as any)
        .from('user_ebooks')
        .select('id')
        .eq('user_id', user.id)
        .eq('ebook_id', ebookId)
        .maybeSingle()

      if (existingPurchase) {
        return NextResponse.json(
          { error: 'Du besitzt dieses E-Book bereits.' },
          { status: 400 }
        )
      }
    }

    // Fetch e-book from database
    const { data: ebook, error: ebookError } = await (supabaseAdmin as any)
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    if (ebookError || !ebook) {
      console.error('E-Book not found:', ebookError)
      return NextResponse.json(
        { error: 'E-Book nicht gefunden' },
        { status: 404 }
      )
    }

    // Validate e-book has a Stripe price
    if (!ebook.stripe_price_id) {
      console.error('E-Book has no Stripe price:', ebook.id)
      return NextResponse.json(
        { error: 'E-Book ist nicht zum Kauf verfügbar' },
        { status: 400 }
      )
    }

    // Check price is > 0
    if (ebook.price <= 0) {
      // Free e-book - grant access directly without checkout
      if (user) {
        await (supabaseAdmin as any)
          .from('user_ebooks')
          .insert({
            user_id: user.id,
            ebook_id: ebook.id,
            amount: 0,
          })
        
        return NextResponse.json({
          success: true,
          message: 'Kostenloses E-Book freigeschaltet',
          redirectUrl: '/ebooks/success?free=true',
        })
      } else {
        return NextResponse.json(
          { error: 'Bitte logge dich ein, um das kostenlose E-Book zu erhalten.' },
          { status: 401 }
        )
      }
    }

    // Create Stripe Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: ebook.stripe_price_id,
          quantity: 1,
        },
      ],
      metadata: {
        type: 'ebook',
        ebook_id: ebook.id,
        ebook_slug: ebook.slug,
        is_bundle: ebook.is_bundle ? 'true' : 'false',
        user_id: user?.id || 'guest',
        priceUsed: String(ebook.price),
      },
      success_url: `${BASE_URL}/ebooks/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/ebooks`,
      // Allow promotion codes
      allow_promotion_codes: true,
    }

    // Add customer email if user is logged in
    if (user?.email) {
      sessionConfig.customer_email = user.email
    }

    // If bundle, add bundle_items to metadata
    if (ebook.is_bundle && ebook.bundle_items) {
      sessionConfig.metadata!.bundle_items = JSON.stringify(ebook.bundle_items)
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log(`✅ E-Book checkout session created: ${session.id} for ebook: ${ebook.slug}`)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('E-Book checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}

