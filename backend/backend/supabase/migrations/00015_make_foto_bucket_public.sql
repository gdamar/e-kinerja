-- Migration: Make tugas-foto bucket public for task photos
-- This allows photos to be accessed via public URL

-- Update bucket to public
UPDATE storage.buckets
SET public = true
WHERE id = 'tugas-foto';

-- Create public read policy for tugas-foto
DROP POLICY IF EXISTS "tugas_foto_public_read" ON storage.objects;
CREATE POLICY "tugas_foto_public_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'tugas-foto'
    );
