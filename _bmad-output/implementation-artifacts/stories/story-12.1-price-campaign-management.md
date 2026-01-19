# Story 12.1: Price Campaign Management

## Story
**Als** Admin
**möchte ich** Preise für alle Produkte verwalten und Kampagnen-Preise setzen können
**damit** ich flexible Preisaktionen (z.B. "statt 39,99€ nur 19,99€") durchführen kann

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Produkt-Preise in DB
- [ ] `price_config` Tabelle für alle Produkte
- [ ] Produkte: `analysis` (PDF), `ebook`, `pro_subscription`
- [ ] Felder: regular_price, campaign_price, campaign_active, campaign_name

### AC2: Admin UI für Preise
- [ ] Übersicht aller Produkte mit aktuellen Preisen
- [ ] Bearbeiten-Formular pro Produkt
- [ ] Toggle für "Kampagne aktiv"
- [ ] Eingabe für regulären Preis und Kampagnen-Preis

### AC3: Frontend-Anzeige
- [ ] Wenn Kampagne aktiv: Alter Preis durchgestrichen, neuer Preis hervorgehoben
- [ ] Beispiel: "~~39,99€~~ **19,99€**"
- [ ] Kampagnen-Badge (optional): "SALE" / "Angebot"

### AC4: Checkout-Integration
- [ ] Checkout verwendet aktiven Preis (regular oder campaign)
- [ ] Stripe Session mit korrektem Preis erstellen

## Technische Details

### Datenbank-Schema
```sql
-- Migration: 004_price_config.sql
CREATE TABLE IF NOT EXISTS public.price_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key TEXT UNIQUE NOT NULL, -- 'analysis', 'ebook', 'pro_monthly', 'pro_yearly'
  product_name TEXT NOT NULL,
  regular_price INTEGER NOT NULL, -- in cents
  campaign_price INTEGER, -- in cents, NULL if no campaign
  campaign_active BOOLEAN DEFAULT FALSE,
  campaign_name TEXT, -- e.g. "Neujahrs-Sale", "Launch-Angebot"
  currency TEXT DEFAULT 'eur',
  stripe_price_id TEXT, -- Stripe Price ID for regular price
  stripe_campaign_price_id TEXT, -- Stripe Price ID for campaign
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Initial data
INSERT INTO public.price_config (product_key, product_name, regular_price) VALUES
  ('analysis', 'Auswanderer-Analyse (PDF)', 2999),
  ('ebook', 'Auswanderer E-Book', 1999),
  ('pro_monthly', 'PRO Abo (Monatlich)', 999),
  ('pro_yearly', 'PRO Abo (Jährlich)', 7999);

-- RLS
ALTER TABLE public.price_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read prices"
  ON public.price_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can update prices"
  ON public.price_config FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
```

### API: Get Prices (Public)
```typescript
// src/app/api/prices/route.ts
export async function GET() {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('price_config')
    .select('product_key, product_name, regular_price, campaign_price, campaign_active, campaign_name, currency')
  
  // Transform to frontend-friendly format
  const prices = data?.reduce((acc, p) => {
    acc[p.product_key] = {
      name: p.product_name,
      regularPrice: p.regular_price,
      currentPrice: p.campaign_active ? p.campaign_price : p.regular_price,
      campaignActive: p.campaign_active,
      campaignName: p.campaign_name,
      currency: p.currency,
    }
    return acc
  }, {})

  return NextResponse.json(prices)
}
```

### API: Update Price (Admin)
```typescript
// src/app/api/admin/prices/[productKey]/route.ts
export async function PUT(request, { params }) {
  // Admin auth check...
  
  const { regularPrice, campaignPrice, campaignActive, campaignName } = await request.json()
  
  const supabase = createAdminClient()
  
  await supabase
    .from('price_config')
    .update({
      regular_price: regularPrice,
      campaign_price: campaignPrice || null,
      campaign_active: campaignActive,
      campaign_name: campaignName || null,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('product_key', params.productKey)

  // Audit log
  await logAuditEvent({
    action: 'PRICE_UPDATED',
    targetId: params.productKey,
    targetType: 'price',
    adminId: user.id,
    metadata: { regularPrice, campaignPrice, campaignActive },
  })

  return NextResponse.json({ success: true })
}
```

### Price Display Component
```typescript
// src/components/ui/PriceDisplay.tsx
interface PriceDisplayProps {
  regularPrice: number
  currentPrice: number
  campaignActive: boolean
  campaignName?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PriceDisplay({ 
  regularPrice, 
  currentPrice, 
  campaignActive,
  campaignName,
  size = 'md' 
}: PriceDisplayProps) {
  const formatPrice = (cents: number) => 
    (cents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'

  if (!campaignActive || regularPrice === currentPrice) {
    return <span className={sizeClasses[size]}>{formatPrice(currentPrice)}</span>
  }

  return (
    <div className="flex items-center gap-2">
      {campaignName && (
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {campaignName}
        </span>
      )}
      <span className="text-slate-400 line-through text-sm">
        {formatPrice(regularPrice)}
      </span>
      <span className={`text-emerald-600 font-bold ${sizeClasses[size]}`}>
        {formatPrice(currentPrice)}
      </span>
    </div>
  )
}
```

## UI/UX Details

### Admin: Price Management Page
```
┌─────────────────────────────────────────────────────┐
│ 💰 Preis-Verwaltung                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Auswanderer-Analyse (PDF)                       │ │
│ │ Regulärer Preis: [29,99] €                      │ │
│ │ ☑ Kampagne aktiv                                │ │
│ │ Kampagnen-Preis: [19,99] €                      │ │
│ │ Kampagnen-Name: [Neujahrs-Sale]                 │ │
│ │                              [Speichern]        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ E-Book                                          │ │
│ │ Regulärer Preis: [19,99] €                      │ │
│ │ ☐ Kampagne aktiv                                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Frontend: Preis-Anzeige
```
Ohne Kampagne:        Mit Kampagne:
29,99 €               ~~39,99 €~~ 19,99 € [SALE]
```

## Abhängigkeiten
- Epic 10 (Admin Dashboard) ✅
- Stripe Price IDs (optional für vollständige Integration)

## Schätzung
- **Aufwand**: 3-4 Stunden
- **Komplexität**: Mittel

## Notes
- Stripe Preise sind immutable - bei Preisänderung neuen Stripe Price erstellen
- Für MVP: Preis nur in DB, Checkout holt Preis aus DB
- Später: Stripe Price Sync als Background-Job

