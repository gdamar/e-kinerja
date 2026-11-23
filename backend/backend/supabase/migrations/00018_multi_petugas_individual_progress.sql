-- Migration: Multi-Petugas Individual Progress & RLS Fix
-- Migration: 00018_multi_petugas_individual_progress.sql
-- Description:
-- 1. Ensure all assigned petugas are recorded in tugas_petugas.
-- 2. Add id_petugas to tugas_log to track who submitted the log.
-- 3. Add status_tugas to tugas_petugas for individual progress tracking.
-- 4. Update trigger to update individual progress on tugas_petugas and aggregate progress on tugas_header.
-- 5. Fix RLS policies on tugas_log, tugas_petugas, and tugas_header for multi-petugas access.

-- ========================================================
-- 1. SCHEMA CHANGES: tugas_petugas & tugas_log
-- ========================================================

-- Ensure status_tugas column exists on tugas_petugas
ALTER TABLE tugas_petugas
ADD COLUMN IF NOT EXISTS status_tugas status_tugas NOT NULL DEFAULT 'Menunggu';

-- Ensure id_petugas column exists on tugas_log
ALTER TABLE tugas_log
ADD COLUMN IF NOT EXISTS id_petugas UUID REFERENCES master_petugas(id) ON DELETE CASCADE;

-- Backfill existing tugas_log records with id_petugas from tugas_header
UPDATE tugas_log tl
SET id_petugas = th.id_petugas
FROM tugas_header th
WHERE tl.id_tugas = th.id AND tl.id_petugas IS NULL;

-- Backfill: Ensure primary petugas in tugas_header is also in tugas_petugas
INSERT INTO tugas_petugas (id_tugas, id_petugas, status_tugas)
SELECT th.id, th.id_petugas, th.status_tugas
FROM tugas_header th
ON CONFLICT (id_tugas, id_petugas) DO UPDATE
SET status_tugas = EXCLUDED.status_tugas;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tugas_log_petugas ON tugas_log(id_petugas);
CREATE INDEX IF NOT EXISTS idx_tugas_petugas_status ON tugas_petugas(status_tugas);

-- ========================================================
-- 2. TRIGGER & FUNCTION: INDIVIDUAL & AGGREGATE STATUS
-- ========================================================

-- Drop old trigger
DROP TRIGGER IF EXISTS trg_update_status_tugas ON tugas_log;

-- Function: update individual petugas status and aggregate header status
CREATE OR REPLACE FUNCTION update_status_tugas_on_log()
RETURNS TRIGGER AS $$
DECLARE
    v_petugas_id UUID;
    v_total_petugas INT;
    v_selesai_count INT;
    v_proses_count INT;
BEGIN
    -- Determine effective petugas id (from NEW.id_petugas or header fallback)
    v_petugas_id := NEW.id_petugas;
    IF v_petugas_id IS NULL THEN
        SELECT id_petugas INTO v_petugas_id FROM tugas_header WHERE id = NEW.id_tugas;
    END IF;

    -- 1. Ensure record exists in tugas_petugas
    IF v_petugas_id IS NOT NULL THEN
        INSERT INTO tugas_petugas (id_tugas, id_petugas, status_tugas)
        VALUES (
            NEW.id_tugas,
            v_petugas_id,
            CASE WHEN NEW.tahapan = 'Finished' THEN 'Selesai'::status_tugas ELSE 'Proses'::status_tugas END
        )
        ON CONFLICT (id_tugas, id_petugas) DO UPDATE
        SET status_tugas = CASE
            WHEN NEW.tahapan = 'Finished' THEN 'Selesai'::status_tugas
            ELSE 'Proses'::status_tugas
        END;
    END IF;

    -- 2. Calculate aggregate status for tugas_header
    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status_tugas = 'Selesai'),
           COUNT(*) FILTER (WHERE status_tugas = 'Proses')
    INTO v_total_petugas, v_selesai_count, v_proses_count
    FROM tugas_petugas
    WHERE id_tugas = NEW.id_tugas;

    IF v_total_petugas > 0 AND v_selesai_count = v_total_petugas THEN
        UPDATE tugas_header
        SET status_tugas = 'Selesai', updated_at = NOW()
        WHERE id = NEW.id_tugas;
    ELSIF v_proses_count > 0 OR v_selesai_count > 0 THEN
        UPDATE tugas_header
        SET status_tugas = 'Proses', updated_at = NOW()
        WHERE id = NEW.id_tugas;
    ELSE
        UPDATE tugas_header
        SET status_tugas = 'Menunggu', updated_at = NOW()
        WHERE id = NEW.id_tugas;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on tugas_log
CREATE TRIGGER trg_update_status_tugas
    AFTER INSERT ON tugas_log
    FOR EACH ROW EXECUTE FUNCTION update_status_tugas_on_log();

-- ========================================================
-- 3. HELPER FUNCTIONS (SECURITY DEFINER to prevent RLS recursion)
-- ========================================================

-- Helper: Get current master_petugas id from auth session
CREATE OR REPLACE FUNCTION get_current_petugas_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT id FROM master_petugas
    WHERE email = auth.jwt() ->> 'email' OR supabase_auth_id = auth.uid()
    LIMIT 1;
$$;

-- Helper: Check if current user is staff (Operator or Kepala Sesi)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM master_petugas
        WHERE (email = auth.jwt() ->> 'email' OR supabase_auth_id = auth.uid())
        AND role_id IN (2, 3)
    );
$$;

-- Helper: Check if current user is assigned to a specific task
CREATE OR REPLACE FUNCTION is_user_assigned_to_tugas(p_tugas_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM master_petugas mp
        WHERE (mp.email = auth.jwt() ->> 'email' OR mp.supabase_auth_id = auth.uid())
        AND (
            mp.role_id IN (2, 3)
            OR EXISTS (
                SELECT 1 FROM tugas_header th
                WHERE th.id = p_tugas_id AND th.id_petugas = mp.id
            )
            OR EXISTS (
                SELECT 1 FROM tugas_petugas tp
                WHERE tp.id_tugas = p_tugas_id AND tp.id_petugas = mp.id
            )
        )
    );
$$;

-- ========================================================
-- 4. RLS POLICIES (Clean, Recursion-Free)
-- ========================================================

-- --- Table: tugas_petugas ---
DROP POLICY IF EXISTS "tugas_petugas_petugas_read" ON tugas_petugas;
DROP POLICY IF EXISTS "tugas_petugas_staff_read" ON tugas_petugas;
DROP POLICY IF EXISTS "tugas_petugas_read" ON tugas_petugas;
DROP POLICY IF EXISTS "tugas_petugas_petugas_update" ON tugas_petugas;
DROP POLICY IF EXISTS "tugas_petugas_staff_update" ON tugas_petugas;
DROP POLICY IF EXISTS "tugas_petugas_update" ON tugas_petugas;

-- Users can read assignments if they are staff, assigned to the task, or the row belongs to them
CREATE POLICY "tugas_petugas_read" ON tugas_petugas
    FOR SELECT USING (
        is_staff()
        OR id_petugas = get_current_petugas_id()
        OR is_user_assigned_to_tugas(id_tugas)
    );

-- Petugas can update their own assignment; Staff can update any
CREATE POLICY "tugas_petugas_update" ON tugas_petugas
    FOR UPDATE USING (
        is_staff()
        OR id_petugas = get_current_petugas_id()
    )
    WITH CHECK (
        is_staff()
        OR id_petugas = get_current_petugas_id()
    );

-- --- Table: tugas_log ---
DROP POLICY IF EXISTS "tugas_log_petugas_insert" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_petugas_read" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_staff_read" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_read" ON tugas_log;
DROP POLICY IF EXISTS "tugas_log_insert" ON tugas_log;

-- Petugas can insert log for tasks they are assigned to
CREATE POLICY "tugas_log_insert" ON tugas_log
    FOR INSERT WITH CHECK (
        is_staff()
        OR (
            (id_petugas IS NULL OR id_petugas = get_current_petugas_id())
            AND is_user_assigned_to_tugas(id_tugas)
        )
    );

-- Petugas & Staff can read logs of assigned tasks
CREATE POLICY "tugas_log_read" ON tugas_log
    FOR SELECT USING (
        is_staff()
        OR is_user_assigned_to_tugas(id_tugas)
    );

-- --- Table: tugas_header ---
DROP POLICY IF EXISTS "tugas_header_petugas_read" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_petugas_update" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_read" ON tugas_header;
DROP POLICY IF EXISTS "tugas_header_update" ON tugas_header;

CREATE POLICY "tugas_header_read" ON tugas_header
    FOR SELECT USING (
        is_staff()
        OR id_petugas = get_current_petugas_id()
        OR is_user_assigned_to_tugas(id)
    );

CREATE POLICY "tugas_header_update" ON tugas_header
    FOR UPDATE USING (
        is_staff()
        OR id_petugas = get_current_petugas_id()
        OR is_user_assigned_to_tugas(id)
    );
