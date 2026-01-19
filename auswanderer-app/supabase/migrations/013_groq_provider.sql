-- =====================================================
-- Migration 013: Add Groq AI Provider
-- =====================================================
-- Adds Groq as a 4th AI provider option with ultra-fast inference
-- Groq uses open-source models like Llama 3.1, Mixtral, Gemma

-- 0. Update CHECK constraint to allow 'groq' provider
-- =====================================================

-- Drop existing constraint
ALTER TABLE ai_provider_config DROP CONSTRAINT IF EXISTS ai_provider_config_provider_check;

-- Add new constraint including groq
ALTER TABLE ai_provider_config 
ADD CONSTRAINT ai_provider_config_provider_check 
CHECK (provider IN ('claude', 'openai', 'gemini', 'groq'));

-- Also update the model catalog constraint if it exists
ALTER TABLE ai_model_catalog DROP CONSTRAINT IF EXISTS ai_model_catalog_provider_check;

ALTER TABLE ai_model_catalog 
ADD CONSTRAINT ai_model_catalog_provider_check 
CHECK (provider IN ('claude', 'openai', 'gemini', 'groq'));

-- 1. Add Groq to provider config
-- =====================================================

-- First, check if groq provider already exists
INSERT INTO ai_provider_config (id, provider, model, is_active, priority, settings, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'groq',
  'llama-3.1-70b-versatile',
  false,  -- Inactive by default until API key is added
  4,      -- 4th priority (after Claude, OpenAI, Gemini)
  '{"maxTokens": 4096, "temperature": 0.7}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM ai_provider_config WHERE provider = 'groq'
);

-- 2. Add Groq models to catalog
-- =====================================================

-- Llama 3.1 70B Versatile (Best quality)
INSERT INTO ai_model_catalog (
  id, provider, name, input_cost_per_1k, output_cost_per_1k,
  max_tokens, context_window, is_latest, is_available, capabilities
) VALUES (
  'llama-3.1-70b-versatile',
  'groq',
  'Llama 3.1 70B Versatile',
  0.00059,  -- $0.59/1M tokens
  0.00079,  -- $0.79/1M tokens
  8192,
  131072,   -- 128K context
  true,
  true,
  '["chat", "function_calling"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  updated_at = NOW();

-- Llama 3.1 8B Instant (Fastest, cheapest)
INSERT INTO ai_model_catalog (
  id, provider, name, input_cost_per_1k, output_cost_per_1k,
  max_tokens, context_window, is_latest, is_available, capabilities
) VALUES (
  'llama-3.1-8b-instant',
  'groq',
  'Llama 3.1 8B Instant',
  0.00005,  -- $0.05/1M tokens
  0.00008,  -- $0.08/1M tokens
  8192,
  131072,   -- 128K context
  false,
  true,
  '["chat"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  updated_at = NOW();

-- Llama 3.3 70B Versatile (Newer version)
INSERT INTO ai_model_catalog (
  id, provider, name, input_cost_per_1k, output_cost_per_1k,
  max_tokens, context_window, is_latest, is_available, capabilities
) VALUES (
  'llama-3.3-70b-versatile',
  'groq',
  'Llama 3.3 70B Versatile',
  0.00059,
  0.00079,
  8192,
  131072,
  false,
  true,
  '["chat", "function_calling"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  updated_at = NOW();

-- Mixtral 8x7B (Good balance)
INSERT INTO ai_model_catalog (
  id, provider, name, input_cost_per_1k, output_cost_per_1k,
  max_tokens, context_window, is_latest, is_available, capabilities
) VALUES (
  'mixtral-8x7b-32768',
  'groq',
  'Mixtral 8x7B',
  0.00024,  -- $0.24/1M tokens
  0.00024,
  4096,
  32768,    -- 32K context
  false,
  true,
  '["chat"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  updated_at = NOW();

-- Gemma 2 9B (Google's open model on Groq)
INSERT INTO ai_model_catalog (
  id, provider, name, input_cost_per_1k, output_cost_per_1k,
  max_tokens, context_window, is_latest, is_available, capabilities
) VALUES (
  'gemma2-9b-it',
  'groq',
  'Gemma 2 9B',
  0.00020,
  0.00020,
  4096,
  8192,
  false,
  true,
  '["chat"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  input_cost_per_1k = EXCLUDED.input_cost_per_1k,
  output_cost_per_1k = EXCLUDED.output_cost_per_1k,
  updated_at = NOW();

-- 3. Update table comment
-- =====================================================

COMMENT ON TABLE ai_model_catalog IS 'AI Model Catalog - Supports Claude, OpenAI, Gemini, and Groq providers';

