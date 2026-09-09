-- Auth Helper Functions for E-Kinerja
-- Migration: 00008_auth_helpers.sql
-- Created: 2026-09-07
-- Note: Functions untuk custom authentication dengan NIK + Password

-- ============================================
-- FUNCTION: Authenticate user by NIK and password
-- Returns: user_id if successful, null if failed
-- ============================================
CREATE OR REPLACE FUNCTION authenticate_user(p_nik VARCHAR, p_password VARCHAR)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_password_hash VARCHAR;
BEGIN
  -- Get user by NIK
  SELECT id, password_hash INTO v_user_id, v_password_hash
  FROM master_petugas
  WHERE nik = p_nik AND status_aktif = true;

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check password
  -- Note: For production, use bcrypt. For development, we use simple comparison
  -- Replace with: IF crypt(p_password, v_password_hash) = v_password_hash THEN
  IF v_password_hash = p_password THEN
    RETURN v_user_id;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Update password for user
-- ============================================
CREATE OR REPLACE FUNCTION update_user_password(p_nik VARCHAR, p_new_password VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := FALSE;
BEGIN
  UPDATE master_petugas
  SET password_hash = p_new_password
  WHERE nik = p_nik;

  IF FOUND THEN
    v_updated := TRUE;
  END IF;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEW: Get all active petugas with roles
-- ============================================
CREATE OR REPLACE VIEW v_active_petugas AS
SELECT
  mp.id,
  mp.id_phl,
  mp.nama_phl,
  mp.nik,
  mp.email,
  mp.role_id,
  r.nama_role,
  mp.status_aktif
FROM master_petugas mp
JOIN roles r ON mp.role_id = r.id
WHERE mp.status_aktif = true;
