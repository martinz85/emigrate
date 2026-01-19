-- =====================================================
-- Migration 014: Fix Provider Priorities
-- =====================================================
-- Ensures each provider has a unique priority (1-4)

-- Update priorities to be unique
UPDATE ai_provider_config SET priority = 1 WHERE provider = 'claude';
UPDATE ai_provider_config SET priority = 2 WHERE provider = 'openai';
UPDATE ai_provider_config SET priority = 3 WHERE provider = 'gemini';
UPDATE ai_provider_config SET priority = 4 WHERE provider = 'groq';

-- Set Claude as default catalog agent if none is set
UPDATE ai_provider_config 
SET is_catalog_agent = true 
WHERE provider = 'claude'
AND NOT EXISTS (SELECT 1 FROM ai_provider_config WHERE is_catalog_agent = true);


