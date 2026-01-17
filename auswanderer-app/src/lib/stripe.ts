// Stripe Payment Integration

export interface CheckoutSession {
  sessionId: string
  checkoutUrl: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number // in cents
  type: 'one_time' | 'recurring'
  interval?: 'month' | 'year'
}

export const PRODUCTS: Record<string, Product> = {
  pdf_single: {
    id: 'pdf_single',
    name: 'Auswanderungsanalyse PDF',
    description: 'Vollständige personalisierte Analyse mit 26 Kriterien',
    price: 3900, // 39 EUR
    type: 'one_time',
  },
  ebook_complete: {
    id: 'ebook_complete',
    name: 'Der komplette Auswanderer-Guide',
    description: 'Ausführlicher Leitfaden, 250+ Seiten',
    price: 1999, // 19.99 EUR
    type: 'one_time',
  },
  ebook_short: {
    id: 'ebook_short',
    name: 'Quick Start Guide',
    description: 'Kurzversion für Eilige, 80 Seiten',
    price: 999, // 9.99 EUR
    type: 'one_time',
  },
  ebook_tips: {
    id: 'ebook_tips',
    name: 'Tips & Tricks',
    description: 'Insider-Wissen von Expats, 120 Seiten',
    price: 1499, // 14.99 EUR
    type: 'one_time',
  },
  ebook_dummies: {
    id: 'ebook_dummies',
    name: 'Auswandern für Dummies',
    description: 'Einsteigerfreundlich erklärt, 100 Seiten',
    price: 1299, // 12.99 EUR
    type: 'one_time',
  },
  ebook_bundle: {
    id: 'ebook_bundle',
    name: 'E-Book Bundle',
    description: 'Alle 4 E-Books im Paket',
    price: 3999, // 39.99 EUR
    type: 'one_time',
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Auswanderer PRO',
    description: 'Unbegrenzte Analysen, alle E-Books, Dashboard & Tools',
    price: 1499, // 14.99 EUR
    type: 'recurring',
    interval: 'month',
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Auswanderer PRO (Jahresabo)',
    description: 'Spare 33%! Alle PRO-Features für ein Jahr',
    price: 11988, // 119.88 EUR (9.99/month)
    type: 'recurring',
    interval: 'year',
  },
}

export async function createCheckoutSession(
  productId: string,
  email: string,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession | null> {
  const product = PRODUCTS[productId]
  
  if (!product) {
    console.error('Product not found:', productId)
    return null
  }

  // In production, this would use Stripe SDK
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  try {
    // Mock checkout session for development
    const mockSessionId = `cs_mock_${Date.now()}`
    
    return {
      sessionId: mockSessionId,
      checkoutUrl: `${successUrl}?session_id=${mockSessionId}&product=${productId}`,
    }

    /* Production Stripe code:
    const session = await stripe.checkout.sessions.create({
      mode: product.type === 'recurring' ? 'subscription' : 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
            recurring: product.type === 'recurring' 
              ? { interval: product.interval } 
              : undefined,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId: product.id,
      },
    })

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
    }
    */
  } catch (error) {
    console.error('Stripe error:', error)
    return null
  }
}

export async function handleWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; eventType?: string }> {
  // In production, verify webhook signature and process events
  
  try {
    /* Production code:
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful payment
        const session = event.data.object
        await fulfillOrder(session)
        break
        
      case 'customer.subscription.created':
        // Handle new PRO subscription
        break
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break
    }
    
    return { success: true, eventType: event.type }
    */
    
    return { success: true }
  } catch (error) {
    console.error('Webhook error:', error)
    return { success: false }
  }
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

