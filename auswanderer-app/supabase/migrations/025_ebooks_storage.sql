-- Migration: 025_ebooks_storage.sql
-- Story: 10.8 - E-Book Management (Admin)
-- Created: 2026-01-20
-- Description: Storage policies for ebooks bucket
-- 
-- NOTE: The 'ebooks' bucket must be created manually in Supabase Dashboard:
-- 1. Go to Storage → New Bucket
-- 2. Name: ebooks
-- 3. Public: false
-- 4. File size limit: 52428800 (50MB)
-- 5. Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp

-- ============================================
-- Storage Policies for 'ebooks' bucket
-- ============================================

-- Policy: Admins can upload files to ebooks bucket
CREATE POLICY "Admins can upload ebook files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ebooks' AND
    is_admin()
  );

-- Policy: Admins can update/replace files
CREATE POLICY "Admins can update ebook files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ebooks' AND
    is_admin()
  );

-- Policy: Admins can delete files
CREATE POLICY "Admins can delete ebook files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ebooks' AND
    is_admin()
  );

-- Policy: Admins can view all files
CREATE POLICY "Admins can view all ebook files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ebooks' AND
    is_admin()
  );

-- Policy: Users can download their purchased ebooks
-- Path format: {ebook_id}/ebook.pdf or {ebook_id}/cover.jpg
CREATE POLICY "Buyers can download purchased ebooks"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ebooks' AND
    EXISTS (
      SELECT 1 FROM user_ebooks ue
      JOIN ebooks e ON e.id = ue.ebook_id
      WHERE ue.user_id = auth.uid()
      AND (
        -- Match PDF files for this ebook
        name LIKE e.id::text || '/%'
      )
    )
  );

-- Policy: PRO users can download all ebooks
CREATE POLICY "PRO users can download all ebooks"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ebooks' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND subscription_tier = 'pro'
    )
  );

-- Note: COMMENT ON storage.objects policies is not allowed via migrations
-- The policies are self-documenting via their names

