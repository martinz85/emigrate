-- ============================================
-- Migration 005: Fix Admin RLS Infinite Recursion
--
-- Problem: Die admin_users Policy referenziert sich selbst,
--          was zu "infinite recursion" führt.
-- Lösung: Verwende auth.uid() direkt statt Subquery.
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create fixed policy: Check if current user's ID exists in admin_users
-- We use a direct comparison instead of a subquery to avoid recursion
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (
    -- User can view their own admin record
    id = auth.uid()
  );

-- Also allow admins to see ALL admin users (for admin list view)
-- This requires a different approach: use SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Now update policies that need admin check to use the function
-- This avoids the recursive lookup

-- Update discount_codes policy to use the function
DROP POLICY IF EXISTS "Admins can manage discount codes" ON public.discount_codes;

CREATE POLICY "Admins can manage discount codes"
  ON public.discount_codes FOR ALL
  USING (public.is_admin());

-- Update price_config policy if exists
DROP POLICY IF EXISTS "Admins can manage prices" ON public.price_config;

CREATE POLICY "Admins can manage prices"
  ON public.price_config FOR ALL
  USING (public.is_admin());

-- Update audit_logs policy to use the function
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- Add policy for admins to view ALL admin users (not just their own)
CREATE POLICY "Admins can view all admin users"
  ON public.admin_users FOR SELECT
  USING (public.is_admin());

-- Comment
COMMENT ON FUNCTION public.is_admin() IS 'Security definer function to check admin status without RLS recursion';

