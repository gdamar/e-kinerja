// Database types matching Supabase schema

export type JenisKelamin = 'L' | 'P';
export type TahapanTugas = 'Before' | 'Ongoing' | 'Finished';
export type StatusTugas = 'Menunggu' | 'Proses' | 'Selesai';
export type JenisCuti = 'Tahunan' | 'Sakit' | 'Alasan Penting';
export type StatusApproval = 'Menunggu' | 'Disetujui' | 'Ditangguhkan' | 'Tidak Disetujui';
export type RoleCode = 'petugas' | 'operator' | 'kepala_sesi';

export interface Role {
  id: number;
  nama_role: string;
  role_code: RoleCode;
}

export interface MasterPetugas {
  id: string;
  id_phl: string;
  nama_phl: string;
  jenis_kelamin: JenisKelamin;
  nik: string;
  alamat: string;
  no_telp: string;
  email: string;
  role_id: number;
  status_aktif: boolean;
  role?: Role;
}

export interface TugasHeader {
  id: string;
  id_petugas: string;
  judul_tugas: string;
  alamat: string;
  latitude?: number | null;
  longitude?: number | null;
  tanggal_tugas: string;
  status_tugas: StatusTugas;
  created_at: string;
  petugas?: MasterPetugas;
  logs?: TugasLog[];
  individual_status?: StatusTugas;
}

export interface PetugasWithStatus extends MasterPetugas {
  status_tugas?: StatusTugas;
}

export interface TugasLog {
  id: string;
  id_tugas: string;
  id_petugas?: string;
  tahapan: TahapanTugas;
  latitude: number;
  longitude: number;
  deskripsi: string;
  url_foto: string | string[];
  created_at: string;
  petugas?: MasterPetugas;
}

export interface Cuti {
  id: string;
  id_petugas: string;
  jenis_cuti: JenisCuti;
  tgl_mulai: string;
  tgl_selesai: string;
  alasan: string;
  lampiran_url: string | null;
  status_approval: StatusApproval;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  petugas?: MasterPetugas;
}

export interface Penilaian {
  id: string;
  id_petugas: string;
  id_operator: string;
  periode_bulan: number;
  periode_tahun: number;
  skor_displin_kehadiran: number;
  skor_tanggung_jawab: number;
  skor_kepatuhan: number;
  total_nilai: number;
  catatan: string;
  created_at: string;
  petugas?: MasterPetugas;
  operator?: MasterPetugas;
}

export type StatusBanding = 'Menunggu' | 'Disetujui' | 'Ditangguhkan' | 'Ditolak';

export interface PenilaianBanding {
  id: string;
  id_penilaian: string;
  catatan_petugas: string;
  catatan_operator?: string | null;
  lampiran_url?: string | null;
  status: StatusBanding;
  created_at: string;
  reviewed_at?: string | null;
  penilaian?: Penilaian;
}

export interface PenilaianDetail extends Penilaian {
  banding?: PenilaianBanding[];
}

export interface PenilaianBandingFormData {
  catatan_petugas: string;
  lampiran?: File;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Auth types
export interface User {
  id: string;
  email: string;
  profile: MasterPetugas | null;
}

// Form types
export interface TugasFormData {
  id_petugas: string;
  judul_tugas: string;
  alamat: string;
  latitude?: number | null;
  longitude?: number | null;
  tanggal_tugas: string;
}

export interface TugasLogFormData {
  tahapan: TahapanTugas;
  deskripsi: string;
  url_foto: File[];
}

export interface CutiFormData {
  jenis_cuti: JenisCuti;
  tgl_mulai: string;
  tgl_selesai: string;
  alasan: string;
  lampiran?: File;
}

export interface PenilaianFormData {
  id_petugas: string;
  periode_bulan: number;
  periode_tahun: number;
  skor_displin_kehadiran: number;
  skor_tanggung_jawab: number;
  skor_kepatuhan: number;
  catatan: string;
}
