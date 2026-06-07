# TODO.md
# SDENTIBAYA AdminKit — Daftar Tahapan Pengembangan

> Panduan urutan kerja. Kerjakan satu tahap selesai dulu sebelum lanjut ke tahap berikutnya.
> Update status: [ ] = belum, [x] = selesai, [~] = sedang dikerjakan, [-] = ditunda

---

## 🟦 FASE 0 — Fondasi Dokumentasi

- [x] **TAHAP-00** — Buat file dokumentasi awal (PROJECT_CONTEXT, APP_SPEC, TASK_LOG, TODO)

---

## 🟨 FASE 1 — Setup Proyek Frontend

- [ ] **TAHAP-01** — Inisialisasi project React + Vite
  - Buat folder `frontend/`
  - Setup `vite.config.js`
  - Setup `package.json` dengan dependency: react, react-dom, react-router-dom, tailwindcss, postcss, autoprefixer
  - Setup `tailwind.config.js` dan `postcss.config.js`
  - Buat struktur folder: `src/pages/`, `src/components/`, `src/utils/`, `src/hooks/`, `src/assets/`
  - Setup `index.html` dengan meta tag, font, dan favicon placeholder

- [ ] **TAHAP-02** — Setup routing dan layout dasar
  - Buat `App.jsx` dengan React Router (react-router-dom)
  - Buat layout `MainLayout.jsx` (sidebar + header + konten)
  - Buat `AuthLayout.jsx` (layout untuk halaman login)
  - Buat placeholder untuk semua halaman (Login, Dashboard, dll.)
  - Setup protected routes (redirect ke login jika tidak ada token)

- [ ] **TAHAP-03** — Desain sistem dasar (warna, font, komponen UI)
  - Definisikan color palette di `tailwind.config.js` (warna brand SDENTIBAYA)
  - Buat komponen dasar: `Button.jsx`, `Card.jsx`, `Input.jsx`, `Badge.jsx`
  - Buat `Sidebar.jsx` dengan navigasi menu lengkap
  - Buat `Header.jsx` (topbar dengan nama instansi + logout)

---

## 🟧 FASE 2 — Halaman Login

- [ ] **TAHAP-04** — Halaman Login
  - Buat `Login.jsx` dengan form PIN
  - Tampilan elegan bernuansa pendidikan (logo, slogan, nama sekolah)
  - Animasi / feedback loading saat proses login
  - Buat `useAuth.js` hook untuk manajemen autentikasi
  - Simpan token di `sessionStorage`
  - Redirect ke dashboard setelah login berhasil

- [ ] **TAHAP-05** — Koneksi Login ke Cloudflare Worker (mock dulu)
  - Buat `src/utils/api.js` — fungsi fetch ke Worker
  - Buat mock response untuk login (sebelum Worker nyata tersedia)
  - Pastikan alur login → token → protected route berjalan

---

## 🟩 FASE 3 — Dashboard

- [ ] **TAHAP-06** — Halaman Dashboard
  - Buat `Dashboard.jsx`
  - Komponen statistik cepat (kartu: jumlah dokumen, arsip, template)
  - Komponen shortcut aksi cepat
  - Komponen aktivitas terbaru (dummy data dulu)
  - Sambutan dengan nama instansi

---

## 🟪 FASE 4 — Buat Dokumen

- [ ] **TAHAP-07** — Halaman Buat Dokumen (UI form)
  - Buat `BuatDokumen.jsx`
  - Dropdown pilih jenis dokumen (8 jenis)
  - Form dinamis yang berubah sesuai jenis dokumen yang dipilih
  - Validasi form sebelum submit
  - Komponen preview data sebelum generate

- [ ] **TAHAP-08** — Koneksi Buat Dokumen ke Worker (mock)
  - Hubungkan form ke `api.js`
  - Mock response: kembalikan dummy link Google Docs + PDF
  - Tampilkan hasil (link dokumen, tombol download)
  - Loading state saat proses generate

---

## 🟫 FASE 5 — Arsip Dokumen

- [ ] **TAHAP-09** — Halaman Arsip Dokumen
  - Buat `ArsipDokumen.jsx`
  - Tabel daftar dokumen (dari mock data)
  - Filter jenis dokumen + bulan/tahun
  - Pencarian nomor surat / perihal
  - Aksi: Lihat, Download PDF, Hapus (dengan konfirmasi)
  - Pagination sederhana

---

## ⬜ FASE 6 — Master Data & Template

- [ ] **TAHAP-10** — Halaman Master Data Sekolah
  - Buat `MasterData.jsx`
  - Form edit profil sekolah (nama, NPSN, alamat, dll.)
  - Form data kepala sekolah
  - Form tahun ajaran aktif
  - Simpan ke Worker/GAS (mock dulu)

- [ ] **TAHAP-11** — Halaman Template Dokumen
  - Buat `TemplateDokumen.jsx`
  - Tabel daftar template
  - Form tambah template (nama, jenis, Google Docs ID, variabel)
  - Tombol buka template di Google Docs (link langsung)
  - Hapus template (dengan konfirmasi)

---

## 🔴 FASE 7 — Pengaturan & Koneksi

- [ ] **TAHAP-12** — Halaman Pengaturan
  - Buat `Pengaturan.jsx`
  - Status koneksi Worker ↔ GAS
  - Tombol "Test Koneksi"
  - Info environment aktif
  - Panduan setup GAS_URL di Cloudflare

---

## 🔵 FASE 8 — Cloudflare Worker

- [ ] **TAHAP-13** — Setup Cloudflare Worker
  - Buat folder `worker/`
  - Setup `wrangler.toml`
  - Buat `worker/src/index.js` — entry point
  - Implementasi routing semua endpoint API
  - Implementasi autentikasi PIN
  - Implementasi proxy ke GAS dengan secret token
  - CORS headers untuk frontend

- [ ] **TAHAP-14** — Testing Worker
  - Test semua endpoint menggunakan `wrangler dev`
  - Pastikan secret tidak bocor ke response
  - Pastikan CORS berfungsi

---

## 🟤 FASE 9 — Google Apps Script

- [ ] **TAHAP-15** — Setup Google Apps Script
  - Buat file `gas/Code.gs` — router utama (`doPost`)
  - Buat `gas/SheetService.gs` — semua operasi Sheets
  - Buat `gas/DocService.gs` — generate Google Docs dari template
  - Buat `gas/DriveService.gs` — simpan dan ekspor PDF
  - Setup `gas/appsscript.json`
  - Implementasi validasi secret token

- [ ] **TAHAP-16** — Implementasi Action GAS
  - Implementasi semua action: ping, buatDokumen, getArsip, dll.
  - Setup Google Sheets dengan struktur yang benar
  - Test generate dokumen dari template
  - Test export PDF

---

## 🟠 FASE 10 — Integrasi End-to-End

- [ ] **TAHAP-17** — Koneksi Frontend ↔ Worker ↔ GAS
  - Ganti semua mock API dengan Worker URL nyata
  - Test login end-to-end
  - Test generate dokumen end-to-end
  - Test arsip end-to-end
  - Test master data end-to-end

- [ ] **TAHAP-18** — Testing & Bug Fix
  - Test di browser berbeda
  - Test di mobile/tablet
  - Fix bug yang ditemukan
  - Pastikan semua teks Bahasa Indonesia

---

## 🟡 FASE 11 — Deploy

- [ ] **TAHAP-19** — Deploy Frontend ke Cloudflare Pages
  - Build production: `npm run build`
  - Setup Cloudflare Pages project
  - Konfigurasi environment variables di Cloudflare Pages (jika ada)
  - Test di URL production

- [ ] **TAHAP-20** — Deploy Worker ke Cloudflare
  - Deploy Worker: `wrangler deploy`
  - Set environment variables: `GAS_URL`, `GAS_SECRET`, `ADMIN_PIN`
  - Test Worker di production URL
  - Update CORS origin di Worker ke domain Pages

- [ ] **TAHAP-21** — Deploy GAS
  - Deploy GAS sebagai Web App (Execute as: Me, Who has access: Anyone)
  - Copy deployment URL ke Worker env `GAS_URL`
  - Test full flow di production

---

## 🔲 BACKLOG (Setelah MVP)

- [ ] Multiple admin users dengan peran berbeda
- [ ] Nomor surat otomatis (auto-increment dengan format baku)
- [ ] Notifikasi email setelah dokumen dibuat
- [ ] Cetak langsung dari browser
- [ ] Riwayat perubahan dokumen (audit log)
- [ ] Import data siswa dari Excel
- [ ] Laporan bulanan/tahunan
- [ ] Dark mode

---

## Statistik Progres

| Fase     | Total Tahap | Selesai |
|----------|-------------|---------|
| Fase 0   | 1           | 1       |
| Fase 1   | 3           | 0       |
| Fase 2   | 2           | 0       |
| Fase 3   | 1           | 0       |
| Fase 4   | 2           | 0       |
| Fase 5   | 1           | 0       |
| Fase 6   | 2           | 0       |
| Fase 7   | 1           | 0       |
| Fase 8   | 2           | 0       |
| Fase 9   | 2           | 0       |
| Fase 10  | 2           | 0       |
| Fase 11  | 3           | 0       |
| **TOTAL**| **22**      | **1**   |
