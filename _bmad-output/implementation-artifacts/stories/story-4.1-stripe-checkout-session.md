# Story 4.1: Stripe Checkout Session

## Meta
- **Epic:** 4 - Payment & Purchase
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 3 Story Points

## User Story
Als System,
möchte ich eine Stripe Checkout Session erstellen,
damit User sicher bezahlen können.

## Acceptance Criteria

### AC 1: API Route erstellen
**Given** ein User klickt auf "Jetzt freischalten"
**When** die `/api/checkout` Route mit POST aufgerufen wird
**Then** wird eine Stripe Checkout Session erstellt

### AC 2: Metadata
**Given** eine Checkout Session wird erstellt
**When** die Session konfiguriert wird
**Then** ist die `analysisId` in den Stripe Metadata enthalten
**And** der `userId` (falls vorhanden) ist enthalten

### AC 3: Preis korrekt
**Given** eine Checkout Session wird erstellt
**When** der Preis gesetzt wird
**Then** beträgt er 29,99€ (2999 Cents)
**And** die Währung ist EUR

### AC 4: Success/Cancel URLs
**Given** eine Checkout Session wird erstellt
**When** die URLs konfiguriert werden
**Then** zeigt `success_url` auf `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
**And** zeigt `cancel_url` auf `/ergebnis/{analysisId}`

### AC 5: Response
**Given** die Session erfolgreich erstellt wurde
**When** die API antwortet
**Then** wird die Checkout-URL zurückgegeben
**And** der HTTP Status ist 200

## Technical Notes

### API Route
```typescript
// src/app/api/checkout/route.ts
POST /api/checkout
Body: { analysisId: string }
Response: { url: string, sessionId: string }
```

### Stripe Configuration
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'sepa_debit'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'Auswanderungs-Analyse',
        description: 'Deine personalisierte Länderempfehlung',
      },
      unit_amount: 2999, // 29,99€
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/ergebnis/${analysisId}`,
  metadata: {
    analysisId,
  },
})
```

### Environment Variables
- `STRIPE_SECRET_KEY` - Stripe Secret Key (server-side only)
- `NEXT_PUBLIC_BASE_URL` - Base URL für Redirects

## Dependencies
- Stripe SDK (`stripe` package)
- Environment Variables konfiguriert

## Out of Scope
- Webhook Handler (Story 4.3)
- Success Page (Story 4.4)
- Supabase Integration (Story 4.3)

## Definition of Done
- [ ] API Route `/api/checkout` implementiert
- [ ] Stripe Session wird korrekt erstellt
- [ ] Metadata enthält analysisId
- [ ] Preis ist 29,99€
- [ ] Success/Cancel URLs korrekt
- [ ] Error Handling implementiert
- [ ] TypeScript Typen definiert

