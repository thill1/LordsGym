-- Create storage bucket 'media' and policies for Media Library uploads
-- Run this migration if the media bucket does not exist (setup requires manual creation otherwise)

-- Create bucket if not exists (Supabase storage.buckets schema)
-- Minimal INSERT; add file_size_limit/allowed_mime_types if your schema supports them
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects (Media Library needs INSERT, SELECT, UPDATE, DELETE)
-- Allow authenticated users to upload to media bucket
DROP POLICY IF EXISTS "Authenticated users can upload to media bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload to media bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow public read (media bucket is public)
DROP POLICY IF EXISTS "Public read for media bucket" ON storage.objects;
CREATE POLICY "Public read for media bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to update/delete objects in media bucket
DROP POLICY IF EXISTS "Authenticated users can update media bucket objects" ON storage.objects;
CREATE POLICY "Authenticated users can update media bucket objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can delete media bucket objects" ON storage.objects;
CREATE POLICY "Authenticated users can delete media bucket objects"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
