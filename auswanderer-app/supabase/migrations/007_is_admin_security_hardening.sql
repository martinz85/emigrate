-- ============================================
-- Migration 007: is_admin() Security Hardening
--
-- Best Practice: Revoke default PUBLIC execute grant
-- and explicitly grant only to authenticated users.
--
-- By default, PostgreSQL functions are executable by PUBLIC.
-- While auth.uid() returns NULL for anonymous, it's cleaner
-- to explicitly restrict access.
-- ============================================

-- Revoke default PUBLIC access
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;

-- Explicitly grant to authenticated users only
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Comment documenting security decision
COMMENT ON FUNCTION public.is_admin() IS 
  'Security-hardened admin check. SECURITY DEFINER to bypass RLS, '
  'REVOKE FROM PUBLIC to prevent anonymous execution, '
  'SET search_path to prevent hijacking.';


