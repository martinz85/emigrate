-- Migration: Create question-images storage bucket
-- Description: Creates a public storage bucket for question images

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for question-images bucket

-- Allow public read access to all files
CREATE POLICY "Public read access for question images"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-images');

-- Allow authenticated admins to upload files
CREATE POLICY "Admin upload access for question images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'question-images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow authenticated admins to update files
CREATE POLICY "Admin update access for question images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'question-images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow authenticated admins to delete files
CREATE POLICY "Admin delete access for question images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'question-images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

