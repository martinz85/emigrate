import { NextRequest, NextResponse } from 'next/server'
// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productType, email, analysisId } = body

    // Product prices
    const prices: Record<string, number> = {
      pdf: 3900, // 39 EUR in cents
      ebook_complete: 1999,
      ebook_short: 999,
      ebook_tips: 1499,
      ebook_dummies: 1299,
      ebook_bundle: 3999,
      pro_monthly: 1499,
    }

    const price = prices[productType]
    if (!price) {
      return NextResponse.json(
        { error: 'Ungültiges Produkt' },
        { status: 400 }
      )
    }

    // TODO: Create Stripe Checkout Session
    // For now, return mock checkout URL
    
    const mockCheckoutUrl = `/checkout/success?product=${productType}&email=${email}`

    return NextResponse.json({
      success: true,
      checkoutUrl: mockCheckoutUrl,
      // sessionId: session.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout fehlgeschlagen' },
      { status: 500 }
    )
  }
}

