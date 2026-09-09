-- Storage Buckets dan Policies untuk Sistem E-Kinerja
-- Migration: 00006_create_storage.sql
-- Created: 2026-09-07
-- Note: Run with service_role key or in Supabase Dashboard

-- ============================================
-- BUCKET: tugas-foto
-- Description: Storage untuk foto bukti tahapan tugas
-- Size limit: 5MB
-- Allowed types: image/jpeg, image/png, image/webp
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tugas-foto',
    'tugas-foto',
    false,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies untuk tugas-foto
CREATE POLICY "tugas_foto_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'tugas-foto' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "tugas_foto_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'tugas-foto' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "tugas_foto_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'tugas-foto' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "tugas_foto_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'tugas-foto' AND
        auth.uid() IS NOT NULL
    );

-- ============================================
-- BUCKET: cuti-lampiran
-- Description: Storage untuk lampiran dokumen cuti
-- Size limit: 10MB
-- Allowed types: application/pdf, image/jpeg, image/png
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cuti-lampiran',
    'cuti-lampiran',
    false,
    10485760, -- 10MB in bytes
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

-- Storage policies untuk cuti-lampiran
CREATE POLICY "cuti_lampiran_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'cuti-lampiran' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "cuti_lampiran_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'cuti-lampiran' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "cuti_lampiran_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'cuti-lampiran' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "cuti_lampiran_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'cuti-lampiran' AND
        auth.uid() IS NOT NULL
    );
