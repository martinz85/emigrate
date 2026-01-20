-- Migration: 026_create_ebooks_bucket.sql
-- Story: 10.8 - E-Book Management (Admin)
-- Created: 2026-01-20
-- Description: Create the ebooks storage bucket

-- Insert bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebooks',
  'ebooks',
  false,
  52428800, -- 50 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

