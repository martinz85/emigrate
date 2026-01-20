---
story_id: "8.2"
title: "Subscription Checkout"
epic: "Epic 8 - PRO Subscription"
status: in-progress
created: 2026-01-19
created_by: Bob (SM)
priority: high
estimated_points: 8
depends_on: ["8.1"]
---

# Story 8.2: Subscription Checkout

## User Story

Als Kunde,
möchte ich ein PRO-Abonnement abschließen können,
damit ich Zugang zu allen Premium-Features erhalte.

## Business Context

- **PRD Reference:** Section 5.2.1 - Auswanderer PRO
- **Abhängigkeit:** Story 8.1 (Subscription Plans)
- **Revenue Impact:** MRR (Monthly Recurring Revenue)

## Preise

| Billing | Preis | Ersparnis |
|---------|-------|-----------|
| Monatlich | 14,99€/Monat | - |
| Jährlich | 149,90€/Jahr | 2 Monate gratis |

## Acceptance Criteria

### AC1: PRO Checkout Button
**Given** ich bin auf der Pricing Seite
**When** ich auf "PRO werden" klicke
**Then** werde ich zu Stripe Checkout weitergeleitet
**And** der gewählte Billing-Zyklus ist vorausgewählt

### AC2: Stripe Subscription Session
**Given** ich klicke auf PRO werden
**When** die Checkout Session erstellt wird
**Then** ist mode = 'subscription'
**And** der korrekte Preis (monatlich/jährlich) ist gesetzt
**And** success_url führt zu /dashboard
**And** cancel_url führt zu /pricing

### AC3: Account-Erstellung bei Checkout
**Given** ich bin nicht eingeloggt
**When** ich den PRO Checkout durchführe
**Then** werde ich aufgefordert mich einzuloggen oder zu registrieren
**Or** Stripe erstellt einen Account mit meiner E-Mail

### AC4: Webhook für Subscription
**Given** meine Subscription ist aktiv
**When** Stripe den Webhook sendet (customer.subscription.created)
**Then** wird mein `subscription_tier` auf 'pro' gesetzt
**And** `stripe_subscription_id` wird gespeichert
**And** `subscription_period_end` wird gesetzt

### AC5: Sofortiger PRO-Zugang
**Given** meine Zahlung war erfolgreich
**When** ich zur Success-Seite weitergeleitet werde
**Then** habe ich sofort Zugang zu allen PRO-Features
**And** sehe ich "Willkommen bei PRO!" Nachricht
**And** werde ich zum Dashboard weitergeleitet

### AC6: Billing-Zyklus Auswahl
**Given** ich bin auf der Checkout Seite
**When** ich zwischen Monatlich und Jährlich wähle
**Then** wird der korrekte Preis angezeigt
**And** der Checkout verwendet den gewählten Preis

## Technical Tasks

- [ ] **Task 1: Stripe Subscription Produkt**
  - [ ] PRO Produkt in Stripe erstellen
  - [ ] Monatlicher Preis (14,99€)
  - [ ] Jährlicher Preis (149,90€)
  - [ ] Price IDs speichern

- [ ] **Task 2: Checkout API Route**
  - [ ] Erstelle `/api/subscription/checkout/route.ts`
  - [ ] POST: { billing: 'monthly' | 'yearly' }
  - [ ] Mode: 'subscription'
  - [ ] Auth required (Middleware)

- [ ] **Task 3: Datenbank-Schema erweitern**
  - [ ] `profiles` Tabelle erweitern
  - [ ] Felder: stripe_subscription_id, subscription_status, subscription_period_end

- [ ] **Task 4: Webhook Handler für Subscriptions**
  - [ ] Event: customer.subscription.created
  - [ ] Event: customer.subscription.updated
  - [ ] Event: customer.subscription.deleted
  - [ ] Event: invoice.payment_succeeded
  - [ ] Event: invoice.payment_failed

- [ ] **Task 5: PRO Status Update**
  - [ ] Nach Webhook: profiles.subscription_tier = 'pro'
  - [ ] Stripe Customer ID speichern
  - [ ] Subscription Details speichern

- [ ] **Task 6: Success Page**
  - [ ] Erstelle `/app/subscription/success/page.tsx`
  - [ ] "Willkommen bei PRO!" Message
  - [ ] Redirect zu /dashboard nach 3s

- [ ] **Task 7: Checkout Button Component**
  - [ ] Erstelle `/components/pricing/SubscriptionCheckoutButton.tsx`
  - [ ] Props: billing ('monthly' | 'yearly')
  - [ ] Loading State
  - [ ] Error Handling

- [ ] **Task 8: Auth Gate**
  - [ ] Prüfe ob User eingeloggt vor Checkout
  - [ ] Redirect zu /login mit return_to Parameter

## Dev Notes

### Abhängigkeiten
- Story 8.1: Subscription Plans ✅
- Epic 6: Supabase Auth ✅
- Epic 4: Stripe Integration ✅

### Datenbank-Migration

```sql
-- Profiles erweitern für Subscription
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT; -- 'active', 'canceled', 'past_due'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_billing TEXT; -- 'monthly', 'yearly'
```

### Stripe Checkout Session (Subscription)

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: billing === 'yearly' 
      ? process.env.STRIPE_PRO_YEARLY_PRICE_ID
      : process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    quantity: 1,
  }],
  metadata: {
    user_id: user.id,
    billing: billing,
  },
  success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/pricing`,
  customer_email: user.email,
  // Existing customer if available
  customer: profile.stripe_customer_id || undefined,
})
```

### Webhook Events

```typescript
switch (event.type) {
  case 'customer.subscription.created':
  case 'customer.subscription.updated':
    // Update profile with subscription details
    await updateSubscriptionStatus(subscription)
    break
    
  case 'customer.subscription.deleted':
    // Downgrade to free
    await downgradeToFree(customerId)
    break
    
  case 'invoice.payment_failed':
    // Mark as past_due, send email
    await handlePaymentFailed(customerId)
    break
}
```

## Files to Create/Modify

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `supabase/migrations/XXX_subscription_fields.sql` | Create | Schema Update |
| `src/app/api/subscription/checkout/route.ts` | Create | Checkout API |
| `src/app/subscription/success/page.tsx` | Create | Success Page |
| `src/app/api/webhook/route.ts` | Modify | Subscription Events |
| `src/components/pricing/SubscriptionCheckoutButton.tsx` | Create | Checkout Button |
| `src/components/pricing/PlanComparison.tsx` | Modify | Button Integration |

## Environment Variables

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
```

## Out of Scope

- Subscription Management / Kündigung (Story 8.3)
- Upgrade von Monthly zu Yearly
- Testphase / Trial
- Coupon-Codes bei Subscription

## Testing Checklist

- [ ] Monatliche Subscription kaufen funktioniert
- [ ] Jährliche Subscription kaufen funktioniert
- [ ] Webhook setzt subscription_tier auf 'pro'
- [ ] Success Page zeigt korrekt an
- [ ] Nicht-eingeloggte User werden zu /login geleitet
- [ ] Stripe Customer wird erstellt/wiederverwendet
- [ ] PRO-Features sind sofort verfügbar

