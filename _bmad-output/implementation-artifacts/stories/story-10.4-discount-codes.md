# Story 10.4: Discount Codes / Campaigns

## Story
**Als** Admin
**möchte ich** Rabattcodes erstellen und verwalten können
**damit** Marketing-Kampagnen durchgeführt werden können

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Code-Liste
- [ ] Tabelle mit allen Discount-Codes
- [ ] Status: Aktiv/Inaktiv/Abgelaufen
- [ ] Nutzungsstatistik (verwendet/max)

### AC2: Code erstellen
- [ ] Formular: Code, Rabatt-%, Gültigkeitszeitraum, Max-Nutzungen
- [ ] Auto-Generierung von Codes (optional)
- [ ] Stripe Coupon erstellen

### AC3: Code bearbeiten/deaktivieren
- [ ] Code kann deaktiviert werden
- [ ] Gültigkeitszeitraum ändern
- [ ] Keine Änderung des Rabatts (Stripe-Limitierung)

### AC4: Checkout-Integration
- [ ] Eingabefeld für Rabattcode auf Ergebnisseite
- [ ] Code-Validierung vor Checkout
- [ ] Rabatt im Stripe Checkout anwenden

## Technische Details

### Discount Codes Tabelle (bereits vorhanden)
```sql
-- Aus Migration 001
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  stripe_coupon_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API: Code erstellen
```typescript
// src/app/api/admin/discounts/route.ts
export async function POST(request: NextRequest) {
  const { code, discountPercent, validFrom, validUntil, maxUses } = await request.json()
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  // Create Stripe coupon
  const coupon = await stripe.coupons.create({
    percent_off: discountPercent,
    duration: 'once',
    id: code, // Use code as coupon ID
  })

  // Store in Supabase
  const supabase = createAdminClient()
  await supabase
    .from('discount_codes')
    .insert({
      code,
      discount_percent: discountPercent,
      valid_from: validFrom,
      valid_until: validUntil,
      max_uses: maxUses,
      stripe_coupon_id: coupon.id,
    })

  return NextResponse.json({ success: true })
}
```

### Checkout mit Rabattcode
```typescript
// src/app/api/checkout/route.ts (Update)
const session = await stripe.checkout.sessions.create({
  // ... existing config
  discounts: discountCode ? [{ coupon: discountCode }] : undefined,
})
```

## UI/UX Details
- Grüner "Aktiv"-Badge, Roter "Abgelaufen"-Badge
- Fortschrittsbalken für Nutzung (5/10 verwendet)
- Code-Eingabe mit Validierung vor Checkout

## Abhängigkeiten
- Story 10.1 (Admin Auth)
- Stripe Coupons API
- `validate_discount_code` Funktion (Migration 002)

## Schätzung
- **Aufwand**: 4-5 Stunden
- **Komplexität**: Mittel-Hoch

## Notes
- Stripe Coupons sind separate Objekte von Promotion Codes
- Für einfaches MVP: Coupon = Code (keine Promotion Codes)
- Code-Validierung clientseitig UND serverseitig

