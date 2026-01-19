-- ============================================
-- Migration 011: Extended Analytics Schema
--
-- For Julian (SEO/Conversion) and Linus (Controller)
-- - Detailed session tracking
-- - Revenue aggregation
-- - Cost tracking
-- - Funnel analytics
-- ============================================

-- ============================================
-- 1. ANALYSIS SESSIONS TABLE
-- Detailed tracking of each user journey
-- ============================================

CREATE TABLE IF NOT EXISTS public.analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity (DSGVO-konform)
  ip_hash TEXT NOT NULL,                    -- SHA256(ip + daily_salt)
  session_id TEXT,                          -- Browser Session Cookie
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  
  -- Duration Metrics
  total_duration_ms INTEGER,                -- Gesamtdauer der Session
  avg_question_time_ms INTEGER,             -- Durchschnitt pro Frage
  question_times JSONB,                     -- {"q1": 4500, "q2": 3200, ...}
  
  -- Progress Tracking
  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 28,
  is_completed BOOLEAN DEFAULT FALSE,
  abandoned_at_question INTEGER,            -- Bei welcher Frage abgebrochen?
  abandoned_at_step TEXT,                   -- 'welcome', 'pre_analysis', 'q_15', 'loading', 'result'
  
  -- AI Provider Used
  ai_provider TEXT,                         -- 'claude', 'openai', 'gemini'
  ai_model TEXT,                            -- 'claude-3-5-sonnet-20241022'
  ai_input_tokens INTEGER,
  ai_output_tokens INTEGER,
  ai_cost_usd DECIMAL(10,6),
  ai_response_time_ms INTEGER,
  ai_fallback_used BOOLEAN DEFAULT FALSE,   -- War ein Fallback nötig?
  
  -- Conversion Tracking
  teaser_viewed_at TIMESTAMPTZ,             -- Wann wurde der Teaser gesehen?
  checkout_started_at TIMESTAMPTZ,          -- Wann wurde Checkout gestartet?
  converted_to_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  price_paid DECIMAL(10,2),
  discount_code TEXT,
  discount_amount DECIMAL(10,2),
  
  -- Traffic Source (für Julian)
  referrer TEXT,                            -- Woher kam der User?
  utm_source TEXT,                          -- z.B. 'google', 'facebook'
  utm_medium TEXT,                          -- z.B. 'cpc', 'organic'
  utm_campaign TEXT,                        -- z.B. 'launch_2025'
  utm_term TEXT,                            -- Suchbegriff
  utm_content TEXT,                         -- A/B Test Variante
  landing_page TEXT,                        -- Erste besuchte Seite
  
  -- Device/Browser Info
  user_agent TEXT,
  device_type TEXT,                         -- 'mobile', 'tablet', 'desktop'
  browser TEXT,                             -- 'chrome', 'safari', 'firefox'
  os TEXT,                                  -- 'ios', 'android', 'windows', 'macos'
  screen_width INTEGER,
  screen_height INTEGER,
  
  -- Geo (Land-Level, DSGVO-konform)
  country_code TEXT,                        -- 'DE', 'AT', 'CH'
  
  -- Analysis Result (für Korrelationen)
  analysis_id UUID,                         -- Referenz zur Analyse
  top_country TEXT,                         -- Welches Land #1?
  top_country_percentage INTEGER,           -- Wie hoch war der Match?
  
  -- Pre-Analysis Data
  countries_of_interest TEXT[],             -- Welche Länder interessieren?
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für Analytics-Queries
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.analysis_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_ip_hash ON public.analysis_sessions(ip_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.analysis_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON public.analysis_sessions(is_completed);
CREATE INDEX IF NOT EXISTS idx_sessions_converted ON public.analysis_sessions(converted_to_paid);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON public.analysis_sessions(utm_source);
CREATE INDEX IF NOT EXISTS idx_sessions_device ON public.analysis_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_sessions_country ON public.analysis_sessions(country_code);
-- Note: DATE(started_at) index not possible (not IMMUTABLE)
-- Use range queries on started_at instead

-- RLS
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can read session data
CREATE POLICY "Admins can view sessions"
  ON public.analysis_sessions FOR SELECT
  USING (public.is_admin());

-- Service role can insert/update (via API)

-- ============================================
-- 2. REVENUE DAILY TABLE
-- Daily revenue aggregation (für Linus)
-- ============================================

CREATE TABLE IF NOT EXISTS public.revenue_daily (
  date DATE PRIMARY KEY,
  
  -- Revenue Breakdown
  analysis_revenue DECIMAL(10,2) DEFAULT 0,   -- Einmalzahlungen Analyse
  pro_revenue DECIMAL(10,2) DEFAULT 0,        -- PRO Abo Einnahmen
  ebook_revenue DECIMAL(10,2) DEFAULT 0,      -- E-Book Verkäufe
  other_revenue DECIMAL(10,2) DEFAULT 0,      -- Sonstige
  
  -- Totals
  gross_revenue DECIMAL(10,2) DEFAULT 0,      -- Brutto-Umsatz
  refunds DECIMAL(10,2) DEFAULT 0,            -- Rückerstattungen
  net_revenue DECIMAL(10,2) DEFAULT 0,        -- Netto-Umsatz
  
  -- Counts
  analysis_sales INTEGER DEFAULT 0,           -- Anzahl Analyse-Verkäufe
  pro_subscriptions INTEGER DEFAULT 0,        -- Neue PRO Abos
  ebook_sales INTEGER DEFAULT 0,              -- Anzahl E-Book Verkäufe
  refund_count INTEGER DEFAULT 0,             -- Anzahl Refunds
  
  -- Discounts
  discount_usage_count INTEGER DEFAULT 0,     -- Wie oft wurde Rabatt genutzt?
  total_discount_amount DECIMAL(10,2) DEFAULT 0, -- Gesamt-Rabatt
  
  -- Average Values
  avg_order_value DECIMAL(10,2),              -- Durchschnittlicher Warenkorb
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.revenue_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view revenue"
  ON public.revenue_daily FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage revenue"
  ON public.revenue_daily FOR ALL
  USING (public.is_admin());

-- ============================================
-- 3. COSTS DAILY TABLE
-- Daily cost tracking (für Linus)
-- ============================================

CREATE TABLE IF NOT EXISTS public.costs_daily (
  date DATE PRIMARY KEY,
  
  -- AI Costs
  claude_cost DECIMAL(10,4) DEFAULT 0,        -- Claude API Kosten
  openai_cost DECIMAL(10,4) DEFAULT 0,        -- OpenAI API Kosten
  gemini_cost DECIMAL(10,4) DEFAULT 0,        -- Gemini API Kosten
  total_ai_cost DECIMAL(10,4) DEFAULT 0,      -- Gesamt AI Kosten
  
  -- Payment Costs
  stripe_fees DECIMAL(10,4) DEFAULT 0,        -- Stripe Gebühren (1.4% + 0.25€)
  
  -- Email Costs
  email_cost DECIMAL(10,4) DEFAULT 0,         -- Resend Kosten
  
  -- Infrastructure (manuell oder API)
  hosting_cost DECIMAL(10,4) DEFAULT 0,       -- Vercel
  database_cost DECIMAL(10,4) DEFAULT 0,      -- Supabase
  storage_cost DECIMAL(10,4) DEFAULT 0,       -- Sonstige Storage
  
  -- Totals
  total_cost DECIMAL(10,4) DEFAULT 0,         -- Gesamt-Kosten
  
  -- Counts
  ai_requests INTEGER DEFAULT 0,              -- Anzahl AI Anfragen
  emails_sent INTEGER DEFAULT 0,              -- Anzahl gesendete Emails
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.costs_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view costs"
  ON public.costs_daily FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage costs"
  ON public.costs_daily FOR ALL
  USING (public.is_admin());

-- ============================================
-- 4. FUNNEL DAILY TABLE
-- Daily funnel step aggregation
-- ============================================

CREATE TABLE IF NOT EXISTS public.funnel_daily (
  date DATE PRIMARY KEY,
  
  -- Funnel Steps
  landing_views INTEGER DEFAULT 0,            -- Landing Page Aufrufe
  analysis_started INTEGER DEFAULT 0,         -- Analyse gestartet
  pre_analysis_completed INTEGER DEFAULT 0,   -- Pre-Analysis ausgefüllt
  questions_halfway INTEGER DEFAULT 0,        -- 14/28 Fragen beantwortet
  questions_completed INTEGER DEFAULT 0,      -- 28/28 Fragen beantwortet
  teaser_viewed INTEGER DEFAULT 0,            -- Ergebnis-Teaser gesehen
  checkout_started INTEGER DEFAULT 0,         -- Checkout begonnen
  checkout_completed INTEGER DEFAULT 0,       -- Zahlung abgeschlossen
  pdf_downloaded INTEGER DEFAULT 0,           -- PDF heruntergeladen
  
  -- Conversion Rates (berechnet)
  start_to_complete_rate DECIMAL(5,2),        -- Start → Abschluss
  teaser_to_checkout_rate DECIMAL(5,2),       -- Teaser → Checkout
  checkout_to_paid_rate DECIMAL(5,2),         -- Checkout → Bezahlt
  overall_conversion_rate DECIMAL(5,2),       -- Start → Bezahlt
  
  -- Abandonment
  abandoned_at_welcome INTEGER DEFAULT 0,
  abandoned_at_pre_analysis INTEGER DEFAULT 0,
  abandoned_at_questions INTEGER DEFAULT 0,
  abandoned_at_teaser INTEGER DEFAULT 0,
  abandoned_at_checkout INTEGER DEFAULT 0,
  
  -- By Device
  mobile_sessions INTEGER DEFAULT 0,
  tablet_sessions INTEGER DEFAULT 0,
  desktop_sessions INTEGER DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.funnel_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view funnel"
  ON public.funnel_daily FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage funnel"
  ON public.funnel_daily FOR ALL
  USING (public.is_admin());

-- ============================================
-- 5. PAGE VIEWS TABLE
-- For SEO/Content Analytics (Julian)
-- ============================================

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Page Info
  path TEXT NOT NULL,                         -- '/analyse', '/ergebnis/123'
  referrer TEXT,
  
  -- Session
  session_id TEXT,
  ip_hash TEXT,
  
  -- UTM
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Device
  device_type TEXT,
  country_code TEXT,
  
  -- Engagement
  time_on_page_ms INTEGER,
  scroll_depth INTEGER,                       -- 0-100%
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_created ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_session ON public.page_views(session_id);

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view pageviews"
  ON public.page_views FOR SELECT
  USING (public.is_admin());

-- ============================================
-- 6. HELPER FUNCTION: Update Revenue Daily
-- ============================================

CREATE OR REPLACE FUNCTION public.update_revenue_daily(
  p_date DATE,
  p_product TEXT,
  p_amount DECIMAL,
  p_is_refund BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.revenue_daily (date)
  VALUES (p_date)
  ON CONFLICT (date) DO NOTHING;

  IF p_is_refund THEN
    UPDATE public.revenue_daily
    SET 
      refunds = refunds + p_amount,
      refund_count = refund_count + 1,
      net_revenue = net_revenue - p_amount,
      updated_at = NOW()
    WHERE date = p_date;
  ELSE
    UPDATE public.revenue_daily
    SET 
      analysis_revenue = CASE WHEN p_product = 'analysis' THEN analysis_revenue + p_amount ELSE analysis_revenue END,
      pro_revenue = CASE WHEN p_product = 'pro' THEN pro_revenue + p_amount ELSE pro_revenue END,
      ebook_revenue = CASE WHEN p_product = 'ebook' THEN ebook_revenue + p_amount ELSE ebook_revenue END,
      gross_revenue = gross_revenue + p_amount,
      net_revenue = net_revenue + p_amount,
      analysis_sales = CASE WHEN p_product = 'analysis' THEN analysis_sales + 1 ELSE analysis_sales END,
      pro_subscriptions = CASE WHEN p_product = 'pro' THEN pro_subscriptions + 1 ELSE pro_subscriptions END,
      ebook_sales = CASE WHEN p_product = 'ebook' THEN ebook_sales + 1 ELSE ebook_sales END,
      updated_at = NOW()
    WHERE date = p_date;
  END IF;
END;
$$;

-- ============================================
-- 7. HELPER FUNCTION: Update Costs Daily
-- ============================================

CREATE OR REPLACE FUNCTION public.update_costs_daily(
  p_date DATE,
  p_cost_type TEXT,
  p_amount DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.costs_daily (date)
  VALUES (p_date)
  ON CONFLICT (date) DO NOTHING;

  UPDATE public.costs_daily
  SET 
    claude_cost = CASE WHEN p_cost_type = 'claude' THEN claude_cost + p_amount ELSE claude_cost END,
    openai_cost = CASE WHEN p_cost_type = 'openai' THEN openai_cost + p_amount ELSE openai_cost END,
    gemini_cost = CASE WHEN p_cost_type = 'gemini' THEN gemini_cost + p_amount ELSE gemini_cost END,
    stripe_fees = CASE WHEN p_cost_type = 'stripe' THEN stripe_fees + p_amount ELSE stripe_fees END,
    email_cost = CASE WHEN p_cost_type = 'email' THEN email_cost + p_amount ELSE email_cost END,
    total_ai_cost = claude_cost + openai_cost + gemini_cost,
    total_cost = claude_cost + openai_cost + gemini_cost + stripe_fees + email_cost + hosting_cost + database_cost,
    ai_requests = CASE WHEN p_cost_type IN ('claude', 'openai', 'gemini') THEN ai_requests + 1 ELSE ai_requests END,
    emails_sent = CASE WHEN p_cost_type = 'email' THEN emails_sent + 1 ELSE emails_sent END,
    updated_at = NOW()
  WHERE date = p_date;
END;
$$;

-- ============================================
-- 8. HELPER FUNCTION: Parse User Agent
-- Returns device_type, browser, os
-- ============================================

CREATE OR REPLACE FUNCTION public.parse_user_agent(p_user_agent TEXT)
RETURNS TABLE (
  device_type TEXT,
  browser TEXT,
  os TEXT
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Device Type
  device_type := CASE
    WHEN p_user_agent ILIKE '%mobile%' OR p_user_agent ILIKE '%android%' THEN 'mobile'
    WHEN p_user_agent ILIKE '%ipad%' OR p_user_agent ILIKE '%tablet%' THEN 'tablet'
    ELSE 'desktop'
  END;

  -- Browser
  browser := CASE
    WHEN p_user_agent ILIKE '%chrome%' AND p_user_agent NOT ILIKE '%edge%' THEN 'chrome'
    WHEN p_user_agent ILIKE '%safari%' AND p_user_agent NOT ILIKE '%chrome%' THEN 'safari'
    WHEN p_user_agent ILIKE '%firefox%' THEN 'firefox'
    WHEN p_user_agent ILIKE '%edge%' THEN 'edge'
    ELSE 'other'
  END;

  -- OS
  os := CASE
    WHEN p_user_agent ILIKE '%windows%' THEN 'windows'
    WHEN p_user_agent ILIKE '%macintosh%' OR p_user_agent ILIKE '%mac os%' THEN 'macos'
    WHEN p_user_agent ILIKE '%iphone%' OR p_user_agent ILIKE '%ipad%' THEN 'ios'
    WHEN p_user_agent ILIKE '%android%' THEN 'android'
    WHEN p_user_agent ILIKE '%linux%' THEN 'linux'
    ELSE 'other'
  END;

  RETURN NEXT;
END;
$$;

-- ============================================
-- 9. HELPER FUNCTION: Increment Funnel Step
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_funnel_step(
  p_date DATE,
  p_step TEXT,
  p_device TEXT DEFAULT 'desktop'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure row exists
  INSERT INTO public.funnel_daily (date)
  VALUES (p_date)
  ON CONFLICT (date) DO NOTHING;

  -- Increment the specific step
  EXECUTE format(
    'UPDATE public.funnel_daily SET %I = %I + 1, updated_at = NOW() WHERE date = $1',
    p_step, p_step
  ) USING p_date;

  -- Increment device counter
  IF p_device = 'mobile' THEN
    UPDATE public.funnel_daily SET mobile_sessions = mobile_sessions + 1 WHERE date = p_date;
  ELSIF p_device = 'tablet' THEN
    UPDATE public.funnel_daily SET tablet_sessions = tablet_sessions + 1 WHERE date = p_date;
  ELSE
    UPDATE public.funnel_daily SET desktop_sessions = desktop_sessions + 1 WHERE date = p_date;
  END IF;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.analysis_sessions IS 'Detailed session tracking for each user journey through the analysis flow';
COMMENT ON TABLE public.revenue_daily IS 'Daily revenue aggregation for financial reporting';
COMMENT ON TABLE public.costs_daily IS 'Daily cost tracking for P&L calculations';
COMMENT ON TABLE public.funnel_daily IS 'Daily funnel step counts for conversion analysis';
COMMENT ON TABLE public.page_views IS 'Page view tracking for SEO and content analytics';

