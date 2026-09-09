-- Row Level Security Policies untuk Sistem E-Kinerja
-- Migration: 00005_create_rls.sql
-- Dependencies: 00002_create_tables.sql (tables must exist first)
-- Note: Tables must be enabled for RLS individually
-- Created: 2026-09-07

-- ============================================
-- RLS: roles (public read for all authenticated users)
-- ============================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_public_read" ON roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS: master_petugas
-- ============================================
ALTER TABLE master_petugas ENABLE ROW LEVEL SECURITY;

-- Semua user yang login bisa read data master_petugas
CREATE POLICY "master_petugas_select" ON master_petugas
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Petugas hanya bisa update data diri sendiri
CREATE POLICY "master_petugas_update_own" ON master_petugas
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- RLS: tugas_header
-- ============================================
ALTER TABLE tugas_header ENABLE ROW LEVEL SECURITY;

-- Petugas: lihat tugas sendiri
CREATE POLICY "tugas_header_petugas_read" ON tugas_header
    FOR SELECT USING (
        (SELECT role_id FROM master_petugas WHERE id = auth.uid()) = 1 AND id_petugas = auth.uid()
    );

-- Petugas: update status tugas sendiri
CREATE POLICY "tugas_header_petugas_update" ON tugas_header
    FOR UPDATE USING (id_petugas = auth.uid());

-- Operator & Kepala Sesi: lihat semua tugas
CREATE POLICY "tugas_header_staff_read" ON tugas_header
    FOR SELECT USING (
        (SELECT role_id FROM master_petugas WHERE id = auth.uid()) IN (2, 3)
    );

-- Hanya Kepala Sesi yang bisa create tugas baru
CREATE POLICY "tugas_header_kepala_create" ON tugas_header
    FOR INSERT WITH CHECK (
        (SELECT role_id FROM master_petugas WHERE id = auth.uid()) = 3
    );

-- ============================================
-- RLS: tugas_log
-- ============================================
ALTER TABLE tugas_log ENABLE ROW LEVEL SECURITY;

-- Petugas: insert log untuk tugas sendiri
CREATE POLICY "tugas_log_petugas_insert" ON tugas_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tugas_header th
            WHERE th.id = id_tugas AND th.id_petugas = auth.uid()
        )
    );

-- Petugas: read log tugas sendiri
CREATE POLICY "tugas_log_petugas_read" ON tugas_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tugas_header th
            WHERE th.id = id_tugas AND th.id_petugas = auth.uid()
        )
    );

-- Operator & Kepala Sesi: read semua log
CREATE POLICY "tugas_log_staff_read" ON tugas_log
    FOR SELECT USING (
        (SELECT role_id FROM master_petugas WHERE id = auth.uid()) IN (2, 3)
    );

-- ============================================
-- RLS: cuti
-- ============================================
ALTER TABLE cuti ENABLE ROW LEVEL SECURITY;

-- Petugas: buat cuti untuk diri sendiri
CREATE POLICY "cuti_petugas_insert" ON cuti
    FOR INSERT WITH CHECK (id_petugas = auth.uid());

-- Petugas: lihat cuti sendiri
CREATE POLICY "cuti_petugas_read" ON cuti
    FOR SELECT USING (id_petugas = auth.uid());

-- Operator: update (approve/reject) semua cuti
CREATE POLICY "cuti_operator_update" ON cuti
    FOR UPDATE USING ((SELECT role_id FROM master_petugas WHERE id = auth.uid()) = 2);

-- Operator: read semua cuti
CREATE POLICY "cuti_operator_read" ON cuti
    FOR SELECT USING ((SELECT role_id FROM master_petugas WHERE id = auth.uid()) = 2);

-- Kepala Sesi: read semua cuti (rekap)
CREATE POLICY "cuti_kepala_read" ON cuti
    FOR SELECT USING ((SELECT role_id FROM master_petugas WHERE id = auth.uid()) = 3);

-- ============================================
-- RLS: penilaian
-- ============================================
ALTER TABLE penilaian ENABLE ROW LEVEL SECURITY;

-- Petugas: read nilai sendiri
CREATE POLICY "penilaian_petugas_read" ON penilaian
    FOR SELECT USING (id_petugas = auth.uid());

-- Operator: create, update, read semua penilaian
CREATE POLICY "penilaian_operator_all" ON penilaian
    FOR ALL USING ((SELECT role_id FROM master_petugas WHERE id = auth.uid()) = 2);

-- Kepala Sesi: read semua penilaian
CREATE POLICY "penilaian_kepala_read" ON penilaian
    FOR SELECT USING ((SELECT role_id FROM master_petugas WHERE id = auth.uid()) = 3);
