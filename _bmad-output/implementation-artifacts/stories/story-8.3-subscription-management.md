---
story_id: "8.3"
title: "Subscription Management"
epic: "Epic 8 - PRO Subscription"
status: done
created: 2026-01-19
created_by: Bob (SM)
priority: medium
estimated_points: 8
depends_on: ["8.2"]
completed: 2026-01-21
completed_by: Amelia (Dev)
---

# Story 8.3: Subscription Management

## User Story

Als PRO-Abonnent,
möchte ich mein Abonnement verwalten können,
damit ich es kündigen, pausieren oder die Zahlungsmethode ändern kann.

## Business Context

- **PRD Reference:** Section 5.1.4 - Stornierung/Kündigung Self-Service
- **Abhängigkeit:** Story 8.2 (Subscription Checkout)
- **Customer Experience:** Self-Service reduziert Support-Aufwand

## Acceptance Criteria

### AC1: Abo-Übersicht im Dashboard
**Given** ich bin PRO-User
**When** ich /dashboard/subscription besuche
**Then** sehe ich meinen aktuellen Plan (PRO)
**And** sehe ich den Billing-Zyklus (Monatlich/Jährlich)
**And** sehe ich das nächste Abrechnungsdatum
**And** sehe ich den monatlichen/jährlichen Betrag

### AC2: Kündigung
**Given** ich bin auf der Subscription-Seite
**When** ich auf "Abo kündigen" klicke
**Then** sehe ich eine Bestätigungsabfrage
**And** nach Bestätigung wird das Abo zum Periodenende gekündigt
**And** ich behalte PRO-Zugang bis zum Periodenende
**And** ich sehe "Kündigung zum [Datum]"

### AC3: Kündigung widerrufen
**Given** ich habe mein Abo gekündigt (aber noch aktiv)
**When** ich auf "Kündigung widerrufen" klicke
**Then** wird die Kündigung zurückgenommen
**And** das Abo verlängert sich automatisch

### AC4: Stripe Customer Portal
**Given** ich möchte Zahlungsmethode ändern
**When** ich auf "Zahlungsmethode verwalten" klicke
**Then** werde ich zum Stripe Customer Portal weitergeleitet
**And** kann dort Kreditkarte/SEPA ändern
**And** kann Rechnungen einsehen

### AC5: Rechnungshistorie
**Given** ich bin auf der Subscription-Seite
**When** ich die Rechnungen ansehe
**Then** sehe ich alle bisherigen Zahlungen
**And** kann ich Rechnungen als PDF herunterladen
**And** via Stripe Customer Portal

### AC6: Downgrade zu Free
**Given** mein Abo ist abgelaufen (Periodenende erreicht)
**When** ich die Plattform besuche
**Then** bin ich automatisch Free-User
**And** PRO-Features sind gesperrt
**And** ich sehe "Erneut PRO werden" CTA

### AC7: Billing-Wechsel (Optional)
**Given** ich habe ein monatliches Abo
**When** ich zu jährlich wechseln möchte
**Then** kann ich über Stripe Customer Portal upgraden
**And** die Differenz wird anteilig berechnet

## Technical Tasks

- [ ] **Task 1: Subscription Dashboard Page**
  - [ ] Erstelle `/app/dashboard/subscription/page.tsx`
  - [ ] Aktuelle Plan-Details anzeigen
  - [ ] Nächstes Abrechnungsdatum
  - [ ] Status (active, canceled, past_due)

- [ ] **Task 2: Cancel Subscription API**
  - [ ] Erstelle `/api/subscription/cancel/route.ts`
  - [ ] POST: Kündigt zum Periodenende
  - [ ] Stripe: subscription.cancel_at_period_end = true

- [ ] **Task 3: Resume Subscription API**
  - [ ] Erstelle `/api/subscription/resume/route.ts`
  - [ ] POST: Widerruft Kündigung
  - [ ] Stripe: subscription.cancel_at_period_end = false

- [ ] **Task 4: Customer Portal Session**
  - [ ] Erstelle `/api/subscription/portal/route.ts`
  - [ ] POST: Erstellt Stripe Customer Portal Session
  - [ ] Redirect zu Portal URL

- [ ] **Task 5: Subscription Status Component**
  - [ ] Erstelle `/components/subscription/SubscriptionStatus.tsx`
  - [ ] Props: subscription data
  - [ ] Zeigt: Status, Preis, Datum, Actions

- [ ] **Task 6: Cancel Modal**
  - [ ] Erstelle `/components/subscription/CancelModal.tsx`
  - [ ] Bestätigungsabfrage
  - [ ] Optional: Feedback-Frage (Warum kündigst du?)

- [ ] **Task 7: Webhook: Subscription Ended**
  - [ ] Event: customer.subscription.deleted
  - [ ] Downgrade zu Free
  - [ ] E-Mail: "Schade, dass du gehst"

- [ ] **Task 8: Expired Status Handling**
  - [ ] Middleware prüft subscription_period_end
  - [ ] Automatisches Downgrade wenn abgelaufen
  - [ ] Sync mit Stripe Status

## Dev Notes

### Abhängigkeiten
- Story 8.2: Subscription Checkout ✅
- Stripe Customer Portal

### Stripe Customer Portal Setup

1. Im Stripe Dashboard: Settings → Customer Portal
2. Features aktivieren:
   - Cancel subscription
   - Update payment method
   - View invoices
3. Branding anpassen

### API: Cancel Subscription

```typescript
// Cancel at period end (Kunde behält Zugang bis Ende)
await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true,
})

// Update profile
await supabase
  .from('profiles')
  .update({ subscription_status: 'canceled' })
  .eq('id', userId)
```

### API: Customer Portal

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${baseUrl}/dashboard/subscription`,
})

return { url: session.url }
```

### Subscription Status Enum

```typescript
type SubscriptionStatus = 
  | 'active'      // Aktiv, wird verlängert
  | 'canceled'    // Gekündigt, aber noch aktiv bis period_end
  | 'past_due'    // Zahlung fehlgeschlagen
  | 'expired'     // Abgelaufen, kein Zugang mehr
  | null          // Free User
```

## Files to Create/Modify

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `src/app/dashboard/subscription/page.tsx` | Create | Abo-Dashboard |
| `src/app/api/subscription/cancel/route.ts` | Create | Kündigen API |
| `src/app/api/subscription/resume/route.ts` | Create | Widerrufen API |
| `src/app/api/subscription/portal/route.ts` | Create | Portal API |
| `src/components/subscription/SubscriptionStatus.tsx` | Create | Status UI |
| `src/components/subscription/CancelModal.tsx` | Create | Kündigungs-Dialog |
| `src/app/api/webhook/route.ts` | Modify | Deleted Event |
| `src/lib/email/templates/subscription-canceled.tsx` | Create | E-Mail |

## Out of Scope

- Pausieren von Subscriptions
- Upgrade/Downgrade zwischen Plänen (nur via Portal)
- Refunds (manuell via Stripe Dashboard)
- Dunning (Mahnwesen) - Stripe automatisch

## Testing Checklist

- [ ] Subscription-Status wird korrekt angezeigt
- [ ] Kündigung funktioniert (cancel_at_period_end)
- [ ] Kündigung widerrufen funktioniert
- [ ] Stripe Portal öffnet sich
- [ ] Webhook downgraded zu Free nach Ablauf
- [ ] Middleware erkennt abgelaufene Subscriptions
- [ ] E-Mail wird bei Kündigung gesendet

