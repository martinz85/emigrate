-- Migration: 029_security_fixes.sql
-- Story: 10.8 - E-Book Management Security Fixes
-- Created: 2026-01-20
-- Description: Fixes critical security vulnerabilities from code review

-- ============================================
-- CRITICAL FIX: user_ebooks INSERT Policy
-- The original policy WITH CHECK (TRUE) allows ANY authenticated user
-- to insert purchase records, effectively granting themselves access.
-- 
-- Fix: Remove the policy entirely. Inserts will only work via service_role
-- which bypasses RLS. This is the correct pattern for webhook handlers.
-- ============================================

DROP POLICY IF EXISTS "Service role can insert purchases" ON user_ebooks;

-- Note: We do NOT create a replacement INSERT policy.
-- Service role (used by webhooks) bypasses RLS entirely.
-- This prevents any client-side INSERT attempts.

-- Also add UPDATE/DELETE policies for service role operations
-- (These are also handled by service_role bypassing RLS)

-- ============================================
-- HIGH FIX: Storage RLS - Restrict read access
-- The original policy allowed ANY authenticated user to read ALL files.
-- This grants access to paid PDFs to anyone who can guess a path.
--
-- Fix: Only allow reads for:
-- 1. Admins (for management)
-- 2. Users who have purchased the ebook
-- 3. PRO subscribers
-- ============================================

-- Drop the overly permissive read policy
DROP POLICY IF EXISTS "Authenticated users can read ebooks files" ON storage.objects;

-- Create helper function to check ebook access
CREATE OR REPLACE FUNCTION has_ebook_access(file_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  ebook_uuid UUID;
  user_has_purchase BOOLEAN;
  user_is_pro BOOLEAN;
BEGIN
  -- Extract ebook ID from path (format: {uuid}/filename)
  ebook_uuid := (regexp_match(file_path, '^([0-9a-f-]{36})/'))[1]::UUID;
  
  IF ebook_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has purchased this ebook
  SELECT EXISTS (
    SELECT 1 FROM user_ebooks
    WHERE user_id = auth.uid()
    AND ebook_id = ebook_uuid
  ) INTO user_has_purchase;
  
  IF user_has_purchase THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is PRO subscriber
  -- Note: Adjust this based on your subscription model
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = auth.uid()
    AND status IN ('active', 'trialing')
    AND plan_type = 'pro'
  ) INTO user_is_pro;
  
  RETURN user_is_pro;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Only admins and purchasers/PRO can read ebook files
CREATE POLICY "Authorized users can read ebooks files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ebooks'
  AND (
    -- Admins can read everything
    is_admin()
    OR
    -- Purchasers and PRO subscribers
    has_ebook_access(name)
  )
);

-- ============================================
-- Additional: Ensure soft-deleted ebooks don't block new slugs
-- Add partial unique index that excludes deleted items
-- ============================================

-- First drop the existing unique constraint
ALTER TABLE ebooks DROP CONSTRAINT IF EXISTS ebooks_slug_key;

-- Create partial unique index (only for non-deleted items)
DROP INDEX IF EXISTS idx_ebooks_slug_unique_active;
CREATE UNIQUE INDEX idx_ebooks_slug_unique_active 
ON ebooks (slug) 
WHERE deleted_at IS NULL;

-- ============================================
-- Comments
-- ============================================

COMMENT ON FUNCTION has_ebook_access IS 'Check if current user has access to ebook files (purchase or PRO subscription)';

