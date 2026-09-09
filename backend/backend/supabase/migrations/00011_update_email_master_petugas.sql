-- Update sample users with email
-- Migration: 00011_update_email_master_petugas.sql
-- Created: 2026-09-07

-- Update email for all sample users to match Supabase Auth
UPDATE master_petugas
SET email = CASE nik
  WHEN '1234567890123456' THEN 'budi@test.local'
  WHEN '2345678901234567' THEN 'siti@test.local'
  WHEN '3456789012345678' THEN 'ahmad@test.local'
  WHEN '4567890123456789' THEN 'hadi@test.local'
  ELSE email
END;

-- Verify update
SELECT id_phl, nama_phl, nik, email FROM master_petugas;
