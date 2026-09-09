-- Migration: Add junction table for multi-petugas assignment
-- This allows a single task to be assigned to multiple petugas

-- Create junction table for tugas-petahas relationship
CREATE TABLE IF NOT EXISTS tugas_petugas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tugas UUID NOT NULL REFERENCES tugas_header(id) ON DELETE CASCADE,
    id_petugas UUID NOT NULL REFERENCES master_petugas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_tugas, id_petugas)
);

-- Enable RLS
ALTER TABLE tugas_petugas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read junction records for tugas they're assigned to
CREATE POLICY "tugas_petugas_petugas_read" ON tugas_petugas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND (
                -- User is the petugas in this junction record
                mp.id = id_petugas
                OR
                -- User is primary petugas for this tugas (via tugas_header)
                EXISTS (
                    SELECT 1 FROM tugas_header th
                    WHERE th.id = id_tugas AND th.id_petugas = mp.id
                )
            )
        )
    );

-- Policy: Staff can read all assignments
CREATE POLICY "tugas_petugas_staff_read" ON tugas_petugas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id IN (2, 3)
        )
    );

-- Policy: Kepala Sesi can create assignments
CREATE POLICY "tugas_petugas_kepala_insert" ON tugas_petugas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 3
        )
    );

-- Policy: Allow delete for cleanup
CREATE POLICY "tugas_petugas_kepala_delete" ON tugas_petugas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM master_petugas mp
            WHERE mp.email = auth.jwt() ->> 'email'
            AND mp.role_id = 3
        )
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tugas_petugas_tugas ON tugas_petugas(id_tugas);
CREATE INDEX IF NOT EXISTS idx_tugas_petugas_petugas ON tugas_petugas(id_petugas);

-- Optional: Function to get petugas list for a tugas
CREATE OR REPLACE FUNCTION get_tugas_petugas(p_tugas_id UUID)
RETURNS TABLE (
    id UUID,
    nama_phl VARCHAR(255),
    nik VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT mp.id, mp.nama_phl, mp.nik
    FROM tugas_petugas tp
    JOIN master_petugas mp ON tp.id_petugas = mp.id
    WHERE tp.id_tugas = p_tugas_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
