# Spesifikasi halaman Pengajuan Banding untuk Nilai Petugas
Halaman ini merupakan fitur turunan dari penilaian yang hanya dapat diakses oleh Operator dan Petugas. Halaman ini akan berupa form dengan tambahan label yang berisi informasi nilai saat ini di atasnya.

> [!NOTE]
> **Keputusan Desain Terkait Input Ekspektasi Nilai:**
> Field input ekspektasi/estimasi skor dari petugas ditiadakan dari form pengajuan banding dengan pertimbangan:
> 1. **Mencegah ekspektasi keliru (false expectation):** Jika petugas mengajukan angka tertentu (misal 90) namun operator memutuskan angka yang berbeda (misal 75), hal ini dapat memicu kekecewaan baru meskipun nilainya sudah dinaikkan.
> 2. **Objektivitas penilaian:** Petugas belum tentu mengetahui standar nilai yang proporsional/adil secara sistemik, sehingga kewajiban input angka hanya menambah beban (friction) saat pengisian formulir.
> 3. **Otoritas penuh penilai:** Penentuan keputusan dan besaran skor akhir sepenuhnya merupakan wewenang Operator berdasarkan validasi bukti dan catatan yang diajukan. Operator tetap memiliki visibilitas atas nilai awal dan bukti pendukung saat melakukan peninjauan.

## Struktur Interface dan Type  

```typescript
export type StatusBanding = 'Menunggu' | 'Disetujui' | 'Ditangguhkan' | 'Ditolak';

export interface PenilaianBanding {
  id: string;
  id_penilaian: string;
  alasan: string;
  lampiran_url?: string | null;
  status: StatusBanding;
  catatan_operator?: string | null;
  created_at: string;
  reviewed_at?: string | null;
}

// Update interface Penilaian yang sudah ada:
export interface PenilaianDetail extends Penilaian {
  banding?: PenilaianBanding[];
}

```
## Role yang terlibat
- Petugas
- Operator

## Alur Halaman

### Petugas

- Petugas mengakses halaman penilaian
- Petugas memilih hasil penilaian yang ingin diajukan perbandingan
- Halaman ajuan akan menampilkan nilai dari komponen penilaian saat ini
- Petugas mengisi form pengajuan
- Petugas klik tombol submit
- Operator akan menerima push notification dari PWA untuk meninjau pengajuan banding yang diajukan oleh petugas
- Terdapat log pengajuan banding apabila petugas melihat detail penilaian

### Operator

- Operator dapat mengakses halaman pengajuan banding nilai melaui notification tray atau dari menu penilaian(Halaman penilaian akan memiliki tombol baru yang akan mengarahkan petugas ke halaman Pengajuan Banding Penilaian)
- Operator memilih pengajuan yang ingin ditinjau
- Terdapat tombol disetujui(tombol dengan icon check dan background hijau) dan ditolak(tombol dengan icon x dan background merah)di kolom aksi pada tabel
- Jika tombol disetuji diklik maka akan muncul modal yang berisi form dengan komposisi field yang tertera pada Section Komponen UI untuk Operator
- Jika tombol ditolak diklik maka akan muncul modal yang berisi form dengan komposisi field yang tertera pada Section Komponen UI untuk Operator
- Operator dapat menyetujui atau menolak pengajuan disertai dengan catatan
- Jika disetujui maka nilai petugas pada halaman penilaian akan diupdate dan petugas dapat melihat hasil penilaian baru yang telah disetujui
- Jika ditolak nilai pada halaman penilaian tetap sama seperti nilai awal sebelum pengajuan
- Data pengajuan yang telah menerima status persetujuan(telah ditinjau) tidak akan tampil di halaman utama pengajuan banding
- Terlepas dari status persetujuan, Petugas akan mendapat push notification dari PWA apabila Operator telah meninjau pengajuan banding yang diajukan oleh Petugas

## Komponen UI

### Petugas

- Label Komponen Penilaian
  - Deskripsi: Berupa angka penilaian dari tiga macam komponen penilaian
  - Fungsi Komponen: Menampilkan nilai saat ini
  - Tipe Data: integer/number
- Form Pengajuan
  - Deskripsi: Berupa Form input yang memuat informasi pengajuan sebagai berikut:
    - catatan pengajuan
      - Deskripsi: Berfungsi sebagai input catatan pengajuan
      - Tipe Data: text
    - Lampiran
      - Deskripsi: Komponen dropzone yang akan menampung lampiran file dengan format gambar(jpg dan png) maupun dokumen(pdf) sebagai bukti pendukung pengajuan
      - Fungsi: Menampung file lampiran yang akan disimpan di storage
      - Tipe Data: file
  - Fungsi Komponen: Form yang digunakan petugas untuk mengisi informasi tentang pengajuan
### Operator

#### Halaman Utama

- List riwayat pengajuan banding
  - Deskripsi: Berupa tabel yang berisi daftar data pengajuan yang belum ditinjau dengan kolom sebagai berikut:
    - Nama Petugas: string
    - Skor Displin Kehadiran: integer/number
    - Skor Tanggung Jawab: integer/number
    - Skor Kepatuhan: integer/number
    - catatan Pengajuan: text(elipsis apabila jumlah karakter pada text melebihi lebar kolom)
    - Lampiran: button yang akan memunculkan modal preview dokumen lampiran
    - Waktu Pengajuan dibuat(Datetime)
  - Fungsi: Untuk menampilkan daftar pengajuan yang belum ditinjau

#### Modal Form Disetujui

- Input komponen nilai yang diajukan
  - Deskripsi: Berupa input field dengan properties disabled yang menampilkan nilai awal dari tiga komponen penilaian yang diajukan petugas. Berikut daftar komponen penilaian yang dimaksud:
    - Skor Displin Kehadiran
    - Skor Tanggung Jawab
    - Skor Kepatuhan
- Input catatan pengajuan
  - Deskripsi: Berupa input field dengan properties disabled yang menampilkan catatan pengajuan yang diajukan petugas
  - Tipe data: text
- Input lampiran
  - Deskripsi: Berupa clickable thumbnail yang jika diklik akan memunculkan modal preview untuk meninjau dokumen dengan lebih detail.
- Input perubahan komponen nilai
  - Deskripsi: Berupa input field bagi Operator untuk memasukkan perubahan nilai dari tiga komponen nilai yang telah dijabarkan sebelumnya.
- Tombol submit
  - Deskripsi: Berupa tombol submit untuk menyimpan perubahan nilai dan status pengajuan

#### Modal Form Ditolak
- Input komponen nilai yang diajukan
  - Deskripsi: Berupa input field dengan properties disabled yang menampilkan nilai awal dari tiga komponen penilaian yang diajukan petugas. Berikut daftar komponen penilaian yang dimaksud:
    - Skor Displin Kehadiran
    - Skor Tanggung Jawab
    - Skor Kepatuhan
- Input catatan pengajuan
  - Deskripsi: Berupa input field aktif yang memasukkan catatan penolakan yang wajib diisi oleh Operator
  - Tipe data: text
- Tombol submit
  - Deskripsi: Berupa tombol submit untuk menyimpan perubahan nilai dan status pengajuan

## Struktur tabel

### Tabel penilaian_banding

| Nama field | Tipe data |
| :---: | :---: |
| id | uuid |
| id_penilaian | fk_penilaian |
| catatan_petugas | text(not null) |
| catatan_operator | text(nullable) |
| lampiran_url | varchar(berisi url storage, nullable) |
| status | enum('Menunggu', 'Disetujui', 'Ditangguhkan') |
| created_at | datetime |
| reviewed_at | datetime |

