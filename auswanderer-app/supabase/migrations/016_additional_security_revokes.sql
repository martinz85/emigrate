-- =====================================================
-- Migration 016: Additional Security Revokes
-- =====================================================
-- Additional function security from second code review

-- 1. Restrict increment_funnel_step (SECURITY DEFINER with dynamic SQL)
-- =====================================================
-- This function uses EXECUTE format() which could be a security risk if exposed
REVOKE EXECUTE ON FUNCTION public.increment_funnel_step(DATE, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_funnel_step(DATE, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_funnel_step(DATE, TEXT, TEXT) FROM anon;

-- 2. Restrict increment_daily_usage
-- =====================================================
REVOKE EXECUTE ON FUNCTION public.increment_daily_usage(DATE, INTEGER, INTEGER, NUMERIC) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_daily_usage(DATE, INTEGER, INTEGER, NUMERIC) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_usage(DATE, INTEGER, INTEGER, NUMERIC) FROM anon;

-- Note: These functions are still accessible via service_role key (createAdminClient)
-- which is used in API routes on the server side

