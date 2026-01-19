-- ============================================
-- Migration 010: AI Provider Configuration
--
-- Epic 14: Multi-Provider AI System
-- - Provider configuration (Claude, OpenAI, Gemini)
-- - Model catalog with pricing
-- - Model update suggestions from AI agent
-- ============================================

-- ============================================
-- 1. AI PROVIDER CONFIGURATION
-- Stores active provider settings with priority
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_provider_config (
  id TEXT PRIMARY KEY,  -- 'primary', 'fallback_1', 'fallback_2'
  provider TEXT NOT NULL CHECK (provider IN ('claude', 'openai', 'gemini')),
  model TEXT NOT NULL,
  api_key_encrypted TEXT,  -- AES-256-GCM encrypted
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,  -- Lower = higher priority
  settings JSONB DEFAULT '{}'::jsonb,  -- max_tokens, temperature, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.ai_provider_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage provider config
CREATE POLICY "Admins can manage AI providers"
  ON public.ai_provider_config FOR ALL
  USING (public.is_admin());

-- Insert default configuration
INSERT INTO public.ai_provider_config (id, provider, model, priority, settings) VALUES
  ('primary', 'claude', 'claude-3-5-sonnet-20241022', 0, '{"max_tokens": 4096, "temperature": 0.7}'),
  ('fallback_1', 'openai', 'gpt-4o', 1, '{"max_tokens": 4096, "temperature": 0.7}'),
  ('fallback_2', 'gemini', 'gemini-1.5-pro', 2, '{"max_tokens": 4096, "temperature": 0.7}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. AI MODEL CATALOG
-- Stores all available models with pricing
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_model_catalog (
  id TEXT PRIMARY KEY,  -- e.g. 'claude-3-5-sonnet-20241022'
  provider TEXT NOT NULL CHECK (provider IN ('claude', 'openai', 'gemini')),
  name TEXT NOT NULL,  -- Display name
  description TEXT,
  input_cost_per_1k DECIMAL(10,6) NOT NULL,  -- Cost per 1K input tokens
  output_cost_per_1k DECIMAL(10,6) NOT NULL,  -- Cost per 1K output tokens
  max_tokens INTEGER DEFAULT 4096,
  context_window INTEGER,  -- Max context size
  is_latest BOOLEAN DEFAULT false,  -- Latest version of this model family
  is_deprecated BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,  -- Currently available from provider
  released_at DATE,
  deprecated_at DATE,
  capabilities JSONB DEFAULT '[]'::jsonb,  -- ['chat', 'vision', 'function_calling']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.ai_model_catalog ENABLE ROW LEVEL SECURITY;

-- Anyone can read model catalog (needed for pricing display)
CREATE POLICY "Anyone can read AI models"
  ON public.ai_model_catalog FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage AI models"
  ON public.ai_model_catalog FOR ALL
  USING (public.is_admin());

-- Insert default model catalog
INSERT INTO public.ai_model_catalog (id, provider, name, input_cost_per_1k, output_cost_per_1k, max_tokens, context_window, is_latest, released_at, capabilities) VALUES
  -- Claude Models
  ('claude-3-5-sonnet-20241022', 'claude', 'Claude 3.5 Sonnet', 0.003, 0.015, 8192, 200000, true, '2024-10-22', '["chat", "vision", "function_calling"]'),
  ('claude-3-opus-20240229', 'claude', 'Claude 3 Opus', 0.015, 0.075, 4096, 200000, false, '2024-02-29', '["chat", "vision", "function_calling"]'),
  ('claude-3-sonnet-20240229', 'claude', 'Claude 3 Sonnet', 0.003, 0.015, 4096, 200000, false, '2024-02-29', '["chat", "vision", "function_calling"]'),
  ('claude-3-haiku-20240307', 'claude', 'Claude 3 Haiku', 0.00025, 0.00125, 4096, 200000, false, '2024-03-07', '["chat", "vision", "function_calling"]'),
  
  -- OpenAI Models
  ('gpt-4o', 'openai', 'GPT-4o', 0.005, 0.015, 4096, 128000, true, '2024-05-13', '["chat", "vision", "function_calling"]'),
  ('gpt-4o-mini', 'openai', 'GPT-4o Mini', 0.00015, 0.0006, 16384, 128000, false, '2024-07-18', '["chat", "vision", "function_calling"]'),
  ('gpt-4-turbo', 'openai', 'GPT-4 Turbo', 0.01, 0.03, 4096, 128000, false, '2024-04-09', '["chat", "vision", "function_calling"]'),
  
  -- Gemini Models
  ('gemini-1.5-pro', 'gemini', 'Gemini 1.5 Pro', 0.00125, 0.005, 8192, 2000000, true, '2024-02-15', '["chat", "vision", "function_calling"]'),
  ('gemini-1.5-flash', 'gemini', 'Gemini 1.5 Flash', 0.000075, 0.0003, 8192, 1000000, false, '2024-05-14', '["chat", "vision", "function_calling"]'),
  ('gemini-2.0-flash-exp', 'gemini', 'Gemini 2.0 Flash (Experimental)', 0.0001, 0.0004, 8192, 1000000, false, '2024-12-11', '["chat", "vision", "function_calling"]')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. AI MODEL UPDATES (from Catalog Agent)
-- Stores suggested updates from weekly AI check
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_model_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_type TEXT NOT NULL CHECK (update_type IN ('new_model', 'price_change', 'deprecated', 'capability_change')),
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  current_data JSONB,  -- Current state in our catalog
  suggested_data JSONB NOT NULL,  -- Suggested new state
  change_summary TEXT,  -- Human-readable summary
  source_url TEXT,  -- URL where change was found
  confidence DECIMAL(3,2),  -- AI confidence (0.00 - 1.00)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'invalid')),
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dismissed_at TIMESTAMPTZ,
  dismissed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dismiss_reason TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_model_updates_status ON public.ai_model_updates(status);
CREATE INDEX IF NOT EXISTS idx_model_updates_checked ON public.ai_model_updates(checked_at DESC);

-- RLS
ALTER TABLE public.ai_model_updates ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage updates
CREATE POLICY "Admins can manage model updates"
  ON public.ai_model_updates FOR ALL
  USING (public.is_admin());

-- ============================================
-- 4. CATALOG CHECK LOG
-- Tracks when the AI agent ran
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_catalog_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('cron', 'manual')),
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  models_checked INTEGER DEFAULT 0,
  updates_found INTEGER DEFAULT 0,
  ai_model_used TEXT,
  ai_input_tokens INTEGER,
  ai_output_tokens INTEGER,
  ai_cost_usd DECIMAL(10,6),
  duration_ms INTEGER,
  error_message TEXT,
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.ai_catalog_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view catalog checks"
  ON public.ai_catalog_checks FOR ALL
  USING (public.is_admin());

-- ============================================
-- 5. HELPER FUNCTION: Get Active Provider
-- Returns the highest priority active provider
-- ============================================

CREATE OR REPLACE FUNCTION public.get_active_ai_provider()
RETURNS TABLE (
  id TEXT,
  provider TEXT,
  model TEXT,
  settings JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id, provider, model, settings
  FROM public.ai_provider_config
  WHERE is_active = true
  ORDER BY priority ASC
  LIMIT 1;
$$;

-- ============================================
-- 6. HELPER FUNCTION: Get Model Cost
-- Returns cost info for a specific model
-- ============================================

CREATE OR REPLACE FUNCTION public.get_ai_model_cost(p_model_id TEXT)
RETURNS TABLE (
  input_cost_per_1k DECIMAL,
  output_cost_per_1k DECIMAL
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT input_cost_per_1k, output_cost_per_1k
  FROM public.ai_model_catalog
  WHERE id = p_model_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_model_cost(TEXT) TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.ai_provider_config IS 'Active AI provider configuration with fallback priorities';
COMMENT ON TABLE public.ai_model_catalog IS 'Catalog of all available AI models with pricing';
COMMENT ON TABLE public.ai_model_updates IS 'Suggested model updates from the AI catalog agent';
COMMENT ON TABLE public.ai_catalog_checks IS 'Log of AI catalog check runs';

