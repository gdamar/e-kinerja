-- Setup Supabase Auth Users
-- Migration: 00010_setup_auth_users.sql
-- Created: 2026-09-07
-- Note: Run this AFTER setting up Supabase Auth in Dashboard

-- This migration creates users in Supabase Auth and links them to master_petugas
-- For manual setup, go to Supabase Dashboard > Authentication > Users and create users with these emails/passwords:

-- Sample Users for Development:
-- | Email | Password | Role |
-- |-------|----------|------|
-- | budi@test.local | test123 | Petugas |
-- | siti@test.local | test123 | Petugas |
-- | ahmad@test.local | test123 | Operator |
-- | hadi@test.local | test123 | Kepala Sesi |

-- IMPORTANT:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" for each user
-- 3. Set email and password as shown above
-- 4. The users will automatically link to master_petugas via the id when they login

-- For now, let's create a helper view to check auth setup status
CREATE OR REPLACE VIEW v_auth_users AS
SELECT
  mp.id,
  mp.email,
  mp.nama_phl,
  r.nama_role,
  CASE WHEN au.raw_user_meta_data IS NOT NULL THEN true ELSE false END as has_auth
FROM master_petugas mp
JOIN roles r ON mp.role_id = r.id
LEFT JOIN auth.users au ON au.id = mp.id;
