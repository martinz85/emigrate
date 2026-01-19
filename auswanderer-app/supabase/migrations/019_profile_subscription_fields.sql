-- ============================================
-- Migration 019: Add subscription fields to profiles
-- Fixes: useSubscriptionStatus hook expects these fields
-- ============================================

-- Add missing subscription tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', NULL)),
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- Index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription 
ON public.profiles(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON public.profiles(subscription_status) 
WHERE subscription_status IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe Subscription ID for PRO users (sub_xxx)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe subscription status: active, canceled, past_due, incomplete, trialing';
COMMENT ON COLUMN public.profiles.subscription_period_end IS 'When the current subscription period ends (for showing renewal/expiry date)';

