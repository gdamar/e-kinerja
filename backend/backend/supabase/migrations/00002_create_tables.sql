-- Tables untuk Sistem E-Kinerja
-- Migration: 00002_create_tables.sql
-- Dependencies: 00001_create_enums.sql (enums must exist first)
-- Created: 2026-09-07

-- ============================================
-- TABLE: roles
-- ============================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nama_role VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: master_petugas
-- ============================================
CREATE TABLE master_petugas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_phl VARCHAR(50) NOT NULL UNIQUE,
    nama_phl VARCHAR(255) NOT NULL,
    jenis_kelamin jenis_kelamin NOT NULL,
    nik VARCHAR(16) NOT NULL,
    alamat TEXT,
    no_telp VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role_id INT NOT NULL REFERENCES roles(id),
    status_aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for master_petugas
CREATE INDEX idx_master_petugas_role ON master_petugas(role_id);
CREATE INDEX idx_master_petugas_status ON master_petugas(status_aktif);
CREATE INDEX idx_master_petugas_nik ON master_petugas(nik);

-- ============================================
-- TABLE: tugas_header
-- ============================================
CREATE TABLE tugas_header (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_petugas UUID NOT NULL REFERENCES master_petugas(id),
    judul_tugas VARCHAR(255) NOT NULL,
    alamat VARCHAR(500),
    tanggal_tugas DATE NOT NULL DEFAULT CURRENT_DATE,
    status_tugas status_tugas DEFAULT 'Menunggu',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tugas_header
CREATE INDEX idx_tugas_header_petugas ON tugas_header(id_petugas);
CREATE INDEX idx_tugas_header_tanggal ON tugas_header(tanggal_tugas);
CREATE INDEX idx_tugas_header_status ON tugas_header(status_tugas);

-- ============================================
-- TABLE: tugas_log
-- ============================================
CREATE TABLE tugas_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tugas UUID NOT NULL REFERENCES tugas_header(id) ON DELETE CASCADE,
    tahapan tahapan_tugas NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    deskripsi TEXT,
    url_foto JSONB NOT NULL CHECK (jsonb_array_length(url_foto) >= 1 AND jsonb_array_length(url_foto) <= 3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tugas_log
CREATE INDEX idx_tugas_log_tugas ON tugas_log(id_tugas);
CREATE INDEX idx_tugas_log_tahapan ON tugas_log(tahapan);

-- ============================================
-- TABLE: cuti
-- ============================================
CREATE TABLE cuti (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_petugas UUID NOT NULL REFERENCES master_petugas(id),
    jenis_cuti jenis_cuti NOT NULL,
    tgl_mulai DATE NOT NULL,
    tgl_selesai DATE NOT NULL,
    alasan TEXT,
    lampiran_url VARCHAR(500),
    status_approval status_approval DEFAULT 'Menunggu',
    approved_by UUID REFERENCES master_petugas(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_tanggal_cuti CHECK (tgl_selesai >= tgl_mulai)
);

-- Indexes for cuti
CREATE INDEX idx_cuti_petugas ON cuti(id_petugas);
CREATE INDEX idx_cuti_status ON cuti(status_approval);
CREATE INDEX idx_cuti_tanggal ON cuti(tgl_mulai, tgl_selesai);

-- ============================================
-- TABLE: penilaian
-- ============================================
CREATE TABLE penilaian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_petugas UUID NOT NULL REFERENCES master_petugas(id),
    id_operator UUID NOT NULL REFERENCES master_petugas(id),
    periode_bulan INT NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
    periode_tahun INT NOT NULL,
    skor_displin_kehadiran DECIMAL(5, 2) NOT NULL CHECK (skor_displin_kehadiran BETWEEN 0 AND 100),
    skor_tanggung_jawab DECIMAL(5, 2) NOT NULL CHECK (skor_tanggung_jawab BETWEEN 0 AND 100),
    skor_kepatuhan DECIMAL(5, 2) NOT NULL CHECK (skor_kepatuhan BETWEEN 0 AND 100),
    total_nilai DECIMAL(5, 2) GENERATED ALWAYS AS (
        (skor_displin_kehadiran + skor_tanggung_jawab + skor_kepatuhan) / 3.0
    ) STORED,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_petugas, id_operator, periode_bulan, periode_tahun)
);

-- Indexes for penilaian
CREATE INDEX idx_penilaian_petugas ON penilaian(id_petugas);
CREATE INDEX idx_penilaian_periode ON penilaian(periode_tahun, periode_bulan);
