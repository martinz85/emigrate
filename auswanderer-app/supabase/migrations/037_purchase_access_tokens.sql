-- Migration: 037_purchase_access_tokens.sql
-- Description: Enables guests to access their purchased content via magic link
--              Stores temporary access tokens for email-based purchase retrieval

-- ============================================
-- Purchase Access Tokens Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchase_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  
  -- Purchased content IDs
  analysis_ids UUID[] DEFAULT '{}',
  ebook_ids UUID[] DEFAULT '{}',
  
  -- Token lifecycle
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  -- Usage tracking
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_access_tokens_token ON public.purchase_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_purchase_access_tokens_email ON public.purchase_access_tokens(email);
CREATE INDEX IF NOT EXISTS idx_purchase_access_tokens_expires ON public.purchase_access_tokens(expires_at) WHERE used_at IS NULL;

-- RLS
ALTER TABLE public.purchase_access_tokens ENABLE ROW LEVEL SECURITY;

-- No SELECT policy - tokens are accessed via API only (with service_role)
-- Service role bypasses RLS for insert/update

-- ============================================
-- Auto-cleanup expired tokens (optional)
-- ============================================
-- Cleanup function (can be called by cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_purchase_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete tokens older than 7 days
  DELETE FROM purchase_access_tokens
  WHERE expires_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE public.purchase_access_tokens IS 'Temporary magic link tokens for guest users to access their purchased content';
COMMENT ON COLUMN public.purchase_access_tokens.token IS 'Unique token (UUID) for magic link';
COMMENT ON COLUMN public.purchase_access_tokens.analysis_ids IS 'Array of purchased analysis IDs accessible with this token';
COMMENT ON COLUMN public.purchase_access_tokens.ebook_ids IS 'Array of purchased ebook IDs accessible with this token';
COMMENT ON COLUMN public.purchase_access_tokens.expires_at IS 'Token expiration timestamp (typically 24h from creation)';
COMMENT ON COLUMN public.purchase_access_tokens.used_at IS 'First time the token was used (for tracking)';
COMMENT ON COLUMN public.purchase_access_tokens.access_count IS 'Number of times the token was used';

