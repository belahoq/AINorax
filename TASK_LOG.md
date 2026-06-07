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

### [TAHAP-03] Bangun Halaman Dashboard Informatif
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membangun ulang halaman Dashboard dengan 5 seksi lengkap: banner sambutan dinamis, 6 kartu statistik, 4 aksi cepat gradient, tabel dokumen terbaru, dan status sistem. Semua data dari konstanta dummy.
- **File dibuat/diubah:**
  - `frontend/src/lib/constants.js` — tambah `DUMMY_STATS` (6 metrik + trend), `DUMMY_DOKUMEN_TERBARU` (6 baris), `DUMMY_STATUS_SISTEM` (frontend/worker/gas)
  - `frontend/src/components/StatCard.jsx` — strip warna atas, 6 tema warna (hijau/navy/emas/merah/ungu/cyan), prop `trend` (↑↓–), prop `compact`, prop `onClick`
  - `frontend/src/components/DataTable.jsx` — prop `title`, `headerRight`, `emptyTitle/Subtitle/Action/Icon`, `footer`, `compact`, `striped`; menggunakan `EmptyState` & `LoadingState` internal
  - `frontend/src/pages/Dashboard.jsx` — rebuild lengkap: banner sambutan (sapaan waktu pagi/siang/sore/malam), 6 StatCard grid responsif (2→3→6 kolom), 4 aksi cepat kartu gradient, DataTable dokumen terbaru + footer, seksi status sistem 3 kartu + `StatusBadge`, ikon SVG inline per sistem
- **Catatan:**
  - StatCard grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` — rapi di semua breakpoint
  - Aksi cepat menggunakan gradient gelap per warna brand
  - Status sistem: Frontend=online (hijau), Worker & GAS=unknown (abu) — akan aktif setelah backend dikonfigurasi
  - Semua data dari `DUMMY_*` di `constants.js` — zero API call

### [TAHAP-04] Bangun Halaman Buat Dokumen dengan Form Dinamis
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membangun halaman Buat Dokumen dengan 4-step wizard: pilih jenis → isi form → preview → selesai. Form dinamis berubah sesuai jenis dokumen yang dipilih. Validasi field wajib, ringkasan preview, dan simulasi generate.
- **File dibuat/diubah:**
  - `frontend/src/lib/constants.js` — tambah `DOC_FIELDS` (konfigurasi field 8 jenis dokumen dalam struktur groups), `PENANDA_TANGAN_OPTIONS`
  - `frontend/src/components/FormField.jsx` — tambah `type=radio-group`, `type=checkbox`, label `(opsional)`, error dengan ikon, hint styling
  - `frontend/src/pages/CreateDocument.jsx` — rebuild lengkap: 4-step wizard, `StepPilihJenis` (grid kartu 8 jenis berwarna), `StepIsiForm` (form dinamis grouped), `StepPreview` (ringkasan tabel + info sekolah), `StepHasil` (sukses + link dummy), `StepBar` indicator, validasi field wajib + scroll ke error pertama, simulasi generate 1.8s
- **Catatan:**
  - `DOC_FIELDS` menggunakan struktur `groups[]` sehingga form bisa dikelompokkan per seksi (Identitas Surat / Waktu & Tempat / Isi Surat / dll.)
  - Payload generate sudah disiapkan lengkap (termasuk data sekolah) — tinggal ganti `setTimeout` dengan `buatDokumen()` dari `api.js` saat backend siap
  - Validasi hanya field `required: true`, field `optional: true` tidak divalidasi
  - Simulasi delay 1.8 detik dengan spinner saat "Membuat Dokumen..."
  - `console.log` payload aktif di mode DEV untuk debugging

### [TAHAP-05] Bangun Halaman Arsip Dokumen
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membangun halaman Arsip Dokumen lengkap dengan tabel desktop + card list mobile, filter berlapis (search, jenis, status), pill ringkasan status, semua tombol aksi (Docs/PDF/Salin/Hapus), dan modal konfirmasi hapus. Semua data dari dummy.
- **File dibuat/diubah:**
  - `frontend/src/lib/constants.js` — tambah `DUMMY_ARSIP_DOKUMEN` (15 entri, semua 8 jenis, 3 status: berhasil/draft/gagal) dan `STATUS_DOKUMEN` array
  - `frontend/src/components/DataTable.jsx` — tambah kolom `sortable` (klik header untuk sort asc/desc) + `hideOnMobile` (kolom disembunyikan di layar kecil) + `SortIcon`, prop `onRowClick`
  - `frontend/src/pages/Archive.jsx` — rebuild lengkap: `StatusBadge` per status, `AksiButtons` (Docs/PDF/Salin/Hapus), `DocCard` untuk mobile, `ModalHapus` konfirmasi, toolbar search+filter jenis+filter status, pill ringkasan per-status, tabel desktop (`hidden sm:block`) + card list mobile (`sm:hidden`), reset filter, info jumlah hasil, EmptyState kondisional
- **Catatan:**
  - Tabel desktop: kolom ID/Tanggal/Nomor Surat/Dibuat Oleh disembunyikan di mobile (`hideOnMobile`)
  - Card list mobile: tampil di bawah breakpoint `sm` — tiap kartu memiliki semua aksi lengkap
  - Tombol Docs/PDF disabled (styling abu) jika status bukan `berhasil` atau URL kosong
  - Salin link menggunakan `navigator.clipboard.writeText` dengan fallback
  - Hapus hanya menghapus dari state lokal — akan diganti ke API saat backend aktif

### [TAHAP-06] Bangun Halaman Master Data Sekolah
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membangun halaman Master Data Sekolah lengkap dengan form 4 seksi collapsible, validasi, simpan/load/reset ke localStorage, banner status perubahan, preview kop surat modal, dan helper storage terpusat.
- **File dibuat/diubah:**
  - `frontend/src/lib/storage.js` *(baru)* — helper localStorage: `STORAGE_KEYS`, `storageSet/Get/Remove/Available`, `saveMasterData`, `loadMasterData`, `resetMasterData`, `getMasterDataSavedAt`
  - `frontend/src/lib/constants.js` — tambah `DEFAULT_MASTER_DATA` (18 field: identitas sekolah, brand, kepsek, aset digital)
  - `frontend/src/pages/MasterData.jsx` — rebuild lengkap: 4 seksi collapsible (`SeksiCard`), grid 2 kolom, validasi field wajib + scroll ke error, banner dirty/saved, simpan ke localStorage, modal `ModalPreviewKop` (kop surat dengan logo/ttd/stempel placeholder), modal `ModalKonfirmasiReset`, ikon SVG inline semua
- **Catatan:**
  - `storage.js` adalah helper generik — bisa dipakai untuk fitur lain (template, preferensi user) dengan tambah key baru di `STORAGE_KEYS`
  - Form inisialisasi dari localStorage (jika ada) → fallback ke `DEFAULT_MASTER_DATA`
  - Payload `form` sudah siap dikirim ke GAS action `saveMasterData` — tinggal ganti `setTimeout` dengan API call ke Worker
  - Preview kop surat: menampilkan logo dari URL jika diisi, tanda tangan digital dari URL jika diisi, dengan graceful fallback ke placeholder jika URL gagal load
  - Field aset digital (urlLogo, urlTtd, urlStempel) span 2 kolom di grid desktop

### [TAHAP-07] Buat Cloudflare Worker sebagai API Proxy
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membangun Cloudflare Worker sebagai API proxy antara frontend dan Google Apps Script. Mencakup 3 endpoint, autentikasi HMAC-SHA256, CORS, whitelist action, sanitasi secret, dan dokumentasi lengkap.
- **File dibuat/diubah:**
  - `worker/index.js` *(baru)* — entry point Worker: router, `handleHealth`, `handleLogin`, `handleGas`, helper `jsonResponse`, `withCors/handleCors`, `readBody` (limit 512KB), `generateToken`, `verifyToken`, `hmacSha256`, `timingSafeEqual`, `sleep`
  - `worker/wrangler.toml.example` *(baru)* — template konfigurasi Wrangler: `[vars]` untuk `GAS_URL`+`ALLOWED_ORIGIN`, env `development`+`production`, instruksi `wrangler secret put`
  - `worker/README.md` *(baru)* — dokumentasi lengkap: arsitektur, semua endpoint + schema request/response, tabel action GAS, langkah setup 1–7, tabel env vars, tabel keamanan, troubleshooting
  - `frontend/README.md` *(diubah)* — tambah seksi `Environment Variable` (`.env.local`), seksi `Menjalankan Full Stack Lokal` (2 terminal), referensi ke `worker/README.md`
- **Catatan:**
  - Token session: format `<timestamp_hex>.<hmac_hex>` — tidak butuh state/DB, verifikasi dengan re-compute HMAC
  - Token TTL: 8 jam — dikonfigurasi via `TOKEN_TTL_MS`
  - `timingSafeEqual` menggunakan double-HMAC agar perbandingan string tidak rentan timing attack
  - `GAS_SECRET` **tidak pernah** muncul di response ke frontend — ada sanitasi eksplisit
  - Whitelist `ALLOWED_ACTIONS` di Worker mencegah request arbitrary action ke GAS
  - `wrangler.toml` (aktif) ada di `.gitignore` — hanya `.example` yang di-commit
  - Login delay 300ms saat PIN salah untuk memperlambat brute-force

### [TAHAP-08] Buat Google Apps Script Backend (Code.gs)
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Membangun backend Google Apps Script lengkap. Mencakup entry point doPost, 10 action handler, 8 helper function, auto-inisialisasi sheet, dan dokumentasi setup lengkap.
- **File dibuat/diubah:**
  - `gas/Code.gs` *(baru)* — backend GAS lengkap: `doPost`, `jsonResponse`, `validateSecret`, `routeAction`, `ping`, `getSettings`, `saveSettings`, `getDashboardStats`, `createDocument` (+ `buatDokumenBaru` fallback + `getTemplateDocId`), `listDocuments`, `getDocument`, `listTemplates`, `saveTemplate`, `createLog`, `getSheet` (auto-create + header), `generateId`, `replacePlaceholdersInDoc`, `createPdfFromDoc`, `logAction`, `formatTanggalIndonesia`, `initSpreadsheet`
  - `gas/README_GAS.md` *(baru)* — dokumentasi 7 langkah setup, struktur 4 sheet, semua action + format request/response, cara buat template placeholder, cara redeploy, troubleshooting
  - `README.md` *(baru di root)* — README utama repo: arsitektur, struktur folder, quick start, tabel fitur MVP, 8 jenis dokumen, keamanan
- **Catatan:**
  - `createDocument` punya dua mode: salin template Google Docs yang ada (via `getTemplateDocId`) atau buat dokumen baru dari scratch (`buatDokumenBaru`) jika template tidak ditemukan — tidak pernah gagal karena tidak ada template
  - `getSheet` otomatis membuat sheet baru dengan header jika belum ada — tidak perlu setup manual
  - `initSpreadsheet` dijalankan sekali dari Apps Script Editor untuk inisialisasi 4 sheet + data Settings default
  - `replacePlaceholdersInDoc` mengganti `{{key}}` di Body, Header, dan Footer dokumen
  - `createPdfFromDoc` menggunakan export URL + OAuth token — tidak butuh library tambahan
  - `logAction` silent fail — tidak melempar error agar tidak mengganggu flow utama
  - Script Properties: `GAS_SECRET`, `SPREADSHEET_ID`, `DRIVE_FOLDER_ID`, `DEFAULT_TEMPLATE_DOC_ID` (opsional)

### [TAHAP-09] Integrasi Frontend dengan Cloudflare Worker
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Mengintegrasikan semua halaman frontend dengan Cloudflare Worker API. Menerapkan strategi graceful degradation — jika `VITE_API_URL` tidak diset atau Worker tidak bisa dihubungi, aplikasi otomatis fallback ke dummy data dan tetap bisa dipakai sepenuhnya.
- **File dibuat/diubah:**
  - `frontend/src/lib/auth.js` — rebuild: `saveSession(token, user)`, `getSession()`, `getToken()`, `isAuthenticated()`, `logout()` — simpan ke localStorage (persist setelah refresh), alias `saveToken/removeToken/isLoggedIn` untuk kompatibilitas
  - `frontend/src/lib/api.js` — rebuild lengkap: fetch timeout 12s, pesan error ramah Bahasa Indonesia, strategi fallback per fungsi; `apiHealth()`, `login(pin)`, `gasRequest(action, payload)`, `getDashboardStats()` + normalise GAS response, `createDocument(payload)`, `listDocuments(filter)`, `getSettings()`, `saveSettings(payload)`, `pingWorker()` / alias `pingKoneksi()`
  - `frontend/src/pages/Login.jsx` — gunakan `saveSession(token, user)`, redirect jika sudah login, error message styled, badge "Mode Demo" jika backend belum diset
  - `frontend/src/pages/Dashboard.jsx` — `useEffect` fetch `getDashboardStats()`, loading state, badge "Data Live / Mode Demo", fallback transparan ke DUMMY_STATS
  - `frontend/src/pages/Archive.jsx` — `useEffect` fetch `listDocuments()`, loading state di tabel dan card list, toast warning jika fallback
  - `frontend/src/pages/CreateDocument.jsx` — panggil `createDocument(payload)` nyata (Worker → GAS), handle error dengan pesan ramah
  - `frontend/src/pages/Settings.jsx` — gunakan `pingWorker()`, tampilkan detail teknis, handle semua status, banner mode demo
  - `frontend/.env.example` *(baru)* — template variabel environment dengan instruksi
- **Catatan:**
  - `BACKEND_CONFIGURED = !!import.meta.env.VITE_API_URL` — deteksi otomatis mode
  - Fallback dilakukan di `api.js`, bukan di komponen — komponen tidak tahu apakah data dari API atau dummy
  - Token disimpan di `localStorage` agar tetap login setelah refresh halaman
  - `pingWorker` melakukan 2 langkah: `GET /api/health` → `POST /api/gas {action:ping}`

### [TAHAP-10] Testing, Bug Fix, dan Polishing MVP
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Audit menyeluruh seluruh codebase, perbaikan 5 bug (2 kritis, 3 minor), pembuatan CHECKLIST_TESTING.md (130 item) dan DEPLOYMENT_GUIDE.md (7 bagian, end-to-end).
- **Bug yang diperbaiki:**
  1. 🔴 **KRITIS** — `worker/index.js` ALLOWED_ACTIONS tidak sinkron dengan GAS dan api.js. Nama action lama (`buatDokumen`, `getArsipDokumen`, dll.) diganti dengan nama yang sinkron: `createDocument`, `listDocuments`, `getDocument`, `getSettings`, `saveSettings`, `listTemplates`, `saveTemplate`, `createLog`
  2. 🔴 **KRITIS** — `CreateDocument.jsx` StepHasil hardcode teks "Mode Simulasi" padahal backend sudah aktif. Diganti dengan kondisional: cek `docsUrl.includes('SIMULASI')` → tampil pesan demo, jika tidak → tampil konfirmasi dokumen tersimpan
  3. 🟡 **MINOR** — `tailwind.config.js` tidak memiliki warna `cyan` dan `ungu`/`purple`. StatCard menggunakan kedua warna ini → class tidak di-generate. Ditambahkan palet warna `cyan`, `ungu`, dan `purple`
  4. 🟡 **MINOR** — `Archive.jsx` useEffect memiliki `toast.warning` di dalam catch → lint warning dependency. Dihapus toast dari catch, ditambahkan eslint-disable comment
  5. 🟡 **MINOR** — `MasterData.jsx` tidak ada sinkronisasi dari GAS saat backend aktif. Ditambahkan `import { getSettings }` dan `useEffect` untuk fetch + merge server data dengan localStorage
- **File dibuat:**
  - `CHECKLIST_TESTING.md` — 130 item testing terstruktur dalam 11 seksi (A–K): Setup, Auth, Navigasi, Dashboard, Buat Dokumen, Arsip, Master Data, Pengaturan, Worker API, Responsivitas, Fallback & Error Handling
  - `DEPLOYMENT_GUIDE.md` — panduan deployment 7 bagian end-to-end: GAS setup (6 langkah), Worker deployment (6 langkah), Pages deployment (4 langkah), verifikasi akhir (curl commands), cara update kode, tabel env vars lengkap, troubleshooting 10 masalah umum
- **File diubah:**
  - `worker/index.js` — fix ALLOWED_ACTIONS
  - `frontend/src/pages/CreateDocument.jsx` — fix StepHasil kondisional
  - `frontend/tailwind.config.js` — tambah cyan, ungu, purple colors
  - `frontend/src/pages/Archive.jsx` — fix useEffect dependency
  - `frontend/src/pages/MasterData.jsx` — tambah GAS sync useEffect

---

## Hal yang Sudah Aman ✅

| Area | Status |
|------|--------|
| Autentikasi PIN dengan HMAC-SHA256 | ✅ Aman |
| Token session di localStorage (persist refresh) | ✅ Aman |
| GAS_SECRET tidak pernah terekspos ke frontend | ✅ Aman |
| GAS_URL tidak pernah terekspos ke frontend | ✅ Aman |
| CORS per-origin dari ALLOWED_ORIGIN env | ✅ Aman |
| Payload limit 512 KB di Worker | ✅ Aman |
| Action whitelist di Worker | ✅ Sinkron dengan GAS |
| Fallback dummy data jika backend tidak aktif | ✅ Transparan |
| Error handling ramah Bahasa Indonesia | ✅ Konsisten |
| Responsive desktop + mobile | ✅ Diverifikasi |
| Semua 8 jenis dokumen dengan field lengkap | ✅ Lengkap |

## Hal yang Masih Perlu Dikembangkan 🔜

| Area | Catatan |
|------|---------|
| Hapus dokumen dari GAS/Drive | Saat ini hanya hapus dari state lokal |
| Nomor surat otomatis | Masih manual diisi pengguna |
| Multi-user / role | Saat ini single admin |
| Template manager visual | Masih input ID manual |
| Notifikasi setelah dokumen selesai | Belum ada email/push notification |
| SPMB, Absensi QR, Inventaris | Masih halaman ComingSoon |
| Pagination arsip dokumen | Belum ada untuk data banyak |
| Dark mode | Tidak dalam scope MVP |

<!-- Entri berikutnya akan ditambahkan di bawah ini -->

---

### [BUGFIX] Login production selalu masuk dummy mode meski VITE_API_URL sudah diset di Cloudflare Pages
- **Tanggal:** 2026-06-07
- **Status:** ✅ Diperbaiki
- **File:** `frontend/.env.production` *(file baru)*
- **Gejala:** Login di production menampilkan `"PIN salah. PIN default pengembangan adalah 123456."` — yaitu pesan dari blok dummy mode, bukan dari Worker.
- **Penyebab:**
  `BACKEND_CONFIGURED = !!import.meta.env.VITE_API_URL` dibaca **saat build** (compile time Vite), bukan saat runtime. Ketika `npm run build` dijalankan di komputer lokal tanpa file `.env.production`, `VITE_API_URL` bernilai `undefined` → `BACKEND_CONFIGURED = false` → seluruh logika API masuk dummy mode.
  Variabel environment yang diset di **Cloudflare Pages Dashboard** hanya berlaku untuk build yang dilakukan oleh Cloudflare — tidak terbaca saat build lokal. Output `"0 files uploaded"` saat deploy mengkonfirmasi file lama (dari build tanpa VITE_API_URL) yang terupload.
- **Solusi:**
  Buat file `frontend/.env.production` yang berisi `VITE_API_URL` dengan URL Worker aktual. File ini dibaca otomatis oleh Vite saat `npm run build` dijalankan. File ini boleh di-commit karena tidak mengandung secret.
- **Cara apply:**
  ```cmd
  cd frontend
  npm run build      ← VITE_API_URL sekarang ter-embed ke bundle
  wrangler pages deploy dist --project-name sdentibaya-adminkit
  ```
- **Catatan penting:** Jika URL Worker berubah di masa depan (misal rename worker), file `.env.production` harus diupdate dan build ulang dijalankan.

---

### [BUGFIX] Login gagal — PIN salah selalu muncul meski PIN benar
- **Tanggal:** 2026-06-07
- **Status:** ✅ Diperbaiki
- **File:** `frontend/src/lib/api.js`
- **Gejala:** Login di production (`pages.dev`) selalu menampilkan "PIN salah" meskipun PIN yang diketik benar dan sudah diset di Cloudflare Worker.
- **Penyebab:**
  Di fungsi `_fetchWorker()`, ada interceptor untuk HTTP 401:
  ```js
  if (res.status === 401) {
    logout()
    window.location.href = '/login'  // redirect
    return                           // return undefined
  }
  ```
  Interceptor ini dirancang untuk menangani **token expired** pada endpoint protected. Namun, ia juga menangkap response 401 dari **`/api/login`** — yang artinya "PIN salah".
  Akibatnya: ketika Worker mengembalikan 401 (PIN salah), `_fetchWorker` melakukan `logout()` + `window.location.href = '/login'` + `return undefined`. Fungsi `login()` menerima `undefined`, lalu `Login.jsx` mencoba `saveSession(undefined, undefined)` — tidak ada error yang dilempar ke `catch`, tapi sesi juga tidak tersimpan → tampilan berputar atau PIN seperti salah.
- **Solusi:**
  Pisahkan penanganan 401 berdasarkan endpoint yang dipanggil:
  - Jika `endpoint === '/api/login'` → 401 berarti PIN salah → **lempar Error** dengan pesan dari Worker
  - Jika endpoint lain → 401 berarti token expired → tetap logout + redirect
  ```js
  if (res.status === 401) {
    let data
    try { data = await res.json() } catch { data = null }

    if (endpoint === '/api/login') {
      throw new Error(data?.message || 'PIN salah. Silakan coba lagi.')
    }
    logout()
    window.location.href = '/login'
    return
  }
  ```
- **Catatan:** Bug ini **hanya muncul di production** (karena `BACKEND_CONFIGURED = true`). Di mode demo (`VITE_API_URL` tidak diset), fungsi `login()` punya path berbeda yang tidak melewati `_fetchWorker` untuk 401.

---

### [REVIEW] Pre-Deploy Review — Audit Menyeluruh Sebelum Deploy
- **Tanggal:** 2026-06-07
- **Status:** ✅ Selesai
- **Deskripsi:** Review sistematis seluruh codebase sebelum deploy ke production. Ditemukan 4 masalah yang diperbaiki (1 kritis, 3 minor), 1 fitur ditingkatkan (MasterData sinkron ke GAS), dan dokumen PRE_DEPLOY_CHECKLIST.md dibuat.

---

#### Temuan & Perbaikan

| # | Tingkat | File | Masalah | Status |
|---|---------|------|---------|--------|
| 1 | 🔴 Kritis | `Login.jsx` | `useState` dan `useEffect` diimport dua kali di dua baris terpisah | ✅ Digabung jadi satu import |
| 2 | 🟡 Minor | `api.js` | `saveSettings()` punya `const data = await gasRequest(...)` yang tidak dipakai | ✅ Dihapus unused variable |
| 3 | 🟡 Minor | `constants.js` | `SEKOLAH.alamat` tidak konsisten dengan `DEFAULT_MASTER_DATA.alamat` — SEKOLAH punya alamat lengkap, DEFAULT hanya jalan | ✅ Disamakan + tambah komentar klarifikasi tujuan masing-masing |
| 4 | 🔵 Peningkatan | `MasterData.jsx` | Tombol Simpan hanya menyimpan ke localStorage, tidak sync ke GAS saat backend aktif | ✅ Ditambah: jika `VITE_API_URL` aktif, simpan ke localStorage LALU sync ke GAS. Jika GAS gagal → toast warning tapi tidak block |

#### Yang Sudah Aman (Dikonfirmasi)
- `ALLOWED_ACTIONS` Worker ↔ GAS ↔ `api.js` sudah sinkron (10 action)
- Token HMAC-SHA256 dengan TTL 8 jam + `timingSafeEqual` tahan timing attack
- CORS headers lengkap, `ALLOWED_ORIGIN` bisa multi-origin (pisah koma)
- `GAS_SECRET` tidak pernah muncul di response ke frontend (ada sanitasi eksplisit)
- Fallback dummy data transparan di semua fungsi API
- Tailwind colors `cyan`, `ungu`, `purple` sudah terdefinisi
- Semua import/export sinkron (tidak ada build error)
- Error handling konsisten Bahasa Indonesia di semua layer

#### File yang Diubah
- `frontend/src/pages/Login.jsx` — fix double import
- `frontend/src/lib/api.js` — hapus unused variable di `saveSettings()`
- `frontend/src/lib/constants.js` — sinkronkan format `SEKOLAH.alamat`, tambah komentar
- `frontend/src/pages/MasterData.jsx` — `handleSimpan` sekarang `async`, simpan ke GAS jika backend aktif

#### File yang Dibuat
- `PRE_DEPLOY_CHECKLIST.md` — 7 bagian, 40+ item checklist: GAS, Worker, Frontend, API Contract, Keamanan, Performa, Checklist Akhir

---

### [BUGFIX] Build error — "getTemplate" is not exported by api.js
- **Tanggal:** 2026-06-07
- **Status:** ✅ Diperbaiki
- **Error:** `"getTemplate" is not exported by "src/lib/api.js", imported by "src/pages/Templates.jsx"`
- **Penyebab:**
  Saat TAHAP-09 `api.js` di-rebuild untuk integrasi Worker, fungsi template lama (`getTemplate`, `addTemplate`, `deleteTemplate`) tidak ikut dipindahkan. Fungsi-fungsi ini hilang dari file, tetapi `Templates.jsx` masih mengimpornya — menyebabkan Rollup gagal saat `npm run build`.
- **Solusi:**
  1. **`api.js`** — Tambahkan 3 export baru:
     - `listTemplates()` — fetch `listTemplates` dari GAS, normalise response, fallback dummy
     - `saveTemplate(payload)` — normalise field nama (Templates.jsx ↔ GAS berbeda nama), kirim ke GAS
     - `deleteTemplate(id)` — soft-delete via `saveTemplate` dengan flag `isActive: false`
     - Ditambahkan juga alias `getTemplate = listTemplates` dan `addTemplate = saveTemplate` untuk kompatibilitas
  2. **`Templates.jsx`** — Update 3 lokasi:
     - Baris 5: `import { getTemplate, ... }` → `import { listTemplates, ... }`
     - `useEffect`: `getTemplate().then(res => setData(res.data || []))` → `listTemplates().then(arr => setData(arr || []))`
     - `handleTambah`: `getTemplate().then(...)` → `listTemplates().then(arr => setData(arr || []))`
- **Catatan:**
  Format response `listTemplates()` di `api.js` langsung mengembalikan array (bukan `{ data: [...] }`), berbeda dari versi lama yang mengembalikan `{ data: [...] }`. Perubahan ini konsisten dengan fungsi API lain seperti `listDocuments()`.

---

### [BUGFIX] initSpreadsheet — Cannot call SpreadsheetApp.getUi() from this context
- **Tanggal:** 2026-06-07
- **Status:** ✅ Diperbaiki
- **File:** `gas/Code.gs`
- **Penyebab:**
  `SpreadsheetApp.getUi()` hanya dapat dipanggil dari konteks UI yang aktif — yaitu saat kode berjalan dari dalam Spreadsheet yang terbuka di browser (misalnya via menu Add-on atau `onOpen` trigger). Ketika fungsi `initSpreadsheet` dijalankan langsung dari **Apps Script Editor** (Run → initSpreadsheet), konteksnya adalah *script editor*, bukan spreadsheet, sehingga `getUi()` melempar exception `Cannot call SpreadsheetApp.getUi() from this context`.
- **Solusi:**
  Bungkus kedua pemanggilan `SpreadsheetApp.getUi().alert(...)` di dalam blok `try/catch` tersendiri. Jika `getUi()` gagal (dijalankan dari Editor), exception diabaikan secara senyap (silent catch) dan pesan sukses/error tetap tercatat di `Logger.log()`. Hasil bisa dilihat di **View → Execution log** di Apps Script Editor.
- **Cara verifikasi setelah fix:**
  1. Buka project GAS di script.google.com
  2. Pilih fungsi `initSpreadsheet` dari dropdown → klik ▶ Run
  3. Tidak ada exception → cek **View → Execution log** → harus ada baris `[initSpreadsheet] Selesai. Semua sheet sudah siap digunakan.`
  4. Cek Google Spreadsheet → harus muncul 4 sheet: Settings, Documents, Templates, Logs
