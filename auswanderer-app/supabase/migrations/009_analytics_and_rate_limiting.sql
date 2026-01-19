-- ============================================
-- Migration 009: Analytics & Rate Limiting
--
-- Epic 13: Cost Control & Usage Analytics
-- - System settings (configurable limits)
-- - Usage statistics tracking
-- - Rate limiting support
-- ============================================

-- ============================================
-- 1. SYSTEM SETTINGS TABLE
-- Stores configurable limits and settings
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for rate limit checks)
CREATE POLICY "Anyone can read settings"
  ON public.system_settings FOR SELECT
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage settings"
  ON public.system_settings FOR ALL
  USING (public.is_admin());

-- Insert default settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('rate_limit_ip_daily', '{"limit": 3}', 'Max free analyses per IP per day'),
  ('rate_limit_session_total', '{"limit": 5}', 'Max free analyses per session total'),
  ('rate_limit_global_daily', '{"limit": 100}', 'Max total analyses per day (global)'),
  ('budget_daily_usd', '{"limit": 50, "warning_percent": 80}', 'Daily Claude API budget in USD'),
  ('budget_monthly_usd', '{"limit": 1500, "warning_percent": 80}', 'Monthly Claude API budget in USD'),
  ('claude_cost_per_1k_input', '{"cost": 0.003}', 'Claude 3.5 Sonnet input cost per 1K tokens'),
  ('claude_cost_per_1k_output', '{"cost": 0.015}', 'Claude 3.5 Sonnet output cost per 1K tokens')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. USAGE STATISTICS TABLE
-- Tracks each analysis request for analytics
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_hash TEXT, -- Hashed IP for privacy (SHA256)
  
  -- Analysis info
  analysis_id UUID,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER, -- Total duration in milliseconds
  
  -- Progress tracking
  step_reached TEXT, -- 'pre_analysis', 'rating_1', 'rating_15', 'loading', 'result', 'checkout', 'paid'
  questions_answered INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_abandoned BOOLEAN DEFAULT FALSE,
  abandoned_at_step TEXT,
  
  -- Claude API usage
  claude_input_tokens INTEGER,
  claude_output_tokens INTEGER,
  claude_total_tokens INTEGER,
  claude_cost_usd DECIMAL(10, 6), -- Calculated cost
  claude_model TEXT,
  claude_request_id TEXT,
  
  -- Result
  converted_to_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  
  -- Metadata
  user_agent TEXT,
  referrer TEXT,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON public.usage_stats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_stats_ip_hash ON public.usage_stats(ip_hash);
CREATE INDEX IF NOT EXISTS idx_usage_stats_session_id ON public.usage_stats(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_is_completed ON public.usage_stats(is_completed);
-- Note: For date-based queries, use range queries on created_at index above
-- Example: WHERE created_at >= '2025-01-01' AND created_at < '2025-01-02'

-- RLS
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Only admins can read usage stats
CREATE POLICY "Admins can view usage stats"
  ON public.usage_stats FOR SELECT
  USING (public.is_admin());

-- Service role can insert (via API)
-- No explicit policy needed, service_role bypasses RLS

-- ============================================
-- 3. DAILY USAGE AGGREGATES (for fast lookups)
-- ============================================

CREATE TABLE IF NOT EXISTS public.daily_usage (
  date DATE PRIMARY KEY,
  total_analyses INTEGER DEFAULT 0,
  completed_analyses INTEGER DEFAULT 0,
  abandoned_analyses INTEGER DEFAULT 0,
  paid_conversions INTEGER DEFAULT 0,
  total_input_tokens INTEGER DEFAULT 0,
  total_output_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,
  unique_ips INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view daily usage"
  ON public.daily_usage FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage daily usage"
  ON public.daily_usage FOR ALL
  USING (public.is_admin());

-- ============================================
-- 4. RATE LIMIT TRACKING (for IP/session limits)
-- Uses a separate fast-lookup table
-- ============================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- 'ip:hash' or 'session:id'
  identifier_type TEXT NOT NULL, -- 'ip' or 'session'
  date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(identifier, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_date ON public.rate_limits(identifier, date);
CREATE INDEX IF NOT EXISTS idx_rate_limits_date ON public.rate_limits(date);

-- RLS (public read needed for rate limit checks)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rate limits"
  ON public.rate_limits FOR SELECT
  USING (true);

-- Service role inserts/updates
-- No explicit policy needed

-- ============================================
-- 5. HELPER FUNCTION: Check Rate Limit
-- Returns true if limit exceeded
-- ============================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_limit INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT count INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND date = CURRENT_DATE;
  
  RETURN COALESCE(current_count, 0) >= p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER) TO authenticated, anon;

-- ============================================
-- 6. HELPER FUNCTION: Increment Rate Limit
-- Increments counter and returns new count
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO public.rate_limits (identifier, identifier_type, date, count, last_request_at)
  VALUES (p_identifier, p_identifier_type, CURRENT_DATE, 1, NOW())
  ON CONFLICT (identifier, date) DO UPDATE
  SET count = rate_limits.count + 1,
      last_request_at = NOW()
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_rate_limit(TEXT, TEXT) TO authenticated, anon;

-- ============================================
-- 7. HELPER FUNCTION: Get Today's Global Count
-- ============================================

CREATE OR REPLACE FUNCTION public.get_today_global_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(total_analyses, 0)
  FROM public.daily_usage
  WHERE date = CURRENT_DATE;
$$;

GRANT EXECUTE ON FUNCTION public.get_today_global_count() TO authenticated, anon;

-- ============================================
-- 7b. HELPER FUNCTION: Increment Daily Usage
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_daily_usage(
  p_date DATE,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_cost DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_usage (date, total_analyses, total_input_tokens, total_output_tokens, total_cost_usd, updated_at)
  VALUES (p_date, 1, p_input_tokens, p_output_tokens, p_cost, NOW())
  ON CONFLICT (date) DO UPDATE
  SET 
    total_analyses = daily_usage.total_analyses + 1,
    total_input_tokens = daily_usage.total_input_tokens + p_input_tokens,
    total_output_tokens = daily_usage.total_output_tokens + p_output_tokens,
    total_cost_usd = daily_usage.total_cost_usd + p_cost,
    updated_at = NOW();
END;
$$;

-- Only service role should call this
REVOKE ALL ON FUNCTION public.increment_daily_usage(DATE, INTEGER, INTEGER, DECIMAL) FROM PUBLIC;

-- ============================================
-- 8. CLEANUP: Auto-delete old rate limit entries
-- Run via pg_cron or manual cleanup
-- ============================================

-- Function to clean up old data (call weekly)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE date < CURRENT_DATE - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Comment
COMMENT ON TABLE public.system_settings IS 'Configurable system settings for rate limits and budgets';
COMMENT ON TABLE public.usage_stats IS 'Detailed usage statistics for each analysis session';
COMMENT ON TABLE public.daily_usage IS 'Aggregated daily usage for fast dashboard queries';
COMMENT ON TABLE public.rate_limits IS 'Rate limiting counters per IP/session per day';


