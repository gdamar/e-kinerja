# AGENTS.md

Panduan operasional dan instruksi bagi AI agent yang bekerja pada repositori frontend **e-kinerja**.

---

## 1. Ikhtisar Proyek

- **Nama Proyek**: `ekinerja-frontend` (Sistem Informasi Manajemen Kinerja & Penugasan Petugas Lapangan)
- **Framework & Runtime**: React 18, TypeScript 5, Vite 5, Tailwind CSS
- **Package Manager**: Bun (`bun.lock`) / npm (`package-lock.json`)
- **Backend & Database**: Supabase (`@supabase/supabase-js`)
- **State Management & Data Fetching**: TanStack Query (React Query v5)
- **Routing**: React Router DOM v6
- **Komponen UI & Styling**: Radix UI primitives, Lucide React, Tailwind CSS, `tailwind-merge`, `clsx`, `cva`
- **Peta & Geolocation**: Leaflet & React-Leaflet
- **Testing**: Playwright (`@playwright/test`)
- **PWA**: `vite-plugin-pwa`

---

## 2. Perintah Penting (CLI Scripts)

Gunakan perintah standar berikut saat mengembangkan, memverifikasi, atau menguji kode:

```bash
# Menjalankan development server
bun dev
# atau: npm run dev

# Memeriksa tipe data (Typecheck) - Wajib jalankan setelah mengubah kode TypeScript
bun run typecheck
# atau: npm run typecheck

# Linting kode
bun run lint
# atau: npm run lint

# Build production
bun run build
# atau: npm run build

# Menjalankan pengujian e2e (Playwright)
npx playwright test
```

---

## 3. Struktur Direktori

```
frontend/
├── .agents/                    # Dokumen catatan internal/todo agent (e.g. todo.md)
├── public/                     # Aset statis & manifest PWA
├── src/
│   ├── components/
│   │   ├── features/           # Komponen spesifik modul bisnis
│   │   │   ├── cuti/           # Manajemen dan approval cuti
│   │   │   ├── laporan/        # Pelaporan kinerja & rekap
│   │   │   ├── penilaian/      # Form & matriks penilaian
│   │   │   └── tugas/          # Form, list, logs, & modal tugas lapangan
│   │   ├── layout/             # Layout aplikasi (AppLayout, Navbar, Sidebar, BottomNav)
│   │   ├── shared/             # Komponen global (RoleGate, LoadingSpinner, EmptyState, dsb.)
│   │   └── ui/                 # Komponen atomik / primitives (Dialog, Button, Select, Tabs, dll.)
│   ├── context/                # Context provider (Auth, App state)
│   ├── hooks/                  # Custom hooks & React Query hooks
│   ├── lib/                    # Utilitas, konfigurasi client (Supabase, Leaflet, constants)
│   ├── pages/                  # Halaman aplikasi berbasis router
│   ├── routes/                 # Konfigurasi router & proteksi RoleGate
│   ├── types/                  # Definisi TypeScript interface / types
│   ├── App.tsx
│   └── main.tsx
├── tests/                      # Playwright E2E tests
├── tailwind.config.js          # Konfigurasi Tailwind & tema desain
└── vite.config.ts              # Konfigurasi Vite & PWA
```

---

## 4. Role & Hak Akses (RBAC)

Aplikasi memiliki pembagian hak akses menggunakan `RoleGate` dan konstanta `ROLE_CODES`:
- **`KEPALA_SESI`**:
  - Mengelola dan membuat tugas baru (`/tugas/baru`, `/tugas/:id/edit`).
  - Approval cuti (`/cuti/approval`).
  - Manajemen petugas & akun pengguna (`/petugas`, `/akun`).
- **`OPERATOR`**:
  - Review & approval pengajuan cuti.
  - Manajemen data petugas dan akun.
  - Mengelola penilaian kinerja petugas (`/penilaian`).
  - Meninjau, menyetujui, dan menolak pengajuan banding nilai petugas (`/penilaian/banding`).
- **`PETUGAS`**:
  - Melihat daftar tugas yang ditugaskan kepada dirinya.
  - Melaporkan log/progres tahapan tugas lapangan (*Before*, *Ongoing*, *Finished*) via `TugasLogForm`.
  - Mengajukan permohonan cuti (`/cuti/ajuan`).
  - Mengajukan banding atas evaluasi penilaian kinerja yang diperoleh (`/penilaian/:id/banding`).

---

## 5. Pedoman Pengembangan (Coding Conventions)

### A. TypeScript & Penanganan Tipe
- Dilarang keras menggunakan tipe `any` implisit maupun eksplisit tanpa alasan yang sangat mendesak.
- Selalu sediakan antarmuka (*interface*) atau tipe di `src/types/` atau modul terkait.
- Pastikan `bun run typecheck` lolos tanpa error sebelum menyelesaikan perubahan.

### B. Komponen, Layout & Styling
- Gunakan komponen dasar dari `src/components/ui/` (Radix UI + Tailwind) untuk konsistensi.
- Utamakan desain **Mobile-First & Responsive** (perhatikan layar kecil untuk form input dan modal, misalnya pada form log tugas petugas lapangan).
- **Standar Layout & Viewport**:
  Layout viewport dikunci secara global di `src/components/layout/AppLayout.tsx` (`h-dvh overflow-hidden` pada root, dan `<main>` yang memiliki `overflow-y-auto` dengan padding responsive).
  Oleh karena itu, setiap halaman (`src/pages/*.tsx`) **tidak perlu** mengunci `h-dvh` atau menambahkan padding wrapper berulang, cukup menggunakan container konten seperti `<div className="space-y-6">`.
- Gunakan `cn()` (`clsx` + `tailwind-merge`) untuk menggabungkan class Tailwind secara dinamis.

### C. State, Komunikasi API (Supabase) & Relasi Data
- Integrasi ke Supabase dilakukan melalui client resmi di `src/lib/supabase.ts` (atau `supabase-admin.ts` untuk fungsi admin).
- Gunakan React Query (`@tanstack/react-query`) untuk caching, invalidation, dan optimistic update. Hindari *raw query* ganda di level komponen.
- **Multi-Petugas & Individual Progress**:
  - Penugasan multi-petugas dikelola via tabel relasi `tugas_petugas`.
  - Setiap petugas memiliki progres mandiri (`status_tugas` di `tugas_petugas`).
  - Setiap entri log (`tugas_log`) wajib mencantumkan `id_petugas` dari user yang melaporkan.
  - Query log tugas diurutkan descending (`created_at` DESC) agar laporan terbaru tampil paling atas.
- Pastikan penanganan error (error state) dan loading state selalu ditampilkan secara ramah kepada pengguna.

### D. Form & Validasi
- Gunakan `react-hook-form` bersama `@hookform/resolvers/zod` dan skema validasi `zod` untuk menangani form.

### E. Penanganan Pesan & Notifikasi Pengguna (Feedback & Errors)
- **Dilarang menggunakan `alert()` browser native**: Seluruh feedback keberhasilan, peringatan, maupun pesan error yang ditujukan kepada pengguna wajib menggunakan komponen notifikasi **Toast** (`useToast` / `toast({ title, description, variant })` dari `@/hooks/useToast`).
- Gunakan `variant: 'destructive'` untuk pesan error/kegagalan dan `variant: 'default'` untuk konfirmasi atau keberhasilan.
- Berikan judul (`title`) yang ringkas dan deskripsi (`description`) yang jelas serta solutif bagi pengguna.

### F. Tombol Aksi pada Tabel & Penggunaan Tooltip
- **Icon-Only Buttons pada Tabel**: Untuk tombol aksi di dalam tabel (seperti tombol ajukan banding, setujui, tolak, detail/riwayat, atau edit), gunakan tombol yang **hanya berisi icon** tanpa teks label (`h-8 w-8 p-0` atau `size="icon"`).
- **Wajib Menggunakan Tooltip**: Setiap tombol icon-only pada tabel wajib dibungkus dengan komponen `Tooltip` (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`) dari `@/components/ui/tooltip` untuk mendeskripsikan aksinya ketika di-hover/fokus (misalnya "Ajukan Banding", "Setujui Banding", "Tolak Banding", "Edit Penilaian").
- **Aksesibilitas (A11y)**: Selalu sediakan `aria-label` yang sesuai pada tombol icon-only agar pembaca layar (screen reader) tetap dapat mengidentifikasi aksi tombol tersebut.
- **Perataan Kolom Tabel Penilaian**: Pastikan kolom aksi dan data nilai di tabel penilaian menggunakan perataan tengah (`text-center` / `justify-center`) agar rapi dan simetris.

---

## 6. Protokol Agent (Workflow Rules)

1. **Eksplorasi Sebelum Mengubah**: Baca kode terkait dan cari referensi tipe sebelum melakukan perubahan besar.
2. **Cek Responsivitas**: Karena aplikasi digunakan oleh petugas lapangan melalui perangkat seluler, pastikan elemen interaktif (dialog/modal, form, tombol) ramah sentuhan (*touch-friendly*) dan tidak terpotong (*overflow*) pada layar sempit.
3. **Validasi Mandiri**: Jalankan `bun run typecheck` atau `bun run build` setelah melakukan pengeditan berkas kode TypeScript.
4. **Catatan Masalah**: Pantau [.agents/todo.md](file:///home/ketszu/Documents/tugasakhir/e-kinerja/frontend/.agents/todo.md) untuk melihat daftar pekerjaan/bug aktif dan perbarui dokumen tersebut jika bug telah terselesaikan.
