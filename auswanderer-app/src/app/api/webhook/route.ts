import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail, PurchaseConfirmationEmail, EbookPurchaseConfirmationEmail } from '@/lib/email'
import { 
  insertGuestPurchase, 
  getEbooksBySlugs, 
  upsertUserEbook,
  insertUserEbookIfNotExists,
  getWebhookEvent,
  insertWebhookEvent,
  updateWebhookEvent,
} from '@/lib/supabase/ebooks-queries'

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * Stripe Webhook Handler
 * Receives and processes payment events from Stripe
 * 
 * Supports:
 * - Analysis purchases (product: 'analysis')
 * - E-Book purchases (type: 'ebook') - Story 7.2
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

    // ============================================
    // IDEMPOTENCY CHECK: Prevent duplicate processing
    // ============================================
    const supabase = createAdminClient()
    
    // Check if this event was already processed
    const { data: existingEvent } = await getWebhookEvent(supabase, event.id)

    if (existingEvent) {
      console.log(`⚠️ Duplicate webhook event ${event.id} - already processed (${existingEvent.status})`)
      return NextResponse.json({ 
        received: true, 
        duplicate: true,
        original_status: existingEvent.status 
      })
    }

    // Record the event BEFORE processing (to handle race conditions)
    const { error: insertError } = await insertWebhookEvent(supabase, {
      id: event.id,
      event_type: event.type,
      status: 'processing',
    })

    if (insertError) {
      // If insert fails due to unique constraint, another process is handling it
      const errorCode = (insertError as any)?.code
      if (errorCode === '23505') { // unique_violation
        console.log(`⚠️ Concurrent webhook processing detected for ${event.id}`)
        return NextResponse.json({ received: true, concurrent: true })
      }
      console.error('Failed to record webhook event:', insertError)
      // Continue processing anyway - don't fail due to logging issues
    }

    // Handle the event
    let processingError: Error | null = null

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        try {
          await handleCheckoutCompleted(session)
        } catch (dbError) {
          processingError = dbError instanceof Error ? dbError : new Error(String(dbError))
          console.error('Database error processing checkout:', dbError)
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

      // ============================================
      // SUBSCRIPTION EVENTS - Story 8.2
      // ============================================
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        try {
          await handleSubscriptionUpdate(subscription)
        } catch (subError) {
          processingError = subError instanceof Error ? subError : new Error(String(subError))
          console.error('Error processing subscription update:', subError)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        try {
          await handleSubscriptionCanceled(subscription)
        } catch (subError) {
          processingError = subError instanceof Error ? subError : new Error(String(subError))
          console.error('Error processing subscription cancellation:', subError)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        try {
          await handleInvoicePaymentFailed(invoice)
        } catch (subError) {
          processingError = subError instanceof Error ? subError : new Error(String(subError))
          console.error('Error processing failed invoice:', subError)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Update event status after processing
    await updateWebhookEvent(supabase, event.id, {
      status: processingError ? 'failed' : 'success',
      error_message: processingError?.message,
      processed_at: new Date().toISOString(),
    })

    // If processing failed, return 500 so Stripe retries
    if (processingError) {
      return NextResponse.json(
        { error: 'Processing failed, please retry' },
        { status: 500 }
      )
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

// Payment configuration
const FALLBACK_AMOUNT = 2999 // 29,99€ fallback if metadata missing
const MINIMUM_AMOUNT = 100 // 1€ minimum (for discount edge cases)
const EXPECTED_CURRENCY = 'eur'

/**
 * Handle successful checkout completion
 * Routes to appropriate handler based on product type
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const productType = session.metadata?.type || session.metadata?.product
  
  console.log('=== Checkout Session Completed ===')
  console.log(`Session ID: ${session.id}`)
  console.log(`Product Type: ${productType}`)
  console.log(`Payment Status: ${session.payment_status}`)
  console.log('==================================')

  // Validate payment status
  if (session.payment_status !== 'paid') {
    console.error(`Payment not completed. Status: ${session.payment_status}`)
    throw new Error(`Invalid payment status: ${session.payment_status}`)
  }

  // Route to appropriate handler
  switch (productType) {
    case 'analysis':
      await handleAnalysisPurchase(session)
      break
    case 'ebook':
      await handleEbookPurchase(session)
      break
    default:
      console.error(`Unknown product type: ${productType}`)
      throw new Error(`Unknown product type: ${productType}`)
  }
}

/**
 * Handle Analysis Purchase
 * Original handler for analysis payments
 */
async function handleAnalysisPurchase(session: Stripe.Checkout.Session) {
  const analysisId = session.metadata?.analysisId
  const customerEmail = session.customer_details?.email
  const amountTotal = session.amount_total
  const currency = session.currency

  // CRITICAL: Use price from metadata (set at checkout creation) for validation
  const expectedPrice = session.metadata?.priceUsed 
    ? parseInt(session.metadata.priceUsed, 10) 
    : FALLBACK_AMOUNT

  // Mask PII in production logs (DSGVO compliance)
  const maskedEmail = maskEmail(customerEmail)

  console.log(`Analysis ID: ${analysisId}`)
  console.log(`Customer Email: ${maskedEmail}`)
  console.log(`Amount: ${amountTotal ? amountTotal / 100 : 0} ${currency?.toUpperCase() || 'EUR'}`)

  // Validate payment mode
  if (session.mode !== 'payment') {
    throw new Error(`Invalid payment mode: ${session.mode}`)
  }

  // Validate amount
  validatePaymentAmount(amountTotal, expectedPrice, session.total_details?.amount_discount || 0)

  // Validate currency
  if (currency?.toLowerCase() !== EXPECTED_CURRENCY) {
    throw new Error(`Invalid currency: ${currency}`)
  }

  if (!analysisId) {
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

  // Fetch analysis result for email content
  const { data: analysis } = await supabase
    .from('analyses')
    .select('result')
    .eq('id', analysisId)
    .single()

  const result = analysis?.result as {
    topCountry?: string
    matchPercentage?: number
  } | null

  // Send confirmation email (non-blocking)
  if (customerEmail) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auswanderer-plattform.de'
      
      await sendEmail({
        to: customerEmail,
        subject: 'Deine Auswanderer-Analyse ist bereit! 🎉',
        react: PurchaseConfirmationEmail({
          customerName: session.customer_details?.name || undefined,
          customerEmail: customerEmail,
          analysisId: analysisId,
          topCountry: result?.topCountry || 'Dein Top-Land',
          matchPercentage: result?.matchPercentage || 0,
          purchaseDate: new Date().toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          amount: `${(amountTotal! / 100).toFixed(2).replace('.', ',')} €`,
          resultUrl: `${appUrl}/ergebnis/${analysisId}`,
        }),
      })
      
      console.log(`✅ Confirmation email sent for analysis ${analysisId}`)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }
  }
}

/**
 * Handle E-Book Purchase
 * Story 7.2: E-Book Checkout
 */
async function handleEbookPurchase(session: Stripe.Checkout.Session) {
  const ebookId = session.metadata?.ebook_id
  const ebookSlug = session.metadata?.ebook_slug
  const isBundle = session.metadata?.is_bundle === 'true'
  const bundleItems = session.metadata?.bundle_items
  const userId = session.metadata?.user_id
  const customerEmail = session.customer_details?.email
  const amountTotal = session.amount_total
  const currency = session.currency

  const expectedPrice = session.metadata?.priceUsed 
    ? parseInt(session.metadata.priceUsed, 10) 
    : 0

  const maskedEmail = maskEmail(customerEmail)

  console.log(`E-Book ID: ${ebookId}`)
  console.log(`E-Book Slug: ${ebookSlug}`)
  console.log(`Is Bundle: ${isBundle}`)
  console.log(`User ID: ${userId}`)
  console.log(`Customer Email: ${maskedEmail}`)
  console.log(`Amount: ${amountTotal ? amountTotal / 100 : 0} ${currency?.toUpperCase() || 'EUR'}`)

  // Validate payment mode
  if (session.mode !== 'payment') {
    throw new Error(`Invalid payment mode: ${session.mode}`)
  }

  // Validate amount (allow 0 for free ebooks, though shouldn't reach webhook)
  if (expectedPrice > 0) {
    validatePaymentAmount(amountTotal, expectedPrice, session.total_details?.amount_discount || 0)
  }

  // Validate currency
  if (currency?.toLowerCase() !== EXPECTED_CURRENCY) {
    throw new Error(`Invalid currency: ${currency}`)
  }

  if (!ebookId) {
    throw new Error('Missing ebook_id in metadata')
  }

  const supabase = createAdminClient()

  // Handle guest purchases - need to create or find user by email
  let finalUserId: string | null | undefined = userId
  if (!finalUserId || finalUserId === 'guest') {
    if (!customerEmail) {
      throw new Error('No user ID and no email for guest purchase')
    }

    // Try to find existing user by email
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle()

    if (existingUser) {
      finalUserId = existingUser.id
      console.log(`Found existing user by email: ${finalUserId}`)
    } else {
      // Guest purchase without account - store with null user_id
      // They can claim it later by logging in with the same email
      console.log(`Guest purchase - will store with email: ${maskedEmail}`)
      finalUserId = null
    }
  }

  // Insert purchase record(s)
  if (isBundle && bundleItems) {
    // Bundle purchase - grant access to all included ebooks
    const items = JSON.parse(bundleItems) as string[]
    
    // Get ebook IDs from slugs
    const { data: ebooks } = await getEbooksBySlugs(supabase, items)

    if (!ebooks || ebooks.length === 0) {
      console.error('Bundle items not found:', items)
      throw new Error('Bundle items not found')
    }

    // Insert bundle purchase (the main bundle ebook)
    if (finalUserId) {
      await upsertUserEbook(supabase, {
        user_id: finalUserId,
        ebook_id: ebookId,
        stripe_session_id: session.id,
        stripe_payment_id: session.payment_intent as string || undefined,
        amount: amountTotal || 0,
      })

      // Insert individual ebooks from bundle (don't overwrite existing Einzelkäufe)
      let newEbooks = 0
      let alreadyOwned = 0
      for (const ebook of ebooks) {
        const { alreadyOwned: owned } = await insertUserEbookIfNotExists(supabase, {
          user_id: finalUserId,
          ebook_id: ebook.id,
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string || undefined,
          amount: 0, // Individual items in bundle have 0 cost
        })
        if (owned) {
          alreadyOwned++
        } else {
          newEbooks++
        }
      }

      console.log(`✅ Bundle purchase recorded: ${newEbooks} new ebooks, ${alreadyOwned} already owned for user ${finalUserId}`)
    } else if (customerEmail) {
      // Guest bundle purchase - store for later claiming
      // Store the main bundle
      await insertGuestPurchase(supabase, {
        email: customerEmail,
        ebook_id: ebookId,
        stripe_session_id: session.id,
        stripe_payment_id: session.payment_intent as string || undefined,
        amount: amountTotal || 0,
      })

      // Store individual ebooks from bundle
      for (const ebook of ebooks) {
        await insertGuestPurchase(supabase, {
          email: customerEmail,
          ebook_id: ebook.id,
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string || undefined,
          amount: 0,
        })
      }

      console.log(`✅ Guest bundle purchase stored for ${maskedEmail} - will be claimed on signup`)
    }
  } else {
    // Single ebook purchase
    if (finalUserId) {
      const { error: insertError } = await upsertUserEbook(supabase, {
        user_id: finalUserId,
        ebook_id: ebookId,
        stripe_session_id: session.id,
        stripe_payment_id: session.payment_intent as string || undefined,
        amount: amountTotal || 0,
      })

      if (insertError) {
        console.error('Failed to insert ebook purchase:', insertError)
        throw insertError
      }

      console.log(`✅ E-Book purchase recorded: ${ebookSlug} for user ${finalUserId}`)
    } else if (customerEmail) {
      // Guest ebook purchase - store for later claiming
      await insertGuestPurchase(supabase, {
        email: customerEmail,
        ebook_id: ebookId,
        stripe_session_id: session.id,
        stripe_payment_id: session.payment_intent as string || undefined,
        amount: amountTotal || 0,
      })

      console.log(`✅ Guest ebook purchase stored for ${maskedEmail} - will be claimed on signup`)
    }
  }

  // Send confirmation email (non-blocking)
  if (customerEmail) {
    try {
      // Fetch ebook details
      const { data: ebook } = await (supabase as any)
        .from('ebooks')
        .select('title, emoji, pdf_path')
        .eq('id', ebookId)
        .single()

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auswanderer-plattform.de'
      const dashboardUrl = `${appUrl}/dashboard/ebooks`
      
      // Generate download URL (7 days validity for email)
      let downloadUrl = dashboardUrl // Fallback to dashboard
      if (ebook?.pdf_path) {
        const { data: signedUrlData } = await supabase.storage
          .from('ebooks')
          .createSignedUrl(ebook.pdf_path, 7 * 24 * 3600, {
            download: `${ebookSlug}.pdf`,
          })
        if (signedUrlData?.signedUrl) {
          downloadUrl = signedUrlData.signedUrl
        }
      }

      await sendEmail({
        to: customerEmail,
        subject: isBundle 
          ? '📚 Dein E-Book Bundle ist bereit!'
          : `📚 Dein E-Book "${ebook?.title || 'E-Book'}" ist bereit!`,
        react: EbookPurchaseConfirmationEmail({
          customerName: session.customer_details?.name || undefined,
          customerEmail: customerEmail,
          ebookTitle: ebook?.title || ebookSlug || 'E-Book',
          ebookEmoji: ebook?.emoji || '📚',
          isBundle: isBundle,
          purchaseDate: new Date().toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          amount: `${(amountTotal! / 100).toFixed(2).replace('.', ',')} €`,
          downloadUrl: downloadUrl,
          dashboardUrl: dashboardUrl,
        }),
      })
      
      console.log(`✅ E-Book confirmation email sent to ${maskedEmail}`)
    } catch (emailError) {
      console.error('Failed to send ebook confirmation email:', emailError)
    }
  }
}

/**
 * Helper: Mask email for DSGVO-compliant logging
 */
function maskEmail(email: string | null | undefined): string {
  if (!email) return 'N/A'
  if (process.env.NODE_ENV !== 'production') return email
  
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***@***'
  
  const maskedLocal = local.substring(0, 2) + '***'
  const domainParts = domain.split('.')
  const maskedDomain = '***.' + (domainParts[domainParts.length - 1] || 'com')
  return `${maskedLocal}@${maskedDomain}`
}

/**
 * Helper: Validate payment amount with discount support
 */
function validatePaymentAmount(
  amountTotal: number | null,
  expectedPrice: number,
  discountApplied: number
): void {
  if (!amountTotal || amountTotal < MINIMUM_AMOUNT) {
    throw new Error(`Payment amount too low: ${amountTotal}`)
  }

  if (amountTotal !== expectedPrice) {
    const amountBeforeDiscount = amountTotal + discountApplied
    
    if (amountBeforeDiscount !== expectedPrice) {
      throw new Error(`Invalid payment amount: ${amountTotal}, expected: ${expectedPrice}`)
    }
    console.log(`Discount applied: ${discountApplied / 100}€ (original: ${expectedPrice / 100}€)`)
  }
}

// ============================================
// SUBSCRIPTION HANDLERS - Story 8.2
// ============================================

/**
 * Handle subscription created or updated
 * Updates user profile with subscription details
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()
  
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const status = subscription.status
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()
  
  // Get billing from metadata or infer from interval
  const billing = subscription.metadata?.billing || 
    (subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly')

  console.log('=== Subscription Update ===')
  console.log(`Subscription ID: ${subscriptionId}`)
  console.log(`Customer ID: ${customerId}`)
  console.log(`Status: ${status}`)
  console.log(`Billing: ${billing}`)
  console.log(`Period End: ${periodEnd}`)
  console.log('===========================')

  // Find user by Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (profileError || !profile) {
    // Try to find by user_id in subscription metadata
    const userId = subscription.metadata?.user_id
    if (userId) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: subscriptionId,
          subscription_status: status,
          subscription_tier: status === 'active' || status === 'trialing' ? 'pro' : 'free',
          subscription_period_end: periodEnd,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update subscription by user_id:', updateError)
        throw updateError
      }
      console.log(`✅ Subscription updated for user ${userId} via metadata`)
      return
    }

    console.error('No profile found for customer:', customerId)
    throw new Error(`No profile found for customer: ${customerId}`)
  }

  // Update profile with subscription details
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      subscription_tier: status === 'active' || status === 'trialing' ? 'pro' : 'free',
      subscription_period_end: periodEnd,
    })
    .eq('id', profile.id)

  if (updateError) {
    console.error('Failed to update subscription:', updateError)
    throw updateError
  }

  console.log(`✅ Subscription ${status} for user ${profile.id} (${maskEmail(profile.email)})`)
}

/**
 * Handle subscription canceled/deleted
 * Downgrades user to free tier
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()
  
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  console.log('=== Subscription Canceled ===')
  console.log(`Subscription ID: ${subscriptionId}`)
  console.log(`Customer ID: ${customerId}`)
  console.log('=============================')

  // Find user by subscription ID or customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
    .maybeSingle()

  if (profileError || !profile) {
    console.error('No profile found for canceled subscription:', subscriptionId)
    // Don't throw - subscription might have been from a different system
    return
  }

  // Downgrade to free
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_tier: 'free',
      // Keep subscription_id and period_end for reference
    })
    .eq('id', profile.id)

  if (updateError) {
    console.error('Failed to downgrade subscription:', updateError)
    throw updateError
  }

  console.log(`✅ Subscription canceled - user ${profile.id} downgraded to free`)

  // TODO: Send cancellation email (optional)
}

/**
 * Handle failed invoice payment
 * Marks subscription as past_due
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createAdminClient()
  
  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string | null

  console.log('=== Invoice Payment Failed ===')
  console.log(`Invoice ID: ${invoice.id}`)
  console.log(`Customer ID: ${customerId}`)
  console.log(`Subscription ID: ${subscriptionId}`)
  console.log('==============================')

  if (!subscriptionId) {
    // Not a subscription invoice - might be a one-time payment
    console.log('Invoice is not for a subscription, skipping')
    return
  }

  // Find user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
    .maybeSingle()

  if (profileError || !profile) {
    console.error('No profile found for failed invoice:', invoice.id)
    return
  }

  // Mark as past_due (user keeps PRO access until Stripe cancels)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', profile.id)

  if (updateError) {
    console.error('Failed to update subscription status:', updateError)
    throw updateError
  }

  console.log(`⚠️ Payment failed - subscription marked as past_due for user ${profile.id}`)

  // TODO: Send payment failed email
}
