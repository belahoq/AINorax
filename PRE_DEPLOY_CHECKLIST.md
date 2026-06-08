# PRE_DEPLOY_CHECKLIST.md
# SDENTIBAYA AdminKit — Checklist Sebelum Deploy ke Production

> Jalankan checklist ini dari atas ke bawah setiap kali akan deploy ke production.
> Tandai ✅ jika sudah dikonfirmasi, ❌ jika ada masalah (perlu diperbaiki dulu).

---

## BAGIAN 1 — GOOGLE APPS SCRIPT

### 1.1 Script Properties
- [ ] `GAS_SECRET` sudah diset (minimal 32 karakter, string acak)
- [ ] `SPREADSHEET_ID` sudah diset dan Spreadsheet bisa diakses
- [ ] `DRIVE_FOLDER_ID` sudah diset dan folder Drive bisa diakses
- [ ] `DEFAULT_TEMPLATE_DOC_ID` diset jika pakai template default (opsional)

### 1.2 Inisialisasi Database
- [ ] Fungsi `initSpreadsheet` sudah dijalankan dari Apps Script Editor
- [ ] Sheet **Settings** ada dan terisi data default sekolah
- [ ] Sheet **Documents** ada (boleh kosong)
- [ ] Sheet **Templates** ada (boleh kosong)
- [ ] Sheet **Logs** ada (boleh kosong)

### 1.3 Deployment GAS
- [ ] GAS sudah di-deploy sebagai **Web App**
- [ ] **Execute as**: Me
- [ ] **Who has access**: Anyone
- [ ] URL deployment sudah disalin (format: `https://script.google.com/macros/s/.../exec`)
- [ ] Test manual: buka URL deployment → harus return JSON `{"error": ...}` atau sejenisnya

### 1.4 Verifikasi GAS (via curl atau Postman)
```bash
curl -X POST "GAS_URL" \
  -H "Content-Type: application/json" \
  -d '{"secret":"GAS_SECRET","action":"ping","payload":{}}'
# Expected: {"success":true,"data":{"spreadsheetOk":true,"driveFolderOk":true}}
```
- [ ] Response `success: true`
- [ ] `spreadsheetOk: true`
- [ ] `driveFolderOk: true`
- [ ] `secretConfigured: true`

---

## BAGIAN 2 — CLOUDFLARE WORKER

### 2.1 Environment Variables / Secrets
- [ ] `GAS_SECRET` diset via `wrangler secret put GAS_SECRET`
  - ⚠️ **Nilai harus SAMA PERSIS** dengan yang di GAS Script Properties
- [ ] `ADMIN_PIN` diset via `wrangler secret put ADMIN_PIN`
  - Gunakan PIN yang mudah diingat tapi tidak mudah ditebak (min 6 karakter)
- [ ] `GAS_URL` diset di `[vars]` atau Dashboard (URL deployment GAS)
- [ ] `ALLOWED_ORIGIN` diset ke URL Cloudflare Pages production
  - Format: `https://sdentibaya-adminkit.pages.dev`
  - ⚠️ **JANGAN** biarkan `ALLOWED_ORIGIN` kosong di production (akan fallback ke `*`)

### 2.2 wrangler.toml
- [ ] `account_id` sudah diisi dengan Account ID Cloudflare yang benar
- [ ] `name` worker sesuai (`sdentibaya-adminkit-worker`)
- [ ] `[env.production]` sudah dikonfigurasi dengan `ALLOWED_ORIGIN` yang benar
- [ ] File `wrangler.toml` **tidak di-commit ke git** (ada di `.gitignore`)

### 2.3 Deploy dan Test Worker
```bash
# Deploy
cd worker && wrangler deploy --env production

# Test health check
curl "https://WORKER_URL/api/health"
# Expected: {"success":true,"data":{"gasConfigured":true,"pinConfigured":true}}
```
- [ ] Deploy berhasil tanpa error
- [ ] `/api/health` return `gasConfigured: true`
- [ ] `/api/health` return `pinConfigured: true`

### 2.4 Test Login via Worker
```bash
curl -X POST "https://WORKER_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"pin":"PIN_ANDA"}'
# Expected: {"success":true,"data":{"token":"...","user":{"name":"Administrator"}}}
```
- [ ] Login dengan PIN yang benar → return token
- [ ] Login dengan PIN salah → return 401
- [ ] Response **tidak mengandung** `GAS_URL`, `GAS_SECRET`, atau `ADMIN_PIN`

### 2.5 Test Proxy ke GAS
```bash
# Ganti TOKEN dengan token dari langkah 2.4
curl -X POST "https://WORKER_URL/api/gas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"action":"ping","payload":{}}'
# Expected: {"success":true,"data":{"spreadsheetOk":true,...}}
```
- [ ] Action `ping` berhasil forward ke GAS
- [ ] Request tanpa token → return 401
- [ ] Action tidak dikenal → return 400

### 2.6 Keamanan Worker
- [ ] Buka halaman worker di browser (non-POST): harus return 404
- [ ] Cek Network Tab browser: tidak ada `GAS_URL` atau `GAS_SECRET` di response apapun
- [ ] CORS hanya mengizinkan origin dari `ALLOWED_ORIGIN` (tidak ada `*` di production)

---

## BAGIAN 3 — FRONTEND REACT

### 3.1 Environment Variable
- [ ] `VITE_API_URL` sudah diset di **Cloudflare Pages → Settings → Environment variables**
  - Nilai: `https://NAMA_WORKER.AKUN.workers.dev`
  - ⚠️ Setelah set env var, **wajib trigger rebuild** (push commit atau retry deployment)
- [ ] Build lokal berhasil: `cd frontend && npm run build` → tidak ada error

### 3.2 Build Production
```bash
cd frontend
npm install          # pastikan tidak ada error
npm run build        # harus selesai tanpa error merah
```
- [ ] `npm install` selesai tanpa error
- [ ] `npm run build` selesai — folder `dist/` terbuat
- [ ] Tidak ada error `is not exported by` atau `module not found`

### 3.3 Cloudflare Pages Config
- [ ] **Framework preset**: Vite
- [ ] **Build command**: `npm run build`
- [ ] **Build output directory**: `dist`
- [ ] **Root directory**: `frontend`
- [ ] **Node.js version**: 18 atau lebih baru (set di Environment → NODE_VERSION = 18)

### 3.4 Fungsional Frontend (test di staging/lokal dulu)
- [ ] Halaman login tampil dengan benar
- [ ] Login dengan PIN yang benar → masuk ke Dashboard
- [ ] Login dengan PIN salah → tampil pesan error merah
- [ ] Semua menu sidebar bisa diklik dan navigasi ke halaman yang benar
- [ ] Dashboard menampilkan data (live atau dummy)
- [ ] Buat Dokumen: pilih jenis → isi form → preview → generate berhasil
- [ ] Arsip: tabel/card tampil, filter, search berfungsi
- [ ] Master Data: form tersimpan ke localStorage dan GAS
- [ ] Pengaturan → Test Koneksi: Worker ● Terhubung, GAS ● Terhubung
- [ ] Logout berfungsi, token terhapus dari localStorage

### 3.5 Keamanan Frontend
- [ ] Buka DevTools → Network Tab → tidak ada request langsung ke `script.google.com`
- [ ] Semua request ke `/api/*` menuju Worker URL, bukan GAS
- [ ] Buka DevTools → Application → localStorage: hanya ada `sdentibaya_token` dan `sdentibaya_user`
  - ⚠️ Token adalah HMAC yang tidak mengandung PIN atau secret
- [ ] Halaman protected (`/dashboard`, dll.) tidak bisa diakses tanpa login

---

## BAGIAN 4 — SINKRONISASI & API CONTRACT

### 4.1 Nama Action GAS ↔ Worker ↔ Frontend
Konfirmasi semua action berikut berfungsi end-to-end:

| Action | Frontend (api.js) | Worker (ALLOWED_ACTIONS) | GAS (routeAction) |
|--------|-------------------|--------------------------|-------------------|
| `ping` | ✅ `gasRequest('ping')` | ✅ Ada | ✅ Ada |
| `getDashboardStats` | ✅ | ✅ Ada | ✅ Ada |
| `createDocument` | ✅ | ✅ Ada | ✅ Ada |
| `listDocuments` | ✅ | ✅ Ada | ✅ Ada |
| `getDocument` | ✅ | ✅ Ada | ✅ Ada |
| `getSettings` | ✅ | ✅ Ada | ✅ Ada |
| `saveSettings` | ✅ | ✅ Ada | ✅ Ada |
| `listTemplates` | ✅ | ✅ Ada | ✅ Ada |
| `saveTemplate` | ✅ | ✅ Ada | ✅ Ada |
| `createLog` | ✅ | ✅ Ada | ✅ Ada |
| `loginUser` | ✅ via `/api/login` | ✅ Ada | ✅ Ada |
| `addUser` | ✅ via `/api/users` | ✅ Ada | ✅ Ada |
| `listUsers` | ✅ via `/api/users` | ✅ Ada | ✅ Ada |
| `deleteUser` | ✅ via `/api/users/:id` | ✅ Ada | ✅ Ada |
| `updateUserProfile` | ✅ via `/api/users/profile` | ✅ Ada | ✅ Ada |

- [ ] Semua action di atas terdaftar di `ALLOWED_ACTIONS` Worker
- [ ] Semua action di atas terdaftar di `routeAction` GAS
- [ ] Sheet **Users** sudah dibuat (jalankan `initSpreadsheet` ulang setelah update Code.gs)

### 4.2 Format Response
Konfirmasi format response konsisten di semua layer:
```json
{ "success": true/false, "message": "...", "data": {...}, "meta": {"timestamp": "..."} }
```
- [ ] Worker mengembalikan format di atas untuk semua endpoint
- [ ] GAS mengembalikan format di atas untuk semua action
- [ ] Frontend membaca `res.data` untuk data, `res.message` untuk pesan

### 4.3 Data Sekolah Konsisten
- [ ] `SEKOLAH` di `constants.js` → hanya untuk tampilan UI (Dashboard banner, Login)
- [ ] `DEFAULT_MASTER_DATA` di `constants.js` → nilai default form Master Data
- [ ] Sheet Settings di GAS → sumber kebenaran untuk dokumen yang dihasilkan
- [ ] Setelah setup, buka Master Data → pastikan data benar → klik Simpan

---

## BAGIAN 5 — KEAMANAN

### 5.1 Secret Management
- [ ] `GAS_SECRET` hanya ada di: (a) Cloudflare Worker secrets, (b) GAS Script Properties
- [ ] `ADMIN_PIN` hanya ada di: Cloudflare Worker secrets
- [ ] `GAS_URL` hanya ada di: Cloudflare Worker vars (tidak di frontend)
- [ ] Tidak ada secret yang di-hardcode di kode (`index.js`, `Code.gs`, `api.js`, dll.)
- [ ] File `wrangler.toml` tidak di-commit (ada di `.gitignore` worker/)

### 5.2 CORS
- [ ] `ALLOWED_ORIGIN` di Worker = URL Pages production (misal `https://sdentibaya-adminkit.pages.dev`)
- [ ] Test: request dari origin lain → harus ditolak CORS
- [ ] **TIDAK** ada `*` di `ALLOWED_ORIGIN` production

### 5.3 Token Session
- [ ] Token HMAC-SHA256 (bukan plain text)
- [ ] Token TTL 8 jam — setelah expired, otomatis 401 → redirect login
- [ ] Token tidak mengandung informasi sensitif (hanya timestamp + HMAC)
- [ ] Logout menghapus token dari localStorage

### 5.4 Rate Limiting & Brute Force
- [ ] Login gagal → delay 300ms di Worker (anti brute-force)
- [ ] PIN max length 32 karakter (mencegah payload besar)
- [ ] Body request max 512 KB di Worker

---

## BAGIAN 6 — PERFORMA & UX

### 6.1 Loading State
- [ ] Dashboard menampilkan loading spinner saat mengambil data
- [ ] Arsip menampilkan loading saat fetch (tabel desktop + card mobile)
- [ ] Buat Dokumen: tombol disabled + spinner saat generate

### 6.2 Fallback
- [ ] Jika `VITE_API_URL` tidak diset → aplikasi berjalan dalam mode Demo
- [ ] Jika Worker error → fallback ke dummy data tanpa crash
- [ ] Semua pesan error dalam Bahasa Indonesia dan ramah untuk operator

### 6.3 Responsivitas
- [ ] Sidebar bisa dibuka/tutup di mobile (hamburger menu)
- [ ] Arsip: tabel di desktop, card list di mobile
- [ ] Form Buat Dokumen: scrollable di layar kecil

---

## BAGIAN 7 — CHECKLIST AKHIR SEBELUM DEPLOY

Centang semua item ini tepat sebelum klik "Deploy":

- [ ] `npm run build` berhasil tanpa error
- [ ] `GAS_SECRET` di Worker = `GAS_SECRET` di GAS Script Properties (**sama persis**)
- [ ] `ADMIN_PIN` sudah diset di Worker
- [ ] `GAS_URL` sudah diisi URL deployment GAS
- [ ] `ALLOWED_ORIGIN` sudah diisi URL Pages production
- [ ] `VITE_API_URL` sudah diisi URL Worker di Cloudflare Pages env vars
- [ ] Test koneksi end-to-end dari aplikasi (Pengaturan → Test Koneksi)
- [ ] Login berhasil dengan PIN production
- [ ] Satu dokumen berhasil digenerate dan PDF tersedia
- [ ] Dokumen muncul di Sheet Documents Spreadsheet

---

## Ringkasan Status Komponen

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Frontend React | ✅ Siap | Build berhasil, fallback aman |
| Cloudflare Worker | ✅ Siap | CORS, token, whitelist action sinkron |
| Google Apps Script | ✅ Siap | Semua action terdaftar, initSpreadsheet dijalankan |
| API Contract | ✅ Sinkron | Action names, response format konsisten |
| Keamanan | ✅ Aman | Secret tidak bocor, HMAC token, timing-safe |
| Error Handling | ✅ Baik | Semua error Bahasa Indonesia, fallback transparan |

---

## Hal yang Belum Diimplementasi (Backlog)

> Item berikut **tidak menghalangi** deploy MVP, tapi perlu dikerjakan setelah deploy:

- [ ] Hapus dokumen dari Google Drive (saat ini hanya hapus dari state lokal/Sheets)
- [ ] Nomor surat otomatis (auto-increment per jenis)
- [ ] SPMB — Penerimaan Peserta Didik Baru
- [ ] Absensi QR
- [ ] Inventaris
- [ ] Multi-user dengan peran berbeda
- [ ] Audit log yang lebih detail
- [ ] Pagination arsip untuk data banyak (>100 dokumen)

---

*Versi: 1.1 — dibuat 2026-06-07 (review pre-deploy)*
*Proyek: SDENTIBAYA AdminKit — SD Negeri 3 Pringgabaya*
