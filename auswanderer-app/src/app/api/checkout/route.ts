import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

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

// Fallback product configuration (used if DB not available)
const DEFAULT_ANALYSIS_PRODUCT = {
  name: 'Auswanderungs-Analyse',
  description: 'Deine personalisierte Länderempfehlung mit detaillierter Analyse',
  price: 2999, // 29,99€ in cents
  currency: 'eur',
}

/**
 * Fetch current price from database with fallback
 */
async function getProductPrice(productKey: string = 'analysis') {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('price_config')
      .select('product_name, product_description, regular_price, campaign_price, campaign_active, currency')
      .eq('product_key', productKey)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.warn('Price config not found, using default:', error?.message)
      return DEFAULT_ANALYSIS_PRODUCT
    }

    // Use campaign price if active, otherwise regular price
    const activePrice = data.campaign_active && data.campaign_price 
      ? data.campaign_price 
      : data.regular_price

    return {
      name: data.product_name || DEFAULT_ANALYSIS_PRODUCT.name,
      description: data.product_description || DEFAULT_ANALYSIS_PRODUCT.description,
      price: activePrice,
      regularPrice: data.regular_price,
      currency: data.currency || 'eur',
      isCampaign: data.campaign_active && data.campaign_price !== null,
    }
  } catch (err) {
    console.error('Error fetching price config:', err)
    return DEFAULT_ANALYSIS_PRODUCT
  }
}

// Validate analysisId format (UUID or simple ID)
function isValidAnalysisId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  // Allow UUIDs and simple alphanumeric IDs (including "demo")
  const validPattern = /^[a-zA-Z0-9-]{1,64}$/
  return validPattern.test(id)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisId } = body

    // Input validation
    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId ist erforderlich' },
        { status: 400 }
      )
    }

    if (!isValidAnalysisId(analysisId)) {
      return NextResponse.json(
        { error: 'Ungültige analysisId' },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl()

    // Fetch current price from database
    const productConfig = await getProductPrice('analysis')
    
    console.log(`Checkout: Using price ${productConfig.price / 100}€ (campaign: ${(productConfig as { isCampaign?: boolean }).isCampaign || false})`)

    // CRITICAL: Block mock mode in production
    if (!stripe) {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Stripe not configured in production!')
        return NextResponse.json(
          { error: 'Zahlungssystem nicht verfügbar' },
          { status: 503 }
        )
      }

      // Mock only in development
      console.warn('Stripe not configured - returning mock checkout URL (DEV ONLY)')
      const mockSessionId = `cs_mock_${Date.now()}`
      return NextResponse.json({
        url: `${baseUrl}/checkout/success?session_id=${mockSessionId}&analysisId=${encodeURIComponent(analysisId)}`,
        sessionId: mockSessionId,
        mock: true,
        price: productConfig.price,
      })
    }

    // Create Stripe Checkout Session with dynamic price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: productConfig.currency,
            product_data: {
              name: productConfig.name,
              description: productConfig.description,
            },
            unit_amount: productConfig.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&analysisId=${encodeURIComponent(analysisId)}`,
      cancel_url: `${baseUrl}/ergebnis/${encodeURIComponent(analysisId)}`,
      metadata: {
        analysisId,
        product: 'analysis',
        priceUsed: String(productConfig.price), // Track which price was used
      },
    })

    // FIX: Explicit null check for session.url
    if (!session.url) {
      console.error('Stripe session created but URL is null:', session.id)
      return NextResponse.json(
        { error: 'Checkout-URL konnte nicht erstellt werden' },
        { status: 500 }
      )
    }

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

    // Handle mock sessions for development ONLY
    if (sessionId.startsWith('cs_mock_')) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Ungültige Session' },
          { status: 400 }
        )
      }
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

    // Validate payment status
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Zahlung nicht abgeschlossen' },
        { status: 400 }
      )
    }

    // Validate amount - use price stored in metadata (dynamic pricing support)
    const expectedPrice = session.metadata?.priceUsed 
      ? parseInt(session.metadata.priceUsed, 10) 
      : DEFAULT_ANALYSIS_PRODUCT.price
    
    if (session.amount_total !== expectedPrice) {
      console.error(`Invalid amount in session verification: ${session.amount_total}, expected: ${expectedPrice}`)
      return NextResponse.json(
        { error: 'Ungültiger Zahlungsbetrag' },
        { status: 400 }
      )
    }

    // Validate currency
    if (session.currency?.toLowerCase() !== 'eur') {
      console.error(`Invalid currency in session verification: ${session.currency}`)
      return NextResponse.json(
        { error: 'Ungültige Währung' },
        { status: 400 }
      )
    }

    // FIX: Validate product type from metadata
    if (session.metadata?.product !== 'analysis') {
      console.error(`Invalid product in session: ${session.metadata?.product}`)
      return NextResponse.json(
        { error: 'Ungültiges Produkt' },
        { status: 400 }
      )
    }

    // FIX: Validate mode
    if (session.mode !== 'payment') {
      console.error(`Invalid mode in session: ${session.mode}`)
      return NextResponse.json(
        { error: 'Ungültiger Zahlungsmodus' },
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
