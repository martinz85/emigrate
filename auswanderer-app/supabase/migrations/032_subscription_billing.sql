-- ============================================
-- Migration 032: Add subscription_billing column ONLY
-- Story 8.2: Subscription Checkout
-- 
-- NOTE: This migration adds ONLY the billing cycle field.
-- Other subscription fields (subscription_tier, subscription_status, 
-- subscription_period_end, stripe_subscription_id) are in earlier migrations.
-- ============================================

-- Add billing cycle field to track monthly vs yearly subscription
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_billing TEXT 
  CHECK (subscription_billing IN ('monthly', 'yearly', NULL));

-- Comment for documentation
COMMENT ON COLUMN public.profiles.subscription_billing IS 'Subscription billing cycle: monthly or yearly';

