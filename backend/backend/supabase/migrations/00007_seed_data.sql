-- Seed Data untuk Sistem E-Kinerja
-- Migration: 00007_seed_data.sql
-- Dependencies: 00002_create_tables.sql (tables must exist first)
-- Created: 2026-09-07
-- Note: Sample users - Auth will be configured separately in frontend

-- ============================================
-- SEED: roles
-- ============================================
INSERT INTO roles (nama_role) VALUES
    ('petugas'),
    ('operator'),
    ('kepala_sesi');

-- ============================================
-- SEED: sample users (master_petugas)
-- ============================================

-- Petugas 1: Budi Santoso
-- Role: petugas (role_id = 1)
INSERT INTO master_petugas (id_phl, nama_phl, jenis_kelamin, nik, alamat, no_telp, role_id, status_aktif)
VALUES (
    'PHL001',
    'Budi Santoso',
    'L',
    '1234567890123456',
    'Jl. Merdeka No. 1, Jakarta',
    '081234567890',
    1, -- petugas
    true
);

-- Petugas 2: Siti Rahayu
-- Role: petugas (role_id = 1)
INSERT INTO master_petugas (id_phl, nama_phl, jenis_kelamin, nik, alamat, no_telp, role_id, status_aktif)
VALUES (
    'PHL002',
    'Siti Rahayu',
    'P',
    '2345678901234567',
    'Jl. Sudirman No. 2, Jakarta',
    '081234567891',
    1, -- petugas
    true
);

-- Operator: Ahmad Wijaya
-- Role: operator (role_id = 2)
INSERT INTO master_petugas (id_phl, nama_phl, jenis_kelamin, nik, alamat, no_telp, role_id, status_aktif)
VALUES (
    'OPR001',
    'Ahmad Wijaya',
    'L',
    '3456789012345678',
    'Jl. Gatot Subroto No. 3, Jakarta',
    '081234567892',
    2, -- operator
    true
);

-- Kepala Sesi: Dr. Hadi Prasetyo
-- Role: kepala_sesi (role_id = 3)
INSERT INTO master_petugas (id_phl, nama_phl, jenis_kelamin, nik, alamat, no_telp, role_id, status_aktif)
VALUES (
    'KS001',
    'Dr. Hadi Prasetyo',
    'L',
    '4567890123456789',
    'Jl. HR Rasuna Said No. 4, Jakarta',
    '081234567893',
    3, -- kepala_sesi
    true
);

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================
-- SELECT * FROM roles;
-- SELECT id, id_phl, nama_phl, roles.nama_role as role FROM master_petugas JOIN roles ON master_petugas.role_id = roles.id;
