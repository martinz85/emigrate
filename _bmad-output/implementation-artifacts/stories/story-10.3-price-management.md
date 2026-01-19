# Story 10.3: Price Management

## Story
**Als** Admin
**möchte ich** Preise zentral verwalten können
**damit** Preisänderungen schnell umgesetzt werden können

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Preis-Anzeige
- [ ] Aktueller Preis aus Stripe anzeigen
- [ ] Preis-ID aus Environment Variable

### AC2: Preis-Änderung
- [ ] Input-Feld für neuen Preis
- [ ] "Preis aktualisieren" Button
- [ ] Erstellt neuen Stripe-Preis (Preise sind immutable)
- [ ] Aktualisiert Environment Variable Referenz

### AC3: Preis-Historie
- [ ] Liste der letzten Preisänderungen
- [ ] Datum, alter Preis, neuer Preis

## Technische Details

### Preise in Supabase speichern
```sql
-- Neue Tabelle für Preiskonfiguration
CREATE TABLE IF NOT EXISTS public.price_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'eur',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id)
);

-- RLS: Nur Admins können Preise verwalten
ALTER TABLE public.price_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage prices"
  ON public.price_config FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
```

### API: Preis aktualisieren
```typescript
// src/app/api/admin/prices/route.ts
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const { amount } = await request.json()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  // Create new price in Stripe
  const price = await stripe.prices.create({
    currency: 'eur',
    unit_amount: amount, // in cents
    product: process.env.STRIPE_PRODUCT_ID!,
  })

  // Store in Supabase
  const supabase = createAdminClient()
  await supabase
    .from('price_config')
    .update({ is_active: false })
    .eq('is_active', true)

  await supabase
    .from('price_config')
    .insert({
      stripe_price_id: price.id,
      amount: amount,
      created_by: userId,
    })

  return NextResponse.json({ success: true, priceId: price.id })
}
```

## UI/UX Details
- Aktueller Preis prominent angezeigt
- Warnung bei Preisänderung: "Neue Käufe verwenden den neuen Preis"
- Einfaches Formular

## Abhängigkeiten
- Story 10.1 (Admin Auth)
- Stripe API

## Schätzung
- **Aufwand**: 2-3 Stunden
- **Komplexität**: Mittel

## Notes
- Stripe Preise sind immutable - neuer Preis = neue Price-ID
- Checkout-Route muss aktiven Preis aus DB holen
- Für MVP: Manuelles Update der Env-Variable ist auch ok

