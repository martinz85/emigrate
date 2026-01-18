# Story 4.3: Stripe Webhook Handler

## Meta
- **Epic:** 4 - Payment & Purchase
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 4 Story Points

## User Story
Als System,
möchte ich Zahlungsbestätigungen von Stripe erhalten,
damit ich Käufe verifizieren kann.

## Acceptance Criteria

### AC 1: Webhook Endpoint
**Given** Stripe sendet ein Webhook Event
**When** `/api/webhook` aufgerufen wird
**Then** wird das Event empfangen und verarbeitet

### AC 2: Signatur-Verifizierung
**Given** ein Webhook Event kommt an
**When** die Signatur geprüft wird
**Then** wird nur bei gültiger Signatur verarbeitet
**And** ungültige Requests werden mit 400 abgelehnt

### AC 3: Checkout Completion Handler
**Given** ein `checkout.session.completed` Event kommt an
**When** das Event verarbeitet wird
**Then** wird die `analysisId` aus den Metadata extrahiert
**And** der Kauf wird in der Datenbank gespeichert

### AC 4: Idempotenz
**Given** dasselbe Event wird mehrfach gesendet
**When** es verarbeitet wird
**Then** wird der Kauf nur einmal gespeichert
**And** es gibt keine Duplikate

### AC 5: Response
**Given** das Event erfolgreich verarbeitet wurde
**When** die API antwortet
**Then** wird HTTP 200 zurückgegeben
**And** Stripe markiert den Webhook als erfolgreich

## Technical Notes

### API Route
```typescript
// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const analysisId = session.metadata?.analysisId

    // TODO: Save purchase to Supabase
    // await savePurchase(analysisId, session.id, session.customer_email)
    
    console.log(`Payment successful for analysis: ${analysisId}`)
  }

  return NextResponse.json({ received: true })
}
```

### Webhook Configuration (Stripe Dashboard)
- Endpoint URL: `https://your-domain.com/api/webhook`
- Events: `checkout.session.completed`

### Environment Variables
- `STRIPE_WEBHOOK_SECRET` - Webhook Signing Secret

### Database Schema (für später)
```sql
-- purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Local Testing
```bash
# Stripe CLI für lokales Webhook Testing
stripe listen --forward-to localhost:3000/api/webhook
```

## Dependencies
- Story 4.1 (Checkout Session mit Metadata)
- Stripe SDK
- (Optional) Supabase für Persistenz

## Out of Scope
- Refund Handling
- Subscription Management
- Email-Benachrichtigungen

## Definition of Done
- [ ] Webhook Route `/api/webhook` implementiert
- [ ] Signatur-Verifizierung funktioniert
- [ ] `checkout.session.completed` wird verarbeitet
- [ ] analysisId wird korrekt extrahiert
- [ ] Logging für erfolgreiche Zahlungen
- [ ] 400 Response bei ungültiger Signatur
- [ ] 200 Response bei erfolgreicher Verarbeitung
- [ ] (Optional) Supabase Integration vorbereitet

