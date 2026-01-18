# Story 4.2: Checkout Redirect

## Meta
- **Epic:** 4 - Payment & Purchase
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 2 Story Points

## User Story
Als User,
möchte ich zu Stripe weitergeleitet werden,
damit ich sicher bezahlen kann.

## Acceptance Criteria

### AC 1: CTA Button Funktionalität
**Given** ich bin auf der Ergebnis-Teaser-Seite
**When** ich auf "Jetzt freischalten – 29,99€" klicke
**Then** wird die Checkout API aufgerufen
**And** ich werde zur Stripe Checkout Seite weitergeleitet

### AC 2: Loading State
**Given** ich klicke auf den CTA Button
**When** die API aufgerufen wird
**Then** zeigt der Button einen Loading-Zustand
**And** der Button ist während des Ladens deaktiviert

### AC 3: Stripe Checkout Seite
**Given** ich wurde zu Stripe weitergeleitet
**When** ich die Checkout Seite sehe
**Then** sehe ich den korrekten Betrag (29,99€)
**And** ich kann mit Kreditkarte bezahlen
**And** ich kann mit SEPA-Lastschrift bezahlen (optional)

### AC 4: Erfolgreiche Zahlung
**Given** ich habe bei Stripe bezahlt
**When** die Zahlung erfolgreich ist
**Then** werde ich zur Success-Seite weitergeleitet

### AC 5: Abgebrochene Zahlung
**Given** ich bin auf der Stripe Checkout Seite
**When** ich auf "Zurück" klicke oder abbreche
**Then** werde ich zur Ergebnis-Seite zurückgeleitet
**And** meine Analyse-Daten sind noch vorhanden

## Technical Notes

### PurchaseCTA Update
```typescript
// src/components/results/PurchaseCTA.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PurchaseCTA({ analysisId }: PurchaseCTAProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
      })
      const { url } = await response.json()
      router.push(url) // Redirect to Stripe
    } catch (error) {
      console.error('Checkout error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="..."
    >
      {isLoading ? 'Wird geladen...' : 'Jetzt freischalten – 29,99€'}
    </button>
  )
}
```

### Flow
```
User klickt CTA
    ↓
POST /api/checkout
    ↓
Stripe Session erstellt
    ↓
Redirect zu Stripe Checkout
    ↓
User bezahlt
    ↓
Redirect zu /checkout/success
```

## Dependencies
- Story 4.1 (Checkout API)

## Out of Scope
- Webhook Verarbeitung (Story 4.3)
- Success Page Content (Story 4.4)

## Definition of Done
- [ ] CTA Button ruft API auf
- [ ] Loading State während API-Call
- [ ] Redirect zu Stripe funktioniert
- [ ] Cancel-Redirect funktioniert
- [ ] Error Handling mit User-Feedback
- [ ] Button ist accessible (disabled state)

