-- ============================================
-- Migration 004: Price Configuration Table
--
-- Flexible Preisverwaltung mit Kampagnen-Support
-- Ermöglicht durchgestrichene Preise und Sale-Aktionen
-- ============================================

CREATE TABLE IF NOT EXISTS public.price_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key TEXT UNIQUE NOT NULL, -- 'analysis', 'ebook', 'pro_monthly', 'pro_yearly'
  product_name TEXT NOT NULL,
  product_description TEXT,
  regular_price INTEGER NOT NULL, -- in cents (2999 = 29,99€)
  campaign_price INTEGER, -- in cents, NULL if no campaign
  campaign_active BOOLEAN DEFAULT FALSE,
  campaign_name TEXT, -- e.g. "Neujahrs-Sale", "Launch-Angebot"
  currency TEXT DEFAULT 'eur',
  stripe_price_id TEXT, -- Stripe Price ID for regular price (optional)
  stripe_campaign_price_id TEXT, -- Stripe Price ID for campaign (optional)
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE, -- Can hide products
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_price_config_product_key ON public.price_config(product_key);
CREATE INDEX IF NOT EXISTS idx_price_config_is_active ON public.price_config(is_active);

-- RLS
ALTER TABLE public.price_config ENABLE ROW LEVEL SECURITY;

-- Public can read active prices (for frontend display)
CREATE POLICY "Anyone can read active prices"
  ON public.price_config FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage prices"
  ON public.price_config FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Initial product data
INSERT INTO public.price_config (product_key, product_name, product_description, regular_price, sort_order) VALUES
  ('analysis', 'Auswanderer-Analyse (PDF)', 'Dein persönlicher Länder-Match mit detaillierter Auswertung', 2999, 1),
  ('ebook', 'Auswanderer E-Book', 'Der komplette Guide zum Auswandern', 1999, 2),
  ('pro_monthly', 'PRO Abo (Monatlich)', 'Unbegrenzte Analysen, Premium-Features', 999, 3),
  ('pro_yearly', 'PRO Abo (Jährlich)', 'Unbegrenzte Analysen, Premium-Features, 2 Monate gratis', 7999, 4)
ON CONFLICT (product_key) DO NOTHING;

-- Comment
COMMENT ON TABLE public.price_config IS 'Produkt-Preise mit Kampagnen-Support für durchgestrichene Preise';

