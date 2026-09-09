-- Update sample users with password
-- Migration: 00009_seed_password.sql
-- Created: 2026-09-07
-- Password for all users: test123

-- Update password for all sample users
UPDATE master_petugas
SET password_hash = 'test123'
WHERE nik IN (
  '1234567890123456', -- Budi Santoso
  '2345678901234567', -- Siti Rahayu
  '3456789012345678', -- Ahmad Wijaya
  '4567890123456789'  -- Dr. Hadi Prasetyo
);

-- Verify update
SELECT id_phl, nama_phl, nik, password_hash IS NOT NULL as has_password
FROM master_petugas
WHERE nik LIKE '______________';
