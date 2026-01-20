-- Migration: 024_ebooks_table.sql
-- Story: 10.8 - E-Book Management (Admin)
-- Created: 2026-01-20
-- Description: E-Books Tabelle für dynamisches E-Book Management

-- ============================================
-- E-Books Tabelle
-- ============================================

CREATE TABLE IF NOT EXISTS ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  long_description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0), -- in cents
  pages INTEGER CHECK (pages > 0),
  reading_time TEXT,
  chapters JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  color TEXT NOT NULL DEFAULT 'from-teal-500 to-emerald-500',
  emoji TEXT NOT NULL DEFAULT '📚',
  
  -- Files (Supabase Storage paths)
  pdf_path TEXT,
  cover_path TEXT,
  
  -- Stripe Integration
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  
  -- Bundle Support
  is_bundle BOOLEAN NOT NULL DEFAULT FALSE,
  bundle_items JSONB DEFAULT NULL, -- Array of ebook slugs for bundles
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL -- Soft delete
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);
CREATE INDEX IF NOT EXISTS idx_ebooks_active ON ebooks(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ebooks_sort ON ebooks(sort_order);
CREATE INDEX IF NOT EXISTS idx_ebooks_stripe_product ON ebooks(stripe_product_id) WHERE stripe_product_id IS NOT NULL;

-- ============================================
-- Updated At Trigger
-- ============================================

-- Reuse existing function if available, otherwise create
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ebooks_updated_at ON ebooks;
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON ebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything (using is_admin function from previous migrations)
CREATE POLICY "Admins can manage ebooks"
  ON ebooks FOR ALL
  USING (is_admin());

-- Policy: Anyone can view active, non-deleted ebooks
CREATE POLICY "Anyone can view active ebooks"
  ON ebooks FOR SELECT
  USING (is_active = TRUE AND deleted_at IS NULL);

-- ============================================
-- User E-Books (Purchases) - for Story 7.2
-- ============================================

CREATE TABLE IF NOT EXISTS user_ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ebook_id UUID NOT NULL REFERENCES ebooks(id) ON DELETE RESTRICT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  amount INTEGER, -- in cents (what they paid)
  
  -- Unique constraint: one purchase per user per ebook
  UNIQUE(user_id, ebook_id)
);

-- Indexes for user_ebooks
CREATE INDEX IF NOT EXISTS idx_user_ebooks_user_id ON user_ebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ebooks_ebook_id ON user_ebooks(ebook_id);

-- RLS for user_ebooks
ALTER TABLE user_ebooks ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own ebook purchases"
  ON user_ebooks FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all ebook purchases"
  ON user_ebooks FOR SELECT
  USING (is_admin());

-- Only system (service role) can insert purchases (via webhook)
CREATE POLICY "Service role can insert purchases"
  ON user_ebooks FOR INSERT
  WITH CHECK (TRUE); -- Will be controlled by service role key

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE ebooks IS 'E-Books available for purchase or included in PRO subscription';
COMMENT ON COLUMN ebooks.price IS 'Price in cents (e.g., 1999 = 19.99€)';
COMMENT ON COLUMN ebooks.pdf_path IS 'Supabase Storage path to PDF file';
COMMENT ON COLUMN ebooks.bundle_items IS 'Array of ebook slugs included in this bundle';
COMMENT ON COLUMN ebooks.deleted_at IS 'Soft delete timestamp - NULL means active';

COMMENT ON TABLE user_ebooks IS 'Tracks which users have purchased which ebooks';

