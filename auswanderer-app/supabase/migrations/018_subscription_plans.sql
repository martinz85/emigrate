-- Story 8.1: Subscription Plans
-- Creates subscription_plans table for FREE vs PRO comparison

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'free', 'pro'
  description TEXT,
  price_monthly INTEGER, -- in cents, NULL for free
  price_yearly INTEGER,  -- in cents, NULL for free
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, display_order)
VALUES 
  (
    'Free', 
    'free', 
    'Perfekt zum Ausprobieren',
    NULL, 
    NULL, 
    '["1 Analyse", "PDF-Vorschau (2 Seiten)", "Top 3 Länder sehen", "E-Mail Support"]'::jsonb, 
    0
  ),
  (
    'PRO', 
    'pro', 
    'Für ernsthafte Auswanderer',
    1499, -- 14,99€
    14990, -- 149,90€ (2 Monate gratis)
    '[
      "Unbegrenzte AI-Analysen",
      "Alle PDFs inklusive",
      "Alle E-Books inklusive",
      "Projekt-Dashboard",
      "Checklisten-System",
      "Meilenstein-Tracker",
      "Personalisierte Timeline",
      "Kosten-Tracker",
      "Länder-Vergleich (bis zu 5)",
      "Visa-Navigator",
      "Kosten-Rechner Live",
      "Basis-Support"
    ]'::jsonb, 
    1
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read active plans (public pricing page)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = TRUE);

-- Only admins can modify plans
CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = TRUE;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_plans_updated_at();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON subscription_plans TO anon;
GRANT SELECT ON subscription_plans TO authenticated;

