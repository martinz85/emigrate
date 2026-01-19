import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

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
          // Return 500 so Stripe retries the webhook
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

// Expected payment configuration
const EXPECTED_AMOUNT = 2999 // 29,99€ in cents
const EXPECTED_CURRENCY = 'eur'

/**
 * Handle successful checkout completion
 * Validates payment details and updates Supabase
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const analysisId = session.metadata?.analysisId
  const customerEmail = session.customer_details?.email
  const amountTotal = session.amount_total
  const paymentStatus = session.payment_status
  const currency = session.currency

  // Mask PII in production logs (DSGVO compliance)
  const maskedEmail = customerEmail 
    ? (process.env.NODE_ENV === 'production' 
        ? `${customerEmail.substring(0, 2)}***@***` 
        : customerEmail)
    : 'N/A'

  console.log('=== Checkout Session Completed ===')
  console.log(`Session ID: ${session.id}`)
  console.log(`Analysis ID: ${analysisId}`)
  console.log(`Customer Email: ${maskedEmail}`)
  console.log(`Amount: ${amountTotal ? amountTotal / 100 : 0} ${currency?.toUpperCase() || 'EUR'}`)
  console.log(`Payment Status: ${paymentStatus}`)
  console.log('==================================')

  // Validate payment status
  if (paymentStatus !== 'paid') {
    console.error(`Payment not completed. Status: ${paymentStatus}`)
    throw new Error(`Invalid payment status: ${paymentStatus}`)
  }

  // Validate amount (prevent underpayment attacks)
  if (amountTotal !== EXPECTED_AMOUNT) {
    console.error(`Invalid amount: ${amountTotal}, expected: ${EXPECTED_AMOUNT}`)
    throw new Error(`Invalid payment amount: ${amountTotal}`)
  }

  // Validate currency
  if (currency?.toLowerCase() !== EXPECTED_CURRENCY) {
    console.error(`Invalid currency: ${currency}, expected: ${EXPECTED_CURRENCY}`)
    throw new Error(`Invalid currency: ${currency}`)
  }

  if (!analysisId) {
    console.error('No analysisId in session metadata')
    throw new Error('Missing analysisId in metadata')
  }

  // Update analysis in Supabase
  const supabase = createAdminClient()

  const { error: updateError } = await supabase
    .from('analyses')
    .update({ 
      paid: true, 
      paid_at: new Date().toISOString(),
      stripe_session_id: session.id,
    })
    .eq('id', analysisId)

  if (updateError) {
    console.error('Failed to update analysis in Supabase:', updateError)
    throw updateError
  }

  console.log(`✅ Analysis ${analysisId} marked as paid in Supabase`)

  // TODO: Send confirmation email (Epic 9 - Pre-Launch Required)
  // See: _bmad-output/planning-artifacts/epics.md (Epic 9)
  // Implementation:
  // - Use Resend or Postmark for transactional emails
  // - Email should contain: Analyse-Link, PDF-Download-Link, Kaufnachweis
  // - DSGVO: Transaktions-Mails benoetigen kein Opt-in
  //
  // await sendPurchaseConfirmationEmail({
  //   to: customerEmail,
  //   analysisId,
  //   downloadLink: `${baseUrl}/ergebnis/${analysisId}`,
  //   pdfLink: `${baseUrl}/api/pdf/${analysisId}`,
  //   purchaseDate: new Date(),
  //   amount: amountTotal / 100,
  // })
}
