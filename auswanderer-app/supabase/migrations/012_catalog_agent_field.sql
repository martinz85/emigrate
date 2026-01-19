-- ============================================
-- Migration 012: Add is_catalog_agent field
--
-- Allows configuring which provider should be
-- used for the weekly catalog check
-- ============================================

-- Add column if not exists
ALTER TABLE public.ai_provider_config
ADD COLUMN IF NOT EXISTS is_catalog_agent BOOLEAN DEFAULT FALSE;

-- Comment
COMMENT ON COLUMN public.ai_provider_config.is_catalog_agent IS 
  'If true, this provider is used for weekly model catalog checks';

-- Default: Set Gemini as catalog agent (free tier)
UPDATE public.ai_provider_config 
SET is_catalog_agent = TRUE 
WHERE provider = 'gemini';

