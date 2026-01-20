---
story_id: "7.2"
title: "E-Book Checkout"
epic: "Epic 7 - E-Book Integration"
status: done
created: 2026-01-19
started: 2026-01-20
completed: 2026-01-20
created_by: Bob (SM)
implemented_by: Amelia (Dev)
priority: high
estimated_points: 5
depends_on: ["7.1", "10.8"]
---

# Story 7.2: E-Book Checkout

## User Story

Als Kunde,
möchte ich ein E-Book kaufen können,
damit ich Zugang zum gewünschten Inhalt erhalte.

## Business Context

- **PRD Reference:** Section 5.2.2 - E-Books
- **Abhängigkeit:** Story 7.1 (E-Book Landing Page)
- **Revenue Impact:** Direkter E-Book Umsatz

## Preise (aus PRD)

| E-Book | Preis |
|--------|-------|
| Ausführliche Langversion | 19,99€ |
| Kurzversion | 9,99€ |
| Tips & Tricks | 14,99€ |
| Auswandern für Dummies | 12,99€ |
| Bundle (alle 4) | 39,99€ |

## Acceptance Criteria

### AC1: Kauf-Button auf E-Book Karte
**Given** ich bin auf der E-Book Seite
**When** ich auf "Kaufen" bei einem E-Book klicke
**Then** werde ich zu Stripe Checkout weitergeleitet
**And** der korrekte Preis wird angezeigt

### AC2: Stripe Checkout Session
**Given** ich klicke auf Kaufen
**When** die Checkout Session erstellt wird
**Then** enthält sie das E-Book Produkt
**And** enthält sie meine E-Mail (falls eingeloggt)
**And** die success_url führt zu /ebooks/success
**And** die cancel_url führt zurück zu /ebooks

### AC3: Bundle-Kauf
**Given** ich kaufe das E-Book Bundle
**When** die Zahlung erfolgreich ist
**Then** erhalte ich Zugang zu allen 4 E-Books
**And** es wird als ein Kauf verbucht

### AC4: Webhook-Verarbeitung
**Given** eine E-Book Zahlung ist erfolgreich
**When** Stripe den Webhook sendet
**Then** wird der Kauf in `purchases` gespeichert
**And** `product_type` ist 'ebook'
**And** das gekaufte E-Book wird dem User zugeordnet

### AC5: Kaufbestätigung
**Given** meine Zahlung war erfolgreich
**When** ich zur Success-Seite weitergeleitet werde
**Then** sehe ich "Vielen Dank für deinen Kauf!"
**And** sehe ich das gekaufte E-Book
**And** sehe ich einen "Jetzt lesen" Button

### AC6: PRO-User Flow
**Given** ich bin PRO-User
**When** ich auf ein E-Book klicke
**Then** werde ich direkt zum Download/Lesen weitergeleitet
**And** es gibt keinen Checkout-Flow

## Technical Tasks

- [ ] **Task 1: Stripe Produkte erstellen**
  - [ ] E-Book Produkte in Stripe Dashboard erstellen
  - [ ] Price IDs in `/lib/ebooks.ts` hinzufügen

- [ ] **Task 2: Checkout API Route**
  - [ ] Erstelle `/api/ebooks/checkout/route.ts`
  - [ ] POST: ebookId → Stripe Checkout Session
  - [ ] Validierung: E-Book existiert
  - [ ] Metadata: ebook_id, user_id (optional)

- [ ] **Task 3: Datenbank-Schema erweitern**
  - [ ] Migration: `user_ebooks` Tabelle für gekaufte E-Books
  - [ ] Felder: user_id, ebook_id, purchased_at, stripe_payment_id

- [ ] **Task 4: Webhook Handler erweitern**
  - [ ] `/api/webhook/route.ts` erweitern
  - [ ] Case: E-Book Kauf verarbeiten
  - [ ] Insert in `user_ebooks` Tabelle

- [ ] **Task 5: Success Page**
  - [ ] Erstelle `/app/(marketing)/ebooks/success/page.tsx`
  - [ ] Query-Param: session_id
  - [ ] E-Book Details aus Session laden
  - [ ] CTA: "Jetzt lesen"

- [ ] **Task 6: EbookCard Checkout Integration**
  - [ ] Checkout-Handler in EbookCard
  - [ ] Loading State während Redirect
  - [ ] Error Handling

- [ ] **Task 7: PRO-Bypass implementieren**
  - [ ] Prüfe PRO-Status vor Checkout
  - [ ] Direkter Zugang für PRO-User

## Dev Notes

### Abhängigkeiten
- Story 7.1: E-Book Landing Page
- Epic 4: Stripe Integration ✅
- Epic 6: Supabase Auth ✅

### Datenbank-Migration

```sql
-- User E-Books (gekaufte E-Books)
CREATE TABLE user_ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ebook_id TEXT NOT NULL, -- slug aus ebooks.ts
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  amount INTEGER, -- in cents
  UNIQUE(user_id, ebook_id)
);

-- RLS
ALTER TABLE user_ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ebooks"
  ON user_ebooks FOR SELECT
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_user_ebooks_user_id ON user_ebooks(user_id);
```

### Stripe Checkout Session

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{
    price: ebook.stripePriceId,
    quantity: 1,
  }],
  metadata: {
    type: 'ebook',
    ebook_id: ebook.id,
    user_id: user?.id || 'guest',
  },
  success_url: `${baseUrl}/ebooks/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/ebooks`,
  customer_email: user?.email,
})
```

## Files to Create/Modify

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `supabase/migrations/XXX_user_ebooks.sql` | Create | DB Schema |
| `src/app/api/ebooks/checkout/route.ts` | Create | Checkout API |
| `src/app/(marketing)/ebooks/success/page.tsx` | Create | Success Page |
| `src/app/api/webhook/route.ts` | Modify | E-Book Handler |
| `src/lib/ebooks.ts` | Modify | Stripe Price IDs |
| `src/components/ebooks/EbookCard.tsx` | Modify | Checkout Button |

## Out of Scope

- Download-Funktionalität (Story 7.3)
- Refund-Handling
- Geschenk-Käufe

## Testing Checklist

- [ ] Einzelnes E-Book kaufen funktioniert
- [ ] Bundle kaufen gewährt Zugang zu allen 4
- [ ] Webhook speichert Kauf in DB
- [ ] Success Page zeigt korrektes E-Book
- [ ] PRO-User wird nicht zum Checkout geleitet
- [ ] Guest-Kauf funktioniert (E-Mail erforderlich)

