import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// Base URL for redirects
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

// Product configuration
const ANALYSIS_PRODUCT = {
  name: 'Auswanderungs-Analyse',
  description: 'Deine personalisierte Länderempfehlung mit detaillierter Analyse',
  price: 2999, // 29,99€ in cents
  currency: 'eur',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisId } = body

    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId ist erforderlich' },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl()

    // If Stripe is not configured, return mock URL for development
    if (!stripe) {
      console.warn('Stripe not configured - returning mock checkout URL')
      const mockSessionId = `cs_mock_${Date.now()}`
      return NextResponse.json({
        url: `${baseUrl}/checkout/success?session_id=${mockSessionId}&analysisId=${analysisId}`,
        sessionId: mockSessionId,
        mock: true,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: ANALYSIS_PRODUCT.currency,
            product_data: {
              name: ANALYSIS_PRODUCT.name,
              description: ANALYSIS_PRODUCT.description,
            },
            unit_amount: ANALYSIS_PRODUCT.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/ergebnis/${encodeURIComponent(analysisId)}`,
      metadata: {
        analysisId,
        product: 'analysis',
      },
      // Optional: Pre-fill customer email if available
      // customer_email: email,
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe Fehler: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Checkout konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify a session (for success page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id ist erforderlich' },
        { status: 400 }
      )
    }

    // Handle mock sessions for development
    if (sessionId.startsWith('cs_mock_')) {
      const analysisId = searchParams.get('analysisId') || 'demo'
      return NextResponse.json({
        verified: true,
        analysisId,
        mock: true,
      })
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe nicht konfiguriert' },
        { status: 500 }
      )
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Zahlung nicht abgeschlossen' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      verified: true,
      analysisId: session.metadata?.analysisId,
      customerEmail: session.customer_details?.email,
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Session konnte nicht verifiziert werden' },
      { status: 500 }
    )
  }
}
