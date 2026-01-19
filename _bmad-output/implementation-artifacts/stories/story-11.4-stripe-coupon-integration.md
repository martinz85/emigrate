# Story 11.4: Stripe Coupon Integration

## Story
**Als** Admin
**möchte ich** Rabattcodes mit Stripe Coupons synchronisieren
**damit** Rabatte im Checkout funktionieren

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Coupon bei Code-Erstellung
- [ ] Stripe Coupon erstellen wenn Discount-Code erstellt wird
- [ ] `stripe_coupon_id` in `discount_codes` speichern

### AC2: Coupon bei Löschung
- [ ] Stripe Coupon deaktivieren/löschen

### AC3: Checkout mit Rabattcode
- [ ] Rabattcode-Eingabe auf Ergebnisseite (optional für MVP)
- [ ] Code an Checkout-API übergeben
- [ ] Stripe Session mit `discounts` erstellen

## Technische Details

### Discount-Erstellung mit Stripe
```typescript
// src/app/api/admin/discounts/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Nach Validierung:
const stripeCoupon = await stripe.coupons.create({
  percent_off: discountPercent,
  duration: 'once',
  id: code.toUpperCase(), // Code als Coupon-ID
  max_redemptions: maxUses || undefined,
  redeem_by: validUntil ? Math.floor(new Date(validUntil).getTime() / 1000) : undefined,
})

// In DB speichern
await supabase.from('discount_codes').insert({
  // ... existing fields
  stripe_coupon_id: stripeCoupon.id,
})
```

### Checkout mit Rabatt
```typescript
// src/app/api/checkout/route.ts
const session = await stripe.checkout.sessions.create({
  // ... existing config
  discounts: discountCode 
    ? [{ coupon: discountCode.toUpperCase() }] 
    : undefined,
})
```

## Abhängigkeiten
- Stripe API konfiguriert

## Schätzung
- **Aufwand**: 1 Stunde
- **Komplexität**: Mittel

## Notes
- Stripe Coupons sind separate Objekte
- Für MVP: Nur Coupon-Erstellung, Checkout-Integration optional

