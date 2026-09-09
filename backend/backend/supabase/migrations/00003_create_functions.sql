-- PostgreSQL Functions untuk Sistem E-Kinerja
-- Migration: 00003_create_functions.sql
-- Dependencies: 00002_create_tables.sql (tables must exist first)
-- Created: 2026-09-07

-- ============================================
-- FUNCTION: hitung_sisa_kuota_cuti
-- Description: Calculate remaining leave quota for a petugas
-- Parameters: p_id_petugas UUID, p_tahun INT
-- Returns: INT (remaining days)
-- ============================================
CREATE OR REPLACE FUNCTION hitung_sisa_kuota_cuti(p_id_petugas UUID, p_tahun INT)
RETURNS INT AS $$
DECLARE
    total_hari INT;
    quota INT := 12;
BEGIN
    SELECT COALESCE(SUM(tgl_selesai - tgl_mulai + 1), 0)
    INTO total_hari
    FROM cuti
    WHERE id_petugas = p_id_petugas
      AND EXTRACT(YEAR FROM tgl_mulai) = p_tahun
      AND status_approval = 'Disetujui';

    RETURN quota - total_hari;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: validate_kuota_cuti
-- Description: Validate cuti quota before insert (used by trigger)
-- Parameters: None (uses NEW context)
-- Returns: TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION validate_kuota_cuti()
RETURNS TRIGGER AS $$
DECLARE
    sisa_kuota INT;
    hari_diminta INT;
BEGIN
    -- Hanya cek jika jenis cuti adalah Tahunan
    IF NEW.jenis_cuti = 'Tahunan' THEN
        hari_diminta := NEW.tgl_selesai - NEW.tgl_mulai + 1;
        sisa_kuota := hitung_sisa_kuota_cuti(NEW.id_petugas, EXTRACT(YEAR FROM NEW.tgl_mulai)::INT);

        IF hari_diminta > sisa_kuota THEN
            RAISE EXCEPTION 'Kuota cuti tidak mencukupi. Sisa kuota: %, Diminta: %', sisa_kuota, hari_diminta;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: update_status_tugas_on_log
-- Description: Auto-update status_tugas when tugas_log is inserted
-- Parameters: None (uses NEW context)
-- Returns: TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_status_tugas_on_log()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tahapan = 'Finished' THEN
        UPDATE tugas_header
        SET status_tugas = 'Selesai', updated_at = NOW()
        WHERE id = NEW.id_tugas;
    ELSIF NEW.tahapan = 'Before' THEN
        UPDATE tugas_header
        SET status_tugas = 'Proses', updated_at = NOW()
        WHERE id = NEW.id_tugas AND status_tugas = 'Menunggu';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
