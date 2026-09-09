export const APP_NAME = 'E-Kinerja';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TUGAS: '/tugas',
  TUGAS_DETAIL: '/tugas/:id',
  TUGAS_EDIT: '/tugas/:id/edit',
  TUGAS_NEW: '/tugas/baru',
  LAPORAN: '/laporan',
  CUTI: '/cuti',
  CUTI_DETAIL: '/cuti/:id',
  CUTI_AJUAN: '/cuti/ajuan',
  CUTI_APPROVAL: '/cuti/approval',
  PENILAIAN: '/penilaian',
  PENILAIAN_NEW: '/penilaian/baru',
  PENILAIAN_EDIT: '/penilaian/:id',
  PROFILE: '/profile',

  // Petugas routes
  PETUGAS: '/petugas',
  PETUGAS_NEW: '/petugas/baru',
  PETUGAS_EDIT: '/petugas/:id',
  PETUGAS_DETAIL: '/petugas/:id/detail',

  // Akun routes
  AKUN: '/akun',
} as const;

export const ROLE_CODES = {
  PETUGAS: 'petugas',
  OPERATOR: 'operator',
  KEPALA_SESI: 'kepala_sesi',
} as const;

export const STATUS_TUGAS = {
  MENUNGGU: 'Menunggu',
  PROSES: 'Proses',
  SELESAI: 'Selesai',
} as const;

export const TAHAPAN_TUGAS = {
  BEFORE: 'Before',
  ONGOING: 'Ongoing',
  FINISHED: 'Finished',
} as const;

export const JENIS_CUTI = {
  TAHUNAN: 'Tahunan',
  SAKIT: 'Sakit',
  ALASAN_PENTING: 'Alasan Penting',
} as const;

export const STATUS_APPROVAL = {
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITANGGUGKHAN: 'Ditangguhkan',
  TIDAK_DISETUJUI: 'Tidak Disetujui',
} as const;

export const KUOTA_CUTI_TAHUNAN = 12;

export const MAX_FOTO_PER_LOG = 3;
export const MIN_FOTO_PER_LOG = 1;
export const MAX_FOTO_SIZE_MB = 1;

export const TAHAPAN_ORDER = ['Before', 'Ongoing', 'Finished'] as const;

export const BULAN_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
] as const;
