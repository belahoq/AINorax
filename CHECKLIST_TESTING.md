# CHECKLIST_TESTING.md
# SDENTIBAYA AdminKit — Panduan Testing MVP

> Gunakan checklist ini setiap kali melakukan testing sebelum deploy ke production.
> Tandai ✅ jika lulus, ❌ jika gagal (catat pesannya), ⏭ jika di-skip.

---

## Cara Menjalankan untuk Testing

```bash
# Mode Demo (tanpa backend) — cukup untuk test UI
cd frontend && npm install && npm run dev
# PIN: 123456

# Mode Full (dengan backend)
# Terminal 1:
cd worker && wrangler dev
# Terminal 2:
cd frontend
echo "VITE_API_URL=http://localhost:8787" > .env.local
npm run dev
```

---

## A. SETUP & ENVIRONMENT

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| A1 | `npm install` berjalan tanpa error | [ ] | [ ] | |
| A2 | `npm run dev` berjalan di port 5173 | [ ] | [ ] | |
| A3 | Tidak ada error merah di console browser | [ ] | [ ] | |
| A4 | File `.env.local` terbaca (cek badge di Login) | ⏭ | [ ] | Badge "Mode Demo" tidak tampil jika VITE_API_URL diset |
| A5 | `wrangler dev` berjalan di port 8787 | ⏭ | [ ] | |
| A6 | `GET http://localhost:8787/api/health` mengembalikan `success: true` | ⏭ | [ ] | |

---

## B. AUTENTIKASI (LOGIN / LOGOUT)

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| B1 | Halaman `/login` tampil dengan benar | [ ] | [ ] | |
| B2 | Badge "Mode Demo" tampil jika backend tidak dikonfigurasi | [ ] | ⏭ | |
| B3 | Login dengan PIN `123456` berhasil (mode demo) | [ ] | ⏭ | |
| B4 | Login dengan PIN yang benar berhasil (mode full) | ⏭ | [ ] | |
| B5 | Login dengan PIN salah menampilkan pesan error merah | [ ] | [ ] | |
| B6 | Token tersimpan di `localStorage` setelah login | [ ] | [ ] | Cek DevTools → Application → localStorage |
| B7 | Setelah refresh halaman, tetap login (tidak redirect ke `/login`) | [ ] | [ ] | |
| B8 | Tombol "Keluar" di sidebar berhasil logout | [ ] | [ ] | |
| B9 | Setelah logout, `localStorage` token terhapus | [ ] | [ ] | |
| B10 | Akses `/dashboard` tanpa login → redirect ke `/login` | [ ] | [ ] | |
| B11 | Akses `/login` saat sudah login → redirect ke `/dashboard` | [ ] | [ ] | |

---

## C. NAVIGASI & LAYOUT

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| C1 | Sidebar tampil di desktop | [ ] | [ ] | |
| C2 | Sidebar slide-in/out di mobile (tombol hamburger) | [ ] | [ ] | Perkecil browser < 1024px |
| C3 | Overlay gelap muncul saat sidebar dibuka di mobile | [ ] | [ ] | |
| C4 | Klik overlay → sidebar tertutup | [ ] | [ ] | |
| C5 | Sidebar auto-tutup saat navigasi di mobile | [ ] | [ ] | |
| C6 | Semua menu sidebar bisa diklik dan navigasi ke halaman yang benar | [ ] | [ ] | |
| C7 | Menu aktif ditandai dengan warna hijau | [ ] | [ ] | |
| C8 | Badge "Segera" muncul di SPMB, Absensi QR, Inventaris | [ ] | [ ] | |
| C9 | Topbar menampilkan nama halaman yang benar | [ ] | [ ] | |
| C10 | Topbar menampilkan badge MVP | [ ] | [ ] | |
| C11 | Route `/spmb`, `/absensi-qr`, `/inventaris` → halaman ComingSoon | [ ] | [ ] | |
| C12 | Route tidak dikenal → redirect ke `/dashboard` | [ ] | [ ] | Coba buka `/halaman-tidak-ada` |

---

## D. DASHBOARD

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| D1 | Halaman Dashboard tampil tanpa error | [ ] | [ ] | |
| D2 | Banner sambutan dengan sapaan dinamis (pagi/siang/sore/malam) | [ ] | [ ] | |
| D3 | 6 kartu statistik tampil dengan angka | [ ] | [ ] | |
| D4 | Badge "Mode Demo" tampil di banner | [ ] | ⏭ | |
| D5 | Badge "Data Live" tampil saat backend aktif | ⏭ | [ ] | |
| D6 | 4 tombol Aksi Cepat tampil dan bisa diklik | [ ] | [ ] | |
| D7 | Tabel dokumen terbaru tampil dengan data | [ ] | [ ] | |
| D8 | Tombol "Lihat Semua →" navigate ke `/arsip` | [ ] | [ ] | |
| D9 | 3 kartu Status Sistem tampil | [ ] | [ ] | |
| D10 | Status Frontend: "Online" (hijau) | [ ] | [ ] | |
| D11 | Loading state tampil saat data sedang diambil | [ ] | [ ] | |

---

## E. BUAT DOKUMEN

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| E1 | Halaman "Buat Dokumen" tampil dengan 8 pilihan jenis | [ ] | [ ] | |
| E2 | Step bar "Pilih Jenis → Isi Data → Preview → Selesai" tampil | [ ] | [ ] | |
| E3 | Klik jenis dokumen → kartu terpilih (border hijau + centang) | [ ] | [ ] | |
| E4 | Tombol "Lanjut" disabled jika belum pilih jenis | [ ] | [ ] | |
| E5 | Setelah pilih jenis → step 2 (form) dengan field yang sesuai | [ ] | [ ] | |
| E6 | Validasi: submit tanpa isi field wajib → pesan error per field | [ ] | [ ] | |
| E7 | Validasi: scroll otomatis ke field error pertama | [ ] | [ ] | |
| E8 | Field opsional tidak divalidasi | [ ] | [ ] | |
| E9 | Tombol "Preview Data" → step 3 (ringkasan semua data) | [ ] | [ ] | |
| E10 | Preview menampilkan data sekolah otomatis | [ ] | [ ] | |
| E11 | Preview menampilkan semua field yang diisi | [ ] | [ ] | |
| E12 | Tombol "← Kembali" kembali ke step sebelumnya | [ ] | [ ] | |
| E13 | Tombol "Reset" → kembali ke step 1 dan form kosong | [ ] | [ ] | |
| E14 | Tombol "Buat Dokumen" → loading spinner tampil | [ ] | [ ] | |
| E15 | Generate sukses (mode demo) → step 4 dengan pesan "Mode Demo" | [ ] | ⏭ | |
| E16 | Generate sukses (mode full) → step 4 dengan link Google Docs nyata | ⏭ | [ ] | |
| E17 | Step 4: tombol "Buka Google Docs" bisa diklik | [ ] | [ ] | |
| E18 | Step 4: tombol "Unduh PDF" bisa diklik | [ ] | [ ] | |
| E19 | Toast sukses muncul setelah generate berhasil | [ ] | [ ] | |
| E20 | Error generate → toast error dengan pesan ramah | [ ] | [ ] | |
| E21 | Test semua 8 jenis dokumen: Undangan, Pemberitahuan Ortu, Persetujuan Wali, Keterangan, SK Panitia, Berita Acara, Proposal, Notulen | [ ] | [ ] | |

---

## F. ARSIP DOKUMEN

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| F1 | Halaman Arsip tampil dengan data | [ ] | [ ] | |
| F2 | Tabel tampil di desktop (sm ke atas) | [ ] | [ ] | |
| F3 | Card list tampil di mobile (< sm) | [ ] | [ ] | Perkecil browser |
| F4 | Kolom: ID, Tanggal, Jenis, Nomor, Perihal, Dibuat Oleh, Status, Aksi | [ ] | [ ] | |
| F5 | Klik header kolom → data ter-sort | [ ] | [ ] | |
| F6 | Search berfungsi (cari ID, nomor, perihal) | [ ] | [ ] | |
| F7 | Tombol clear ✕ di search berfungsi | [ ] | [ ] | |
| F8 | Filter Jenis Dokumen berfungsi | [ ] | [ ] | |
| F9 | Filter Status berfungsi | [ ] | [ ] | |
| F10 | Pill filter status (Semua/Berhasil/Draft/Gagal) berfungsi | [ ] | [ ] | |
| F11 | Tombol "Reset" filter berfungsi | [ ] | [ ] | |
| F12 | Info "Ditemukan X dari Y dokumen" tampil saat filter aktif | [ ] | [ ] | |
| F13 | Tombol "Docs" → buka Google Docs (aktif hanya untuk status Berhasil) | [ ] | [ ] | |
| F14 | Tombol "PDF" → buka PDF (aktif hanya untuk status Berhasil) | [ ] | [ ] | |
| F15 | Tombol "Docs" / "PDF" disabled (abu) untuk status Draft/Gagal | [ ] | [ ] | |
| F16 | Tombol salin link → toast "Link berhasil disalin" | [ ] | [ ] | |
| F17 | Tombol Hapus → modal konfirmasi muncul | [ ] | [ ] | |
| F18 | Modal Hapus: tombol "Batal" tutup modal | [ ] | [ ] | |
| F19 | Modal Hapus: tombol "Ya, Hapus" → dokumen hilang dari tabel | [ ] | [ ] | |
| F20 | Empty state tampil jika tidak ada hasil filter | [ ] | [ ] | |
| F21 | Loading state tampil saat data sedang diambil | [ ] | [ ] | |

---

## G. MASTER DATA

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| G1 | Halaman Master Data tampil dengan data default | [ ] | [ ] | |
| G2 | 4 seksi collapsible: Identitas, Brand, Kepsek, Aset Digital | [ ] | [ ] | |
| G3 | Klik header seksi → lipat/buka | [ ] | [ ] | |
| G4 | Data default SD Negeri 3 Pringgabaya sudah terisi | [ ] | [ ] | |
| G5 | Edit salah satu field → banner kuning "belum disimpan" muncul | [ ] | [ ] | |
| G6 | Validasi: simpan tanpa field wajib → error per field | [ ] | [ ] | |
| G7 | Tombol "Simpan Perubahan" → loading → toast sukses | [ ] | [ ] | |
| G8 | Setelah simpan: refresh halaman → data tetap (dari localStorage) | [ ] | [ ] | |
| G9 | Banner hijau "Disimpan terakhir: [waktu]" tampil setelah simpan | [ ] | [ ] | |
| G10 | Tombol "Preview Kop Surat" → modal kop surat muncul | [ ] | [ ] | |
| G11 | Modal kop surat menampilkan nama sekolah yang diisi | [ ] | [ ] | |
| G12 | Tombol "Reset ke Default" → modal konfirmasi muncul | [ ] | [ ] | |
| G13 | Konfirmasi reset → data kembali ke default | [ ] | [ ] | |

---

## H. PENGATURAN (SETTINGS)

| # | Item | Mode Demo | Mode Full | Catatan |
|---|------|-----------|-----------|---------|
| H1 | Halaman Pengaturan tampil | [ ] | [ ] | |
| H2 | Banner "Mode Demo" tampil jika backend belum dikonfigurasi | [ ] | ⏭ | |
| H3 | Tombol "Test Koneksi" bisa diklik | [ ] | [ ] | |
| H4 | Mode demo: status "Belum diset" untuk Worker dan GAS | [ ] | ⏭ | |
| H5 | Mode full: Worker menampilkan status yang benar setelah test | ⏭ | [ ] | |
| H6 | Mode full: GAS menampilkan status yang benar setelah test | ⏭ | [ ] | |
| H7 | Toast sukses/error muncul setelah test koneksi | [ ] | [ ] | |
| H8 | Detail teknis koneksi bisa di-expand (collapsible) | [ ] | [ ] | |
| H9 | Panduan setup 4 langkah tampil dengan benar | [ ] | [ ] | |

---

## I. WORKER API (Mode Full Saja)

| # | Item | Hasil | Catatan |
|---|------|-------|---------|
| I1 | `GET /api/health` → 200, `gasConfigured: true` | [ ] | |
| I2 | `POST /api/login` PIN benar → 200, ada token | [ ] | |
| I3 | `POST /api/login` PIN salah → 401 | [ ] | |
| I4 | `POST /api/gas` tanpa token → 401 | [ ] | |
| I5 | `POST /api/gas` token expired → 401 | [ ] | |
| I6 | `POST /api/gas` action `ping` → GAS response OK | [ ] | |
| I7 | `POST /api/gas` action `getDashboardStats` → data stats | [ ] | |
| I8 | `POST /api/gas` action tidak dikenal → 400 | [ ] | |
| I9 | CORS: request dari `localhost:5173` tidak diblokir | [ ] | |
| I10 | Response tidak mengandung `GAS_SECRET` atau `GAS_URL` | [ ] | Cek Network tab |

---

## J. RESPONSIVITAS

| # | Item | Lulus | Catatan |
|---|------|-------|---------|
| J1 | Desktop (≥1024px): sidebar selalu tampil | [ ] | |
| J2 | Tablet (768–1023px): sidebar tersembunyi, bisa dibuka | [ ] | |
| J3 | Mobile (<768px): sidebar tersembunyi, layout single column | [ ] | |
| J4 | Dashboard: StatCard 2 kolom di mobile, 3 di tablet, 6 di desktop | [ ] | |
| J5 | Arsip: tabel di tablet+, card list di mobile | [ ] | |
| J6 | Form Buat Dokumen: field 1 kolom di mobile | [ ] | |
| J7 | Master Data: grid 2 kolom di tablet+, 1 kolom di mobile | [ ] | |
| J8 | Modal (hapus, kop surat, reset) tampil dengan benar di mobile | [ ] | |
| J9 | Tombol aksi tabel tidak overflow di layar kecil | [ ] | |

---

## K. FALLBACK & ERROR HANDLING

| # | Item | Hasil | Catatan |
|---|------|-------|---------|
| K1 | Jika VITE_API_URL tidak diset → aplikasi tetap berjalan (mode demo) | [ ] | |
| K2 | Jika Worker tidak bisa dihubungi → fallback ke dummy, tidak crash | [ ] | Matikan wrangler dev |
| K3 | Jika GAS error → Worker mengembalikan 502, frontend toast error | [ ] | |
| K4 | Token expired → redirect ke login, tidak crash | [ ] | |
| K5 | Form submit tanpa internet → toast error ramah | [ ] | |
| K6 | Arsip gagal load dari server → tetap tampil dummy data | [ ] | |
| K7 | Pesan error selalu dalam Bahasa Indonesia | [ ] | |

---

## Ringkasan Hasil Testing

| Seksi | Total | Lulus | Gagal | Skip |
|-------|-------|-------|-------|------|
| A. Setup | 6 | | | |
| B. Auth | 11 | | | |
| C. Navigasi | 12 | | | |
| D. Dashboard | 11 | | | |
| E. Buat Dokumen | 21 | | | |
| F. Arsip | 21 | | | |
| G. Master Data | 13 | | | |
| H. Pengaturan | 9 | | | |
| I. Worker API | 10 | | | |
| J. Responsivitas | 9 | | | |
| K. Fallback | 7 | | | |
| **TOTAL** | **130** | | | |

---

*Versi checklist: 1.0 — dibuat 2026-06-07*
