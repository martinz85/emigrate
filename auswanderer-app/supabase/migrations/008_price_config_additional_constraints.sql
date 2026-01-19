-- ============================================
-- Migration 008: Additional Price Config Constraints
--
-- Based on Code Review feedback:
-- 1. Non-negative price constraints
-- 2. Campaign active requires campaign_price
-- 3. Regular price must be > 0
-- ============================================

-- Ensure regular_price is always positive (not zero, not negative)
ALTER TABLE public.price_config
DROP CONSTRAINT IF EXISTS check_regular_price_positive;

ALTER TABLE public.price_config
ADD CONSTRAINT check_regular_price_positive 
CHECK (regular_price > 0);

-- Ensure campaign_price is non-negative (can be NULL, but if set must be >= 0)
ALTER TABLE public.price_config
DROP CONSTRAINT IF EXISTS check_campaign_price_non_negative;

ALTER TABLE public.price_config
ADD CONSTRAINT check_campaign_price_non_negative 
CHECK (campaign_price IS NULL OR campaign_price >= 0);

-- If campaign_active is true, campaign_price must be set
ALTER TABLE public.price_config
DROP CONSTRAINT IF EXISTS check_campaign_active_requires_price;

ALTER TABLE public.price_config
ADD CONSTRAINT check_campaign_active_requires_price 
CHECK (campaign_active = false OR campaign_price IS NOT NULL);

-- Comment
COMMENT ON TABLE public.price_config IS 
  'Produkt-Preise mit Kampagnen-Support. Constraints: regular_price > 0, '
  'campaign_price >= 0 (wenn gesetzt), campaign_price < regular_price, '
  'campaign_active erfordert campaign_price.';


