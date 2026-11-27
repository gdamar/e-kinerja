# Todo

## Frontend

- Create Tugas
  - [x] Punya fitur untuk ngepick lokasi dari maps langsung atau cari dari field alamat

- List tugas
  - [x] Overflow scrolling
  - [x] Card list tugas overlap sama bottom navbar
  - [x] Hasil search belum muncul/ke filter
  - [x] Tugas yang ada di daftar tugas untuk role petugas harusnya gabisa buat create tugas log

- Form Laporan tugas
  - [x] Maximum width untuk semua field belum diset
  - [x] Create gagal, RLS tabel tugas_log untuk role petugas belom ada
  - [x] Tambahin pin lokasi yang diassign sama kepala seksi dan pin lokasi yang difetch dari lokasi petugas

- Laporan
  - [ ] Hapus metrik status tugas
  - [x] Card laporan dapat diklik untuk melihat detail pengerjaan tugas

- Akun
  - [x] Ubah komponen dropdown petugasnya jadi komponen combobox(popover + command)
  - [ ] Data akun gabisa difetch(edge function belom kedeploy)

- Penilaian
  - [ ] Aksi data penilaian diganti jadi hold di halaman mobile

- Service Workers
  - [ ] Offline cache untuk:
    - [ ] Data tugas hari ini
    - [ ] Log laporan dari tugas hari ini
  - [ ] Push Notification untuk:
    - [ ] Tugas Baru(Petugas)
    - [ ] Pengajuan Cuti(Operator)
    - [ ] Penilaian Baru(Petugas)
    - [ ] Pengajuan Banding Baru(Operator)
    - [ ] Pengajuan Banding Disetujui/Ditolak(Petugas)
