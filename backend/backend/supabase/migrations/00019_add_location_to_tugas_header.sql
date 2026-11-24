-- Migration: Add latitude and longitude to tugas_header for task geotagging
-- Migration: 00019_add_location_to_tugas_header.sql

ALTER TABLE tugas_header
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

CREATE INDEX IF NOT EXISTS idx_tugas_header_coords ON tugas_header(latitude, longitude);
