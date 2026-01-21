-- Migration: 039_site_media.sql
-- Media Management System - Site Media Table & Storage Bucket
-- Epic 14.2: Media Manager (GIF/MP4/Bild)

-- Create site_media table for managing uploaded media files
CREATE TABLE IF NOT EXISTS site_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- File Information
    file_path TEXT NOT NULL, -- e.g. 'site-media/hero_animation_2026-01-21.mp4'
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'gif', 'video')),
    mime_type TEXT NOT NULL, -- 'image/gif', 'video/mp4', 'image/jpeg', etc.
    file_size INTEGER NOT NULL, -- Size in bytes

    -- Usage Information
    usage_section TEXT, -- 'hero', 'loading_screen', null = unassigned
    is_active BOOLEAN DEFAULT true,

    -- Metadata (dimensions, duration, etc.)
    metadata JSONB DEFAULT '{}',

    -- Audit Information
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),

    -- Constraints
    UNIQUE(file_path) -- Prevent duplicate file paths
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_media_section ON site_media(usage_section) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_site_media_type ON site_media(file_type);
CREATE INDEX IF NOT EXISTS idx_site_media_active ON site_media(is_active);

-- Enable Row Level Security
ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin access (Admin can do everything)
CREATE POLICY "Admin can view all site media" ON site_media
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can insert site media" ON site_media
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update site media" ON site_media
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin can delete site media" ON site_media
    FOR DELETE USING (public.is_admin());

-- Public read access for active media (needed for frontend)
CREATE POLICY "Public can read active site media" ON site_media
    FOR SELECT USING (is_active = true);

-- Create storage bucket for site media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site-media',
    'site-media',
    true, -- Public bucket for frontend access
    20971520, -- 20MB limit (covers largest MP4 files)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for site-media bucket
-- Admin can upload any supported file type
CREATE POLICY "Admin can upload site media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'site-media'
        AND public.is_admin()
    );

-- Admin can update their uploaded media
CREATE POLICY "Admin can update site media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'site-media'
        AND public.is_admin()
    );

-- Admin can delete site media
CREATE POLICY "Admin can delete site media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'site-media'
        AND public.is_admin()
    );

-- Public can read site media (for frontend display)
CREATE POLICY "Public can read site media" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-media');

-- Function to get media URL
CREATE OR REPLACE FUNCTION get_site_media_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/site-media/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- Function to validate file assignment (only one active media per section)
CREATE OR REPLACE FUNCTION validate_section_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- If assigning to a section, deactivate any existing media for that section
    IF NEW.usage_section IS NOT NULL AND NEW.is_active = true THEN
        UPDATE site_media
        SET is_active = false, usage_section = NULL
        WHERE usage_section = NEW.usage_section
        AND id != NEW.id
        AND is_active = true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one active media per section
CREATE TRIGGER trigger_validate_section_assignment
    BEFORE INSERT OR UPDATE ON site_media
    FOR EACH ROW
    EXECUTE FUNCTION validate_section_assignment();
