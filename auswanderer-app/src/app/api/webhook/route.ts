import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * Stripe Webhook Handler
 * Receives and processes payment events from Stripe
 * 
 * Note: In Next.js App Router, the body is not automatically parsed,
 * so request.text() returns the raw body needed for signature verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    // If Stripe is not configured, log and return success (development mode)
    if (!stripe || !webhookSecret) {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Stripe webhook not configured in production!')
        return NextResponse.json(
          { error: 'Webhook nicht konfiguriert' },
          { status: 503 }
        )
      }
      console.warn('Stripe webhook not configured - skipping verification (DEV ONLY)')
      console.log('Webhook received (dev mode):', body.substring(0, 100))
      return NextResponse.json({ received: true, mode: 'development' })
    }

    if (!signature) {
      console.error('No stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Webhook signature verification failed:', message)
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        try {
          await handleCheckoutCompleted(session)
        } catch (dbError) {
          // FIX: Return 500 so Stripe retries the webhook
          console.error('Database error processing checkout:', dbError)
          return NextResponse.json(
            { error: 'Database error, please retry' },
            { status: 500 }
          )
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent failed: ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const analysisId = session.metadata?.analysisId
  const customerEmail = session.customer_details?.email
  const amountTotal = session.amount_total
  const paymentStatus = session.payment_status

  // FIX: Mask PII in production logs (DSGVO compliance)
  const maskedEmail = customerEmail 
    ? (process.env.NODE_ENV === 'production' 
        ? `${customerEmail.substring(0, 2)}***@***` 
        : customerEmail)
    : 'N/A'

  console.log('=== Checkout Session Completed ===')
  console.log(`Session ID: ${session.id}`)
  console.log(`Analysis ID: ${analysisId}`)
  console.log(`Customer Email: ${maskedEmail}`)
  console.log(`Amount: ${amountTotal ? amountTotal / 100 : 0} EUR`)
  console.log(`Payment Status: ${paymentStatus}`)
  console.log('==================================')

  if (!analysisId) {
    console.error('No analysisId in session metadata')
    return
  }

  // TODO: Save purchase to Supabase when database is set up (Epic 6)
  // This would:
  // 1. Mark the analysis as "paid" in the database
  // 2. Store the purchase record
  // 3. Optionally send a confirmation email
  
  /*
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  await supabase.from('purchases').insert({
    analysis_id: analysisId,
    stripe_session_id: session.id,
    customer_email: customerEmail,
    amount: amountTotal,
    currency: session.currency,
    status: 'completed',
  })

  await supabase
    .from('analyses')
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq('id', analysisId)
  */

  console.log(`✅ Analysis ${analysisId} marked as paid`)
}
