# TASK_LOG.md
# SDENTIBAYA AdminKit — Log Progres Pengembangan

> Catat setiap tahap yang selesai di sini. Format: tanggal, tahap, deskripsi, file yang dibuat/diubah.

---

## Format Entri

```
### [TAHAP-XX] Nama Tahap
- **Tanggal:** YYYY-MM-DD
- **Status:** ✅ Selesai / 🔄 Sedang Dikerjakan / ⏸ Ditunda
- **Deskripsi:** Apa yang dikerjakan
- **File dibuat/diubah:**
  - path/ke/file
- **Catatan:** (opsional) hal penting yang perlu diingat
```

---

## Log

### [TAHAP-00] Inisialisasi Dokumentasi Proyek
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membuat file dokumentasi awal proyek sebelum pengembangan dimulai. Mengunci konteks, spesifikasi, aturan, dan rencana kerja.
- **File dibuat/diubah:**
  - `PROJECT_CONTEXT.md` — konteks proyek, stack, arsitektur, keputusan teknis, aturan
  - `APP_SPEC.md` — spesifikasi fitur MVP, jenis dokumen, API endpoints, struktur Sheets
  - `TASK_LOG.md` — file ini, log progres pengembangan
  - `TODO.md` — daftar tahapan kerja lengkap
- **Catatan:** Tidak ada kode aplikasi yang dibuat di tahap ini. Fokus pada penguncian konteks proyek.

---

### [TAHAP-01] Setup Frontend React + Vite + Tailwind CSS
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membuat seluruh struktur frontend dari nol. Setup React + Vite + Tailwind CSS, routing, komponen reusable, dan semua halaman MVP dengan data dummy.
- **File dibuat/diubah:**
  - `frontend/package.json` — dependensi proyek
  - `frontend/index.html` — entry HTML dengan meta tag, Inter font
  - `frontend/vite.config.js` — konfigurasi Vite
  - `frontend/tailwind.config.js` — warna brand (hijau, navy, emas)
  - `frontend/postcss.config.js`
  - `frontend/README.md` — petunjuk menjalankan frontend
  - `frontend/src/main.jsx` — entry React
  - `frontend/src/App.jsx` — routing + ProtectedRoute
  - `frontend/src/styles/index.css` — Tailwind + utility classes (.btn-primary, .card, .badge, dll.)
  - `frontend/src/lib/constants.js` — konstanta (SEKOLAH, BRAND, MENU, JENIS_DOKUMEN)
  - `frontend/src/lib/auth.js` — simpan/ambil/hapus token (sessionStorage)
  - `frontend/src/lib/api.js` — semua fungsi API call + mode dummy DEV
  - `frontend/src/components/Layout.jsx` — wrapper sidebar+topbar+outlet
  - `frontend/src/components/Sidebar.jsx` — nav navy, ikon SVG inline, responsive mobile
  - `frontend/src/components/Topbar.jsx` — header halaman + hamburger mobile
  - `frontend/src/components/StatCard.jsx` — kartu statistik dashboard
  - `frontend/src/components/DataTable.jsx` — tabel reusable
  - `frontend/src/components/FormField.jsx` — input/select/textarea reusable
  - `frontend/src/components/Toast.jsx` — notifikasi toast + hook useToast
  - `frontend/src/components/EmptyState.jsx` — tampilan data kosong
  - `frontend/src/components/LoadingState.jsx` — tampilan loading
  - `frontend/src/pages/Login.jsx` — halaman login PIN (elegan, animasi)
  - `frontend/src/pages/Dashboard.jsx` — dashboard + statistik + aktivitas terbaru
  - `frontend/src/pages/CreateDocument.jsx` — buat dokumen, form dinamis per jenis
  - `frontend/src/pages/Archive.jsx` — arsip dokumen + filter + hapus + konfirmasi
  - `frontend/src/pages/MasterData.jsx` — edit data master sekolah
  - `frontend/src/pages/Templates.jsx` — kelola template Google Docs
  - `frontend/src/pages/Settings.jsx` — pengaturan koneksi + panduan setup
  - `frontend/src/pages/ComingSoon.jsx` — placeholder fitur belum tersedia
- **Catatan:**
  - Semua API menggunakan mode dummy di `import.meta.env.DEV` — tidak butuh backend nyata untuk dev
  - Login dummy: PIN `123456`
  - Warna: hijau (#16a34a) utama, navy (#151e54) sidebar, emas (#f59e0b) aksen
  - Responsive: sidebar geser di mobile, layout 2 kolom di desktop

<!-- Entri berikutnya akan ditambahkan di bawah ini -->
