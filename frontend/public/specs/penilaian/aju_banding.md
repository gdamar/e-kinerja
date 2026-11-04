# Spesifikasi halaman Pengajuan Banding untuk Nilai Petugas

## Deskripsi

Halaman ini merupakan fitur turunan dari penilaian yang hanya dapat diakses oleh Kepala Seksi dan Petugas. Halaman ini akan berupa form dengan tambahan label yang berisi informasi nilai saat ini di atasnya.

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
- Operator dapat menyetujui atau menolak pengajuan disertai dengan alasan
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
    - Alasan pengajuan
      - Deskripsi: Berfungsi sebagai input alasan pengajuan
      - Tipe Data: text
    - Estimasi penilaian yang diharapkan:
      - Skor Displin Kehadiran
        - Deskripsi: Sebagai input skor disiplin Kehadiran
        - Tipe Data: integer/number
      - Skor Tanggung Jawab
        - Deskripsi: Sebagai input skor tanggung jawab
        - Tipe Data: integer/number
      - Skor Kepatuhan
        - Deskripsi: Sebagai input skor kepatuhan
        - Tipe Data: integer/number
  - Fungsi Komponen: Form yang digunakan petugas untuk mengisi informasi tentang pengajuan
- Lampiran
  - Deskripsi: Komponen dropzone yang akan menampung lampiran file dengan format gambar(jpg dan png) maupun dokumen(pdf) sebagai bukti pendukung pengajuan
  - Fungsi: Menampung file lampiran yang akan disimpan di storage
  - Tipe Data: file

### Operator

#### Halaman Utama

- List riwayat pengajuan banding
  - Deskripsi: Berupa tabel yang berisi daftar data pengajuan yang belum ditinjau dengan kolom sebagai berikut:
    - Nama Petugas: string
    - Skor Displin Kehadiran: integer/number
    - Skor Tanggung Jawab: integer/number
    - Skor Kepatuhan: integer/number
    - Alasan Pengajuan: text(elipsis apabila jumlah karakter pada text melebihi lebar kolom)
    - Lampiran: button yang akan memunculkan modal preview dokumen lampiran
    - Waktu Pengajuan dibuat(Datetime)
  - Fungsi: Untuk menampilkan daftar pengajuan yang belum ditinjau

#### Modal Form Disetujui

- Input komponen nilai yang diajukan
  - Deskripsi: Berupa input field dengan properties disabled yang menampilkan ekspektasi nilai dari tiga komponen penilaian yang diajukan petugas. Berikut daftar komponen penilaian yang dimaksud:
    - Skor Displin Kehadiran
    - Skor Tanggung Jawab
    - Skor Kepatuhan
- Input alasan pengajuan
  - Deskripsi: Berupa input field dengan properties disabled yang menampilkan alasan pengajuan yang diajukan petugas
  - Tipe data: text
- Input lampiran
  - Deskripsi: Berupa clickable thumbnail yang jika diklik akan memunculkan modal preview untuk meninjau dokumen dengan lebih detail.
- Input perubahan komponen nilai
  - Deskripsi: Berupa input field bagi Operator untuk memasukkan perubahan nilai dari tiga komponen nilai yang telah dijabarkan sebelumnya.
- Tombol submit
  - Deskripsi: Berupa tombol submit untuk menyimpan perubahan nilai dan status pengajuan

#### Modal Form Ditolak

- Input komponen nilai yang diajukan
  - Deskripsi: Berupa input field dengan properties disabled yang menampilkan ekspektasi nilai dari tiga komponen penilaian yang diajukan petugas. Berikut daftar komponen penilaian yang dimaksud:
    - Skor Displin Kehadiran
    - Skor Tanggung Jawab
    - Skor Kepatuhan
- Input alasan pengajuan
  - Deskripsi: Berupa input field dengan properties disabled yang menampilkan alasan pengajuan yang diajukan petugas
  - Tipe data: text
- Tombol submit
  - Deskripsi: Berupa tombol submit untuk menyimpan perubahan nilai dan status pengajuan
