-- Fix RLS by linking Supabase Auth users to master_petugas
-- Migration: 00012_fix_auth_user_link.sql
-- Created: 2026-09-08
-- Problem: auth.uid() doesn't match master_petugas.id

-- Step 1: Add supabase_auth_id column to master_petugas (without FK constraint for flexibility)
ALTER TABLE master_petugas
ADD COLUMN IF NOT EXISTS supabase_auth_id UUID;

-- Step 2: Update existing users with their Supabase Auth IDs
UPDATE master_petugas SET supabase_auth_id = '663d47f1-949a-4cd6-908c-d7fffe1ff10a' WHERE email = 'hadi@test.local';
UPDATE master_petugas SET supabase_auth_id = 'c8bc03a3-d0a5-42e4-ad09-172a4f1fe9d2' WHERE email = 'budi@test.local';
UPDATE master_petugas SET supabase_auth_id = '8c00495c-5931-407f-8808-2f4865b4d06a' WHERE email = 'ahmad@test.local';
-- Siti account doesn't exist yet, will be created when user signs up

-- Step 3: Drop old RLS policies for tugas_header
DROP POLICY IF EXISTS "tugas_header_petugas_read" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_petugas_update" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_staff_read" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_kepala_create" ON tugas_header;

-- Step 4: Recreate RLS policies using supabase_auth_id
-- Petugas: lihat tugas sendiri
CREATE POLICY "tugas_header_petugas_read" ON tugas_header
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND (
                (mp.role_id = 1 AND id_petugas = mp.id)
                OR mp.role_id IN (2, 3)
            )
        )
    );

-- Petugas: update status tugas sendiri
CREATE POLICY "tugas_header_petugas_update" ON tugas_header
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND (
                (mp.role_id = 1 AND id_petugas = mp.id)
                OR mp.role_id IN (2, 3)
            )
        )
    );

-- Operator & Kepala Sesi: lihat semua tugas
CREATE POLICY "tugas_header_staff_read" ON tugas_header
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id IN (2, 3)
        )
    );

-- Kepala Sesi: buat tugas baru
CREATE POLICY "tugas_header_kepala_create" ON tugas_header
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id = 3
        )
    );

-- Step 5: Update master_petugas RLS policies
DROP POLICY IF EXISTS "master_petugas_select" ON master_petugas;
DROP POLICY IF EXISTS "master_petugas_update_own" ON master_petugas;

CREATE POLICY "master_petugas_select" ON master_petugas
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "master_petugas_update_own" ON master_petugas
    FOR UPDATE USING (supabase_auth_id = auth.uid() OR role_id IN (2, 3));

-- Step 6: Update tugas_log RLS
DROP POLICY IF EXISTS "tugas_log_petugas_insert" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_petugas_read" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_staff_read" ON tugas_log;

CREATE POLICY "tugas_log_petugas_insert" ON tugas_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tugas_header th
            JOIN master_petugas mp ON th.id_petugas = mp.id
            WHERE th.id = id_tugas
            AND mp.supabase_auth_id = auth.uid()
        )
    );

CREATE POLICY "tugas_log_petugas_read" ON tugas_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tugas_header th
            JOIN master_petugas mp ON th.id_petugas = mp.id
            WHERE th.id = id_tugas
            AND mp.supabase_auth_id = auth.uid()
        )
    );

CREATE POLICY "tugas_log_staff_read" ON tugas_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id IN (2, 3)
        )
    );

-- Step 7: Update cuti RLS
DROP POLICY IF EXISTS "cuti_petugas_insert" ON cuti;
DROP POLICY IF EXISTS "cuti_petugas_read" ON cuti;
DROP POLICY IF EXISTS "cuti_operator_update" ON cuti;
DROP POLICY IF EXISTS "cuti_operator_read" ON cuti;
DROP POLICY IF EXISTS "cuti_kepala_read" ON cuti;

CREATE POLICY "cuti_petugas_insert" ON cuti
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.id = id_petugas
            AND mp.supabase_auth_id = auth.uid()
        )
    );

CREATE POLICY "cuti_petugas_read" ON cuti
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.id = id_petugas
            AND mp.supabase_auth_id = auth.uid()
        )
    );

CREATE POLICY "cuti_operator_update" ON cuti
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id = 2
        )
    );

CREATE POLICY "cuti_operator_read" ON cuti
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id = 2
        )
    );

CREATE POLICY "cuti_kepala_read" ON cuti
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id = 3
        )
    );

-- Step 8: Update penilaian RLS
DROP POLICY IF EXISTS "penilaian_petugas_read" ON penilaian;
DROP POLICY IF EXISTS "penilaian_operator_all" ON penilaian;
DROP POLICY IF EXISTS "penilaian_kepala_read" ON penilaian;

CREATE POLICY "penilaian_petugas_read" ON penilaian
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.id = id_petugas
            AND mp.supabase_auth_id = auth.uid()
        )
    );

CREATE POLICY "penilaian_operator_all" ON penilaian
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id = 2
        )
    );

CREATE POLICY "penilaian_kepala_read" ON penilaian
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.supabase_auth_id = auth.uid()
            AND mp.role_id = 3
        )
    );
