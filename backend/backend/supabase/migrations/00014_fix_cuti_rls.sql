-- Migration: Fix RLS for kepala_sesi to approve cuti
-- Allow kepala_sesi (role_id = 3) to update cuti approval

-- Drop existing policy
DROP POLICY IF EXISTS "cuti_operator_update" ON cuti;

-- Create new policy that includes both operator (role_id = 2) and kepala_sesi (role_id = 3)
CREATE POLICY "cuti_operator_update" ON cuti
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );
