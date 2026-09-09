-- Migration: Fix junction table RLS for kepala_sesi
-- Allow kepala_sesi to insert multiple petugas assignments

-- Update INSERT policy to include kepala_sesi (role_id = 3)
DROP POLICY IF EXISTS "tugas_petugas_kepala_insert" ON tugas_petugas;
CREATE POLICY "tugas_petugas_kepala_insert" ON tugas_petugas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 3
        )
    );

-- Update DELETE policy
DROP POLICY IF EXISTS "tugas_petugas_kepala_delete" ON tugas_petugas;
CREATE POLICY "tugas_petugas_kepala_delete" ON tugas_petugas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 3
        )
    );
