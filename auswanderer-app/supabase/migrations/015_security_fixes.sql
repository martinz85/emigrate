-- =====================================================
-- Migration 015: Security Fixes from Code Review
-- =====================================================
-- Fixes critical security issue: increment_rate_limit was callable by anon/authenticated
-- This allowed any client to increment rate limits for arbitrary identifiers (DoS vector)

-- 1. REVOKE public access to increment_rate_limit
-- =====================================================
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(TEXT, TEXT) FROM anon;

-- Only service_role (admin client) can call this function now
-- The function is already SECURITY DEFINER so it executes with owner privileges

-- 2. Also restrict check_rate_limit for safety
-- =====================================================
-- While less critical, it's better to check rate limits server-side only
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER) FROM anon;

-- 3. Restrict get_today_global_count
-- =====================================================
REVOKE EXECUTE ON FUNCTION public.get_today_global_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_today_global_count() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_today_global_count() FROM anon;

-- Note: These functions are still accessible via service_role key (createAdminClient)
-- which is used in API routes on the server side

-- Additional security revokes are in migration 016

