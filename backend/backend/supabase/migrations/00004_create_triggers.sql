-- Database Triggers untuk Sistem E-Kinerja
-- Migration: 00004_create_triggers.sql
-- Dependencies: 00003_create_functions.sql (functions must exist first)
-- Created: 2026-09-07

-- ============================================
-- TRIGGER: trg_update_status_tugas
-- Table: tugas_log
-- Event: AFTER INSERT
-- Description: Auto-update status_tugas to 'Proses' or 'Selesai'
--             based on the tahapan inserted
-- ============================================
CREATE TRIGGER trg_update_status_tugas
    AFTER INSERT ON tugas_log
    FOR EACH ROW EXECUTE FUNCTION update_status_tugas_on_log();

-- ============================================
-- TRIGGER: trg_validate_kuota_cuti
-- Table: cuti
-- Event: BEFORE INSERT
-- Description: Validate that the petugas has enough
--             leave quota before inserting cuti request
-- ============================================
CREATE TRIGGER trg_validate_kuota_cuti
    BEFORE INSERT ON cuti
    FOR EACH ROW EXECUTE FUNCTION validate_kuota_cuti();
