-- Migration: Fix RLS for tugas_header and ensure junction table exists
-- Allow both operator (role_id = 2) and kepala_sesi (role_id = 3) to create tasks

-- Update INSERT policy to include operator
DROP POLICY IF EXISTS "tugas_header_kepala_create" ON tugas_header;
CREATE POLICY "tugas_header_kepala_create" ON tugas_header
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );

-- Ensure junction table exists
CREATE TABLE IF NOT EXISTS tugas_petugas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tugas UUID NOT NULL REFERENCES tugas_header(id) ON DELETE CASCADE,
    id_petugas UUID NOT NULL REFERENCES master_petugas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_tugas, id_petugas)
);

-- Enable RLS on junction table
ALTER TABLE tugas_petugas ENABLE ROW LEVEL SECURITY;

-- Policy: allow staff to read junction table
DROP POLICY IF EXISTS "tugas_petugas_staff_read" ON tugas_petugas;
CREATE POLICY "tugas_petugas_staff_read" ON tugas_petugas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );

-- Policy: allow insert for staff
DROP POLICY IF EXISTS "tugas_petugas_staff_insert" ON tugas_petugas;
CREATE POLICY "tugas_petugas_staff_insert" ON tugas_petugas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tugas_petugas_tugas ON tugas_petugas(id_tugas);
CREATE INDEX IF NOT EXISTS idx_tugas_petugas_petugas ON tugas_petugas(id_petugas);
