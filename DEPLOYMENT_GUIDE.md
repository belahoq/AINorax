# DEPLOYMENT_GUIDE.md
# SDENTIBAYA AdminKit — Panduan Deployment Lengkap

> Panduan ini mencakup seluruh proses dari nol hingga aplikasi berjalan di production.
> Estimasi waktu: 45–90 menit untuk deployment pertama.

---

## Gambaran Arsitektur

```
Browser Admin
    │
    │  HTTPS
    ▼
Cloudflare Pages         ← Frontend React (build statis)
    │
    │  HTTPS + Bearer Token
    ▼
Cloudflare Worker        ← API Proxy (index.js)
    │
    │  HTTPS + GAS_SECRET
    ▼
Google Apps Script       ← Backend (Code.gs, Web App)
    │
    ├──► Google Sheets   ← Database
    ├──► Google Docs     ← Generate dokumen
    └──► Google Drive    ← Simpan PDF
```

---

## Prasyarat

Pastikan semua ini tersedia sebelum mulai:

- [ ] Akun **Google** (untuk GAS, Sheets, Drive)
- [ ] Akun **Cloudflare** (gratis) — https://dash.cloudflare.com
- [ ] **Node.js ≥ 18** terinstall di komputer — `node -v`
- [ ] **npm** atau **yarn** tersedia
- [ ] **Wrangler CLI** terinstall: `npm install -g wrangler`
- [ ] Kode sudah di-clone dari GitHub

---

## BAGIAN 1 — Google Apps Script (Backend)

### Langkah 1.1 — Buat Google Spreadsheet

1. Buka [sheets.google.com](https://sheets.google.com)
2. Klik **"+ Blank"** untuk buat spreadsheet baru
3. Beri nama: **`SDENTIBAYA AdminKit DB`**
4. Salin **Spreadsheet ID** dari URL browser:
   ```
   https://docs.google.com/spreadsheets/d/[SALIN-INI]/edit
   ```
5. Simpan ID ini — dibutuhkan di Langkah 1.4

### Langkah 1.2 — Buat Folder Google Drive

1. Buka [drive.google.com](https://drive.google.com)
2. Klik **"+ New" → "Folder"**
3. Nama folder: **`SDENTIBAYA Dokumen`**
4. Buka folder tersebut
5. Salin **Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/[SALIN-INI]
   ```
6. Simpan ID ini — dibutuhkan di Langkah 1.4

### Langkah 1.3 — Buat Google Apps Script Project

1. Buka [script.google.com](https://script.google.com)
2. Klik **"New project"**
3. Beri nama project: **`SDENTIBAYA AdminKit GAS`**
4. Hapus semua kode default di editor
5. Buka file `gas/Code.gs` dari repo ini
6. Salin seluruh isinya ke editor Apps Script
7. Klik **Save** (Ctrl+S / Cmd+S)

### Langkah 1.4 — Set Script Properties

1. Di Apps Script Editor, klik ikon **⚙️ (Project Settings)** di menu kiri
2. Scroll ke bawah → **"Script Properties"**
3. Klik **"Add script property"** untuk setiap properti berikut:

| Property | Nilai |
|----------|-------|
| `GAS_SECRET` | String acak minimal 32 karakter (contoh: `sdentibaya-2026-K9mP3qRxZ7wL4vNp`) |
| `SPREADSHEET_ID` | ID dari Langkah 1.1 |
| `DRIVE_FOLDER_ID` | ID dari Langkah 1.2 |
| `DEFAULT_TEMPLATE_DOC_ID` | *(opsional)* ID template Google Docs default |

> ⚠️ **Catat nilai `GAS_SECRET`** — harus identik dengan di Cloudflare Worker nanti!

4. Klik **"Save script properties"**

### Langkah 1.5 — Inisialisasi Spreadsheet

1. Di toolbar Apps Script Editor, pilih fungsi **`initSpreadsheet`** dari dropdown (di samping tombol ▶)
2. Klik **▶ Run**
3. Saat diminta izin → klik **"Review Permissions"**
4. Pilih akun Google Anda → klik **"Allow"**
5. Tunggu hingga muncul dialog: *"Inisialisasi berhasil! Semua sheet sudah siap digunakan."*

> Cek Spreadsheet — harus sudah ada 4 sheet: **Settings**, **Documents**, **Templates**, **Logs**

### Langkah 1.6 — Deploy GAS sebagai Web App

1. Di Apps Script Editor: **Deploy** (pojok kanan atas) → **"New deployment"**
2. Klik ikon **⚙️** di samping "Select type" → pilih **"Web app"**
3. Isi konfigurasi:
   - **Description**: `SDENTIBAYA AdminKit v1.0`
   - **Execute as**: `Me (nama@gmail.com)`
   - **Who has access**: `Anyone`
4. Klik **"Deploy"**
5. Klik **"Authorize access"** jika diminta
6. **Salin Web App URL** yang muncul:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
   > ⚠️ Simpan URL ini — dibutuhkan di Langkah 2.3 sebagai `GAS_URL`

---

## BAGIAN 2 — Cloudflare Worker (API Proxy)

### Langkah 2.1 — Login ke Cloudflare via Wrangler

```bash
# Di terminal komputer Anda
wrangler login
```

Browser akan terbuka → login ke Cloudflare → klik **"Allow"**.

### Langkah 2.2 — Salin dan Edit Konfigurasi Wrangler

```bash
cd worker
cp wrangler.toml.example wrangler.toml
```

Edit file `wrangler.toml` yang baru dibuat:

1. Ganti `<CLOUDFLARE_ACCOUNT_ID>` dengan Account ID Anda
   - Temukan di: **Cloudflare Dashboard → (kanan atas) Account ID**
2. Isi `ALLOWED_ORIGIN` dengan URL frontend (nanti diisi setelah deploy Pages)
   - Untuk sementara: `http://localhost:5173`

### Langkah 2.3 — Set Secret (Nilai Sensitif)

```bash
# Di folder worker/ — jalankan satu per satu

# Token rahasia Worker ↔ GAS (HARUS sama dengan GAS_SECRET di Script Properties!)
wrangler secret put GAS_SECRET
# → Ketik nilai GAS_SECRET Anda → Enter

# PIN login admin
wrangler secret put ADMIN_PIN
# → Ketik PIN yang diinginkan (contoh: 081234) → Enter
```

### Langkah 2.4 — Set GAS_URL di wrangler.toml

Buka `worker/wrangler.toml` dan isi `GAS_URL`:
```toml
[vars]
  GAS_URL = "https://script.google.com/macros/s/AKfycbx.../exec"
  ALLOWED_ORIGIN = "http://localhost:5173"
```

### Langkah 2.5 — Test Worker Secara Lokal

```bash
cd worker
wrangler dev
```

Worker berjalan di `http://localhost:8787`. Test:

```bash
# Test 1 — Health check
curl http://localhost:8787/api/health

# Harus mengembalikan:
# { "success": true, "data": { "gasConfigured": true, "pinConfigured": true } }

# Test 2 — Login
curl -X POST http://localhost:8787/api/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"PIN_ANDA"}'

# Harus mengembalikan:
# { "success": true, "data": { "token": "...", "user": {...} } }
```

### Langkah 2.6 — Deploy Worker ke Production

```bash
# Deploy ke environment default
wrangler deploy

# Atau deploy ke production spesifik
wrangler deploy --env production
```

Catat URL Worker yang muncul:
```
https://sdentibaya-adminkit-worker.AKUN-ANDA.workers.dev
```

---

## BAGIAN 3 — Frontend React (Cloudflare Pages)

### Langkah 3.1 — Build Frontend Secara Lokal (Opsional, untuk test)

```bash
cd frontend

# Buat file env untuk production build
echo "VITE_API_URL=https://sdentibaya-adminkit-worker.AKUN-ANDA.workers.dev" > .env.production.local

# Build
npm run build

# Preview hasil build
npm run preview
# Buka http://localhost:4173
```

### Langkah 3.2 — Deploy ke Cloudflare Pages

**Cara A — Via Cloudflare Dashboard (Direkomendasikan)**

1. Buka **Cloudflare Dashboard → Workers & Pages → Create application → Pages**
2. Pilih **"Connect to Git"**
3. Hubungkan akun GitHub → pilih repo `belahoq/AINorax`
4. Isi konfigurasi build:

   | Field | Nilai |
   |-------|-------|
   | **Project name** | `sdentibaya-adminkit` |
   | **Production branch** | `main` |
   | **Framework preset** | `Vite` |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Root directory** | `frontend` |

5. Klik **"Save and Deploy"**
6. Tunggu build selesai
7. Catat URL Pages: `https://sdentibaya-adminkit.pages.dev`

**Cara B — Via Wrangler CLI**

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name sdentibaya-adminkit
```

### Langkah 3.3 — Set Environment Variable di Cloudflare Pages

1. **Cloudflare Dashboard → Workers & Pages → sdentibaya-adminkit**
2. Tab **"Settings" → "Environment variables"**
3. Klik **"Add variable"**:
   - **Variable name**: `VITE_API_URL`
   - **Value**: `https://sdentibaya-adminkit-worker.AKUN-ANDA.workers.dev`
4. Klik **"Save"**
5. **Trigger rebuild**: klik **"Deployments" → "Retry deployment"** atau push commit baru

### Langkah 3.4 — Update ALLOWED_ORIGIN di Worker

Setelah URL Pages diketahui, update konfigurasi Worker:

**Via wrangler.toml + redeploy:**
```toml
[env.production.vars]
  ALLOWED_ORIGIN = "https://sdentibaya-adminkit.pages.dev"
  GAS_URL = "https://script.google.com/macros/s/..."
```

**Atau via Cloudflare Dashboard:**
1. Workers & Pages → `sdentibaya-adminkit-worker` → Settings → Variables
2. Edit `ALLOWED_ORIGIN` → isi URL Pages
3. Save

```bash
# Redeploy Worker dengan konfigurasi baru
wrangler deploy --env production
```

---

## BAGIAN 4 — Verifikasi Akhir

### Checklist Verifikasi Production

```bash
WORKER_URL="https://sdentibaya-adminkit-worker.AKUN.workers.dev"
PAGES_URL="https://sdentibaya-adminkit.pages.dev"
```

**4.1 — Test Worker Health**
```bash
curl "$WORKER_URL/api/health"
# Expected: { "success": true, "data": { "gasConfigured": true, "pinConfigured": true } }
```

**4.2 — Test Login**
```bash
curl -X POST "$WORKER_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"pin":"PIN_ANDA"}'
# Expected: { "success": true, "data": { "token": "..." } }
```

**4.3 — Test Ping GAS**
```bash
# Ganti TOKEN dengan token dari langkah 4.2
curl -X POST "$WORKER_URL/api/gas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"action":"ping","payload":{}}'
# Expected: { "success": true, "data": { "spreadsheetOk": true, "driveFolderOk": true } }
```

**4.4 — Test Frontend**
1. Buka `$PAGES_URL` di browser
2. Pastikan halaman login tampil dengan benar
3. Login dengan PIN yang sudah diset
4. Buka Pengaturan → Test Koneksi → harus tampil **● Terhubung** untuk Worker dan GAS

---

## BAGIAN 5 — Cara Update Kode

### Update Frontend
```bash
git add .
git commit -m "update: deskripsi perubahan"
git push origin main
# Cloudflare Pages akan auto-deploy jika sudah terhubung ke GitHub
```

### Update Worker
```bash
cd worker
wrangler deploy --env production
```

### Update GAS
1. Edit `Code.gs` di Apps Script Editor
2. **Deploy → Manage Deployments**
3. Klik ✏️ pada deployment aktif
4. Pilih **"Version: New version"**
5. Klik **"Deploy"**

> ⚠️ **Penting:** Perubahan GAS HARUS di-deploy ulang. Edit kode saja tidak cukup.

---

## BAGIAN 6 — Environment Variables Lengkap

### Cloudflare Worker (set via `wrangler secret put` atau Dashboard)

| Variable | Tipe | Deskripsi |
|----------|------|-----------|
| `GAS_SECRET` | Secret | Token rahasia Worker ↔ GAS (minimal 32 karakter) |
| `ADMIN_PIN` | Secret | PIN login admin |
| `GAS_URL` | Var | URL Web App Google Apps Script |
| `ALLOWED_ORIGIN` | Var | URL frontend (Cloudflare Pages) |

### Cloudflare Pages (set via Dashboard → Settings → Env Vars)

| Variable | Nilai |
|----------|-------|
| `VITE_API_URL` | URL Cloudflare Worker |

### Google Apps Script (set via Project Settings → Script Properties)

| Property | Deskripsi |
|----------|-----------|
| `GAS_SECRET` | Sama persis dengan di Worker |
| `SPREADSHEET_ID` | ID Google Spreadsheet database |
| `DRIVE_FOLDER_ID` | ID folder Google Drive penyimpanan |
| `DEFAULT_TEMPLATE_DOC_ID` | *(opsional)* ID template Docs default |

---

## BAGIAN 7 — Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Login gagal terus | PIN salah atau Worker error | Cek `/api/health`, pastikan `pinConfigured: true` |
| `GAS_URL ... belum dikonfigurasi` | GAS_URL kosong di Worker | Set via wrangler secret atau Dashboard |
| `Akses ditolak. Secret token tidak valid` | GAS_SECRET tidak sinkron | Pastikan nilai identik di Worker dan GAS Script Properties |
| CORS error di browser | ALLOWED_ORIGIN salah | Sesuaikan dengan URL Pages yang aktual (termasuk `https://`) |
| `gasConfigured: false` | GAS_URL atau GAS_SECRET belum diset | Set kedua variabel di Worker |
| Sheet tidak ditemukan | initSpreadsheet belum dijalankan | Jalankan fungsi `initSpreadsheet()` dari GAS Editor |
| PDF gagal dibuat | Drive folder tidak bisa diakses | Pastikan `DRIVE_FOLDER_ID` benar dan akun punya akses |
| Token expired setelah 8 jam | Normal | Login ulang |
| Build Pages gagal | Konfigurasi salah | Pastikan **Root directory** = `frontend` dan **Build output** = `dist` |
| `Exception: Authorization is required` | GAS perlu re-authorize | Re-deploy GAS sebagai New Version |

---

## Ringkasan URL Production

Setelah semua deployment selesai, catat URL-URL ini:

| Layanan | URL |
|---------|-----|
| Frontend | `https://sdentibaya-adminkit.pages.dev` |
| Worker | `https://sdentibaya-adminkit-worker.AKUN.workers.dev` |
| Worker Health | `https://sdentibaya-adminkit-worker.AKUN.workers.dev/api/health` |
| GAS Web App | `https://script.google.com/macros/s/.../exec` |
| Spreadsheet | `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit` |

---

*Versi panduan: 1.0 — dibuat 2026-06-07*
*Proyek: SDENTIBAYA AdminKit — SD Negeri 3 Pringgabaya*
