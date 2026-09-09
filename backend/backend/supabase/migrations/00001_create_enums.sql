-- Enum Types untuk Sistem E-Kinerja
-- Migration: 00001_create_enums.sql
-- Created: 2026-09-07

-- ============================================
-- ENUM TYPES
-- ============================================

-- Jenis Kelamin
CREATE TYPE jenis_kelamin AS ENUM ('L', 'P');

-- Tahapan Tugas (3 tahapan pelaporan)
CREATE TYPE tahapan_tugas AS ENUM ('Before', 'Ongoing', 'Finished');

-- Status Tugas
CREATE TYPE status_tugas AS ENUM ('Menunggu', 'Proses', 'Selesai');

-- Jenis Cuti
CREATE TYPE jenis_cuti AS ENUM ('Tahunan', 'Sakit', 'Alasan Penting');

-- Status Approval Cuti
CREATE TYPE status_approval AS ENUM ('Menunggu', 'Disetujui', 'Ditangguhkan', 'Tidak Disetujui');
