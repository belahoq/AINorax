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

### [TAHAP-02] Sempurnakan Layout Utama Admin Panel
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Memperbaiki dan menyempurnakan semua komponen layout utama. Menambah 3 menu baru (SPMB, Absensi QR, Inventaris), badge MVP, branding SDENTIBAYA MELAJU, kelompok menu sidebar, dan polish visual seluruh komponen.
- **File dibuat/diubah:**
  - `frontend/src/lib/constants.js` — MENU_GROUPS (3 grup bertingkat), BRAND.versi + BRAND.produk, MENU_ITEMS flat list
  - `frontend/src/App.jsx` — tambah route: /spmb, /absensi-qr, /inventaris (→ ComingSoon dengan label prop)
  - `frontend/src/components/Sidebar.jsx` — logo SD, badge MVP, slogan "SDENTIBAYA MELAJU", menu dikelompokkan 3 grup, ikon baru (users, qr-code, box), badge "Segera" untuk Coming Soon, overlay animasi mobile
  - `frontend/src/components/Topbar.jsx` — nama app "SDENTIBAYA AdminKit" + badge MVP di kanan, page title + nama sekolah, page title lengkap untuk semua route baru
  - `frontend/src/components/Layout.jsx` — auto-tutup sidebar saat navigasi, cegah scroll body saat sidebar mobile terbuka, max-width konten
  - `frontend/src/components/Toast.jsx` — redesign: border-left colored, animasi slide-in dari kanan, title per tipe, tombol dismiss lebih clean
  - `frontend/src/components/LoadingState.jsx` — spinner dua-layer (track + arc berputar), prop size (sm/md/lg)
  - `frontend/src/components/EmptyState.jsx` — rounded-2xl icon container, prop compact
  - `frontend/src/pages/ComingSoon.jsx` — menerima prop label, badge nama fitur, info versi MVP
  - `frontend/src/styles/index.css` — utility .bg-white/8, .border-white/8 untuk sidebar dark
  - `frontend/tailwind.config.js` — warna emas-50/100 tambahan, transitionDuration 250ms, navy-50
- **Catatan:**
  - Sidebar menggunakan warna `#0f1729` (lebih gelap dari navy-900) untuk tampilan lebih premium
  - Menu "SPMB", "Absensi QR", "Inventaris" menampilkan badge "Segera" dan redirect ke ComingSoon
  - Toast baru menggunakan desain border-kiri berwarna (lebih ringan dari background penuh)
  - Layout auto-close sidebar saat pindah halaman (UX mobile lebih baik)

<!-- Entri berikutnya akan ditambahkan di bawah ini -->
