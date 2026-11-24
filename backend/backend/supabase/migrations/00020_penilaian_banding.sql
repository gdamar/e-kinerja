-- Migration: Fitur Pengajuan Banding Penilaian Kinerja
-- File: 00020_penilaian_banding.sql

-- 1. Buat tabel penilaian_banding
CREATE TABLE IF NOT EXISTS penilaian_banding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_penilaian UUID NOT NULL REFERENCES penilaian(id) ON DELETE CASCADE,
    catatan_petugas TEXT NOT NULL,
    catatan_operator TEXT,
    lampiran_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'Menunggu' 
        CHECK (status IN ('Menunggu', 'Disetujui', 'Ditangguhkan', 'Ditolak')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    CONSTRAINT cek_catatan_operator_wajib CHECK (
        (status = 'Menunggu') OR 
        (status != 'Menunggu' AND catatan_operator IS NOT NULL AND length(trim(catatan_operator)) > 0)
    )
);

-- 2. Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_penilaian_banding_penilaian ON penilaian_banding(id_penilaian);
CREATE INDEX IF NOT EXISTS idx_penilaian_banding_status ON penilaian_banding(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE penilaian_banding ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Operator: Akses penuh (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "penilaian_banding_operator_all" ON penilaian_banding;
CREATE POLICY "penilaian_banding_operator_all" ON penilaian_banding
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM master_petugas mp
        WHERE mp.email = (auth.jwt() ->> 'email')
          AND mp.role_id = 2
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM master_petugas mp
        WHERE mp.email = (auth.jwt() ->> 'email')
          AND mp.role_id = 2
    )
);

-- Kepala Sesi: Akses baca saja (SELECT)
DROP POLICY IF EXISTS "penilaian_banding_kepala_read" ON penilaian_banding;
CREATE POLICY "penilaian_banding_kepala_read" ON penilaian_banding
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM master_petugas mp
        WHERE mp.email = (auth.jwt() ->> 'email')
          AND mp.role_id = 3
    )
);

-- Petugas: Akses baca (SELECT) permohonan banding atas penilaian miliknya sendiri
DROP POLICY IF EXISTS "penilaian_banding_petugas_read" ON penilaian_banding;
CREATE POLICY "penilaian_banding_petugas_read" ON penilaian_banding
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM penilaian p
        JOIN master_petugas mp ON mp.id = p.id_petugas
        WHERE p.id = penilaian_banding.id_penilaian
          AND mp.email = (auth.jwt() ->> 'email')
    )
);

-- Petugas: Akses buat (INSERT) permohonan banding atas penilaian miliknya sendiri
DROP POLICY IF EXISTS "penilaian_banding_petugas_insert" ON penilaian_banding;
CREATE POLICY "penilaian_banding_petugas_insert" ON penilaian_banding
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM penilaian p
        JOIN master_petugas mp ON mp.id = p.id_petugas
        WHERE p.id = penilaian_banding.id_penilaian
          AND mp.email = (auth.jwt() ->> 'email')
    )
);

-- 5. Storage Bucket & Storage RLS
-- Pastikan bucket penilaian-lampiran tersedia dan bersifat publik
INSERT INTO storage.buckets (id, name, public)
VALUES ('penilaian-lampiran', 'penilaian-lampiran', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Publik dapat melihat/mengunduh lampiran bukti banding
DROP POLICY IF EXISTS "penilaian_lampiran_public_select" ON storage.objects;
CREATE POLICY "penilaian_lampiran_public_select" ON storage.objects
FOR SELECT
USING (bucket_id = 'penilaian-lampiran');

-- Storage Policy: Pengguna authenticated dapat mengunggah file ke bucket penilaian-lampiran
DROP POLICY IF EXISTS "penilaian_lampiran_auth_insert" ON storage.objects;
CREATE POLICY "penilaian_lampiran_auth_insert" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'penilaian-lampiran'
    AND auth.role() = 'authenticated'
);
