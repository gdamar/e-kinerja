-- Simplified RLS Policies using email from JWT
-- Migration: 00012_simplified_rls.sql
-- Created: 2026-09-08
-- Solution: Use email from JWT token to match master_petugas records

-- ============================================
-- RLS: roles
-- ============================================
DROP POLICY IF EXISTS "roles_public_read" ON roles;
CREATE POLICY "roles_public_read" ON roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS: master_petugas
-- ============================================
DROP POLICY IF EXISTS "master_petugas_select" ON master_petugas;
DROP POLICY IF EXISTS "master_petugas_update_own" ON master_petugas;

CREATE POLICY "master_petugas_select" ON master_petugas
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Petugas bisa update data diri sendiri, Operator/Kepala Sesi bisa update semua
CREATE POLICY "master_petugas_update_own" ON master_petugas
    FOR UPDATE USING (
        email = auth.jwt() ->> 'email'
        OR EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );

-- ============================================
-- RLS: tugas_header
-- ============================================
DROP POLICY IF EXISTS "tugas_header_petugas_read" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_petugas_update" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_staff_read" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_kepala_create" ON tugas_header;

-- Petugas: lihat tugas sendiri
CREATE POLICY "tugas_header_petugas_read" ON tugas_header
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND (
                (mp.role_id = 1 AND id_petugas = mp.id)
                OR mp.role_id IN (2, 3)
            )
        )
    );

-- Petugas: update status tugas sendiri (atau Operator/Kepala Sesi update semua)
CREATE POLICY "tugas_header_petugas_update" ON tugas_header
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
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
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );

-- Hanya Kepala Sesi yang bisa buat tugas baru
CREATE POLICY "tugas_header_kepala_create" ON tugas_header
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 3
        )
    );

-- ============================================
-- RLS: tugas_log
-- ============================================
DROP POLICY IF EXISTS "tugas_log_petugas_insert" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_petugas_read" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_staff_read" ON tugas_log;

-- Petugas: insert log untuk tugas sendiri
CREATE POLICY "tugas_log_petugas_insert" ON tugas_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tugas_header th
            JOIN master_petugas mp ON th.id_petugas = mp.id
            WHERE th.id = id_tugas
            AND mp.email = auth.jwt() ->> 'email'
        )
    );

-- Petugas: read log tugas sendiri
CREATE POLICY "tugas_log_petugas_read" ON tugas_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tugas_header th
            JOIN master_petugas mp ON th.id_petugas = mp.id
            WHERE th.id = id_tugas
            AND mp.email = auth.jwt() ->> 'email'
        )
    );

-- Operator & Kepala Sesi: read semua log
CREATE POLICY "tugas_log_staff_read" ON tugas_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );

-- ============================================
-- RLS: cuti
-- ============================================
DROP POLICY IF EXISTS "cuti_petugas_insert" ON cuti;
DROP POLICY IF EXISTS "cuti_petugas_read" ON cuti;
DROP POLICY IF EXISTS "cuti_operator_update" ON cuti;
DROP POLICY IF EXISTS "cuti_operator_read" ON cuti;
DROP POLICY IF EXISTS "cuti_kepala_read" ON cuti;

-- Petugas: buat cuti untuk diri sendiri
CREATE POLICY "cuti_petugas_insert" ON cuti
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.id = id_petugas
            AND mp.email = auth.jwt() ->> 'email'
        )
    );

-- Petugas: lihat cuti sendiri
CREATE POLICY "cuti_petugas_read" ON cuti
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.id = id_petugas
            AND mp.email = auth.jwt() ->> 'email'
        )
    );

-- Operator: update (approve/reject) semua cuti
CREATE POLICY "cuti_operator_update" ON cuti
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 2
        )
    );

-- Operator: read semua cuti
CREATE POLICY "cuti_operator_read" ON cuti
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 2
        )
    );

-- Kepala Sesi: read semua cuti (rekap)
CREATE POLICY "cuti_kepala_read" ON cuti
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 3
        )
    );

-- ============================================
-- RLS: penilaian
-- ============================================
DROP POLICY IF EXISTS "penilaian_petugas_read" ON penilaian;
DROP POLICY IF EXISTS "penilaian_operator_all" ON penilaian;
DROP POLICY IF EXISTS "penilaian_kepala_read" ON penilaian;

-- Petugas: read nilai sendiri
CREATE POLICY "penilaian_petugas_read" ON penilaian
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.id = id_petugas
            AND mp.email = auth.jwt() ->> 'email'
        )
    );

-- Operator: create, update, read semua penilaian
CREATE POLICY "penilaian_operator_all" ON penilaian
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 2
        )
    );

-- Kepala Sesi: read semua penilaian
CREATE POLICY "penilaian_kepala_read" ON penilaian
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 3
        )
    );

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify policies are created:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('master_petugas', 'tugas_header', 'tugas_log', 'cuti', 'penilaian', 'roles');
