-- Create ebooks storage bucket for PDF and cover files
-- Story 10.8 - E-Book Management (Admin)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebooks', 
  'ebooks', 
  false,  -- Private bucket (paid content)
  52428800,  -- 50 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the ebooks bucket

-- Policy: Admins can upload files
CREATE POLICY "Admins can upload ebooks files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ebooks' 
  AND is_admin()
);

-- Policy: Admins can update files
CREATE POLICY "Admins can update ebooks files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ebooks' 
  AND is_admin()
);

-- Policy: Admins can delete files
CREATE POLICY "Admins can delete ebooks files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ebooks' 
  AND is_admin()
);

-- Policy: Authenticated users can read ebooks files
-- (More restrictive policy based on purchases can be added later)
CREATE POLICY "Authenticated users can read ebooks files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ebooks'
);
