# SDENTIBAYA AdminKit — Cloudflare Worker

> API proxy antara React frontend dan Google Apps Script.  
> Frontend **tidak pernah** berkomunikasi langsung ke GAS.

---

## Arsitektur

```
React Frontend (Cloudflare Pages)
        │
        │  HTTPS — hanya ke Worker URL
        ▼
Cloudflare Worker  ◄── index.js
        │
        │  HTTPS + GAS_SECRET (disembunyikan di env)
        ▼
Google Apps Script (Web App)
        │
        ├──► Google Sheets  (data)
        ├──► Google Docs    (generate dokumen)
        └──► Google Drive   (simpan & ekspor PDF)
```

---

## Endpoint API

### `GET /api/health`
Cek status Worker. **Tidak butuh autentikasi.**

**Response:**
```json
{
  "success": true,
  "message": "Worker aktif.",
  "data": {
    "service": "SDENTIBAYA AdminKit Worker",
    "version": "1.0.0",
    "timestamp": "2026-06-07T10:00:00.000Z",
    "gasConfigured": true,
    "pinConfigured": true
  }
}
```

---

### `POST /api/login`
Validasi PIN admin, kembalikan session token.

**Request:**
```json
{ "pin": "123456" }
```

**Response sukses (200):**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "<hmac-token>",
    "expiresIn": 28800,
    "user": { "name": "Administrator", "role": "admin" }
  }
}
```

**Response gagal (401):**
```json
{ "success": false, "message": "PIN salah. Silakan coba lagi.", "data": null }
```

---

### `POST /api/gas`
Proxy request ke Google Apps Script. **Butuh token di header.**

**Header:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "action": "buatDokumen",
  "payload": {
    "jenis": "undangan_rapat",
    "nomorSurat": "001/UN/VI/2026",
    "perihal": "Rapat Koordinasi"
  }
}
```

**Action yang tersedia:**

| Action | Fungsi |
|--------|--------|
| `ping` | Health check GAS |
| `getDashboardStats` | Statistik untuk dashboard |
| `buatDokumen` | Generate Google Docs dari template |
| `getArsipDokumen` | Daftar arsip dari Sheets |
| `hapusDokumen` | Hapus baris Sheets + file Drive |
| `getMasterData` | Ambil data master sekolah |
| `saveMasterData` | Simpan data master ke Sheets |
| `getTemplate` | Daftar template dari Sheets |
| `addTemplate` | Tambah template baru |
| `deleteTemplate` | Hapus template |

---

## Skema Response Konsisten

Semua endpoint menggunakan format yang sama:

```json
{
  "success"  : true | false,
  "message"  : "Pesan yang bisa ditampilkan ke pengguna.",
  "data"     : { } | null,
  "meta"     : { "timestamp": "ISO string" }
}
```

---

## Setup & Deploy

### Prasyarat

- Node.js ≥ 18
- Akun Cloudflare (gratis)
- Wrangler CLI: `npm install -g wrangler`
- Google Apps Script sudah di-deploy sebagai Web App (lihat `gas/README.md`)

---

### Langkah 1 — Clone & Masuk ke folder Worker

```bash
git clone https://github.com/belahoq/AINorax.git
cd AINorax/worker
```

---

### Langkah 2 — Login ke Cloudflare via Wrangler

```bash
wrangler login
```

Browser akan terbuka. Izinkan akses Wrangler ke akun Cloudflare Anda.

---

### Langkah 3 — Salin dan edit konfigurasi

```bash
cp wrangler.toml.example wrangler.toml
```

Edit `wrangler.toml`:
- Ganti `<CLOUDFLARE_ACCOUNT_ID>` dengan Account ID Anda
  (temukan di: **Cloudflare Dashboard → kanan atas**)
- Isi `GAS_URL` setelah GAS di-deploy
- Isi `ALLOWED_ORIGIN` dengan URL frontend Anda

---

### Langkah 4 — Set secret (nilai sensitif)

```bash
# Secret ini TIDAK ditulis ke file apapun — hanya disimpan terenkripsi di Cloudflare

# Token rahasia bersama Worker ↔ GAS (buat string acak panjang)
wrangler secret put GAS_SECRET

# PIN login admin
wrangler secret put ADMIN_PIN
```

Atau via **Cloudflare Dashboard**:
`Workers & Pages → nama-worker → Settings → Variables and Secrets`

---

### Langkah 5 — Test di lokal

```bash
wrangler dev
```

Worker berjalan di `http://localhost:8787`. Test dengan:

```bash
# Health check
curl http://localhost:8787/api/health

# Login
curl -X POST http://localhost:8787/api/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"<PIN_ANDA>"}'

# Gas proxy (ganti <TOKEN> dengan token dari login)
curl -X POST http://localhost:8787/api/gas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"action":"ping","payload":{}}'
```

---

### Langkah 6 — Deploy ke production

```bash
# Deploy ke environment production
wrangler deploy --env production
```

Catat URL Worker yang muncul, contoh:
`https://sdentibaya-adminkit-worker.nama-akun.workers.dev`

---

### Langkah 7 — Hubungkan ke frontend

Set environment variable di **Cloudflare Pages**:

```
VITE_API_URL = https://sdentibaya-adminkit-worker.nama-akun.workers.dev
```

Path: `Pages → nama-project → Settings → Environment variables`

Lalu trigger rebuild frontend (atau push commit baru).

---

## Variabel Environment Lengkap

| Variabel | Tipe | Wajib | Keterangan |
|----------|------|-------|------------|
| `GAS_URL` | `[vars]` di toml | ✅ | URL deployment Google Apps Script |
| `GAS_SECRET` | `secret` | ✅ | Token rahasia Worker ↔ GAS |
| `ADMIN_PIN` | `secret` | ✅ | PIN login admin |
| `ALLOWED_ORIGIN` | `[vars]` di toml | ✅ | Origin frontend (URL Cloudflare Pages) |

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **GAS_URL tidak terekspos** | Disimpan di env Worker, tidak pernah dikirim ke frontend |
| **GAS_SECRET tidak terekspos** | Hanya ditambahkan Worker sebelum forward ke GAS |
| **Token timing-safe** | Perbandingan PIN menggunakan HMAC compare (bukan `===`) |
| **Token HMAC-SHA256** | Token session berbasis HMAC — tidak bisa dipalsukan tanpa ADMIN_PIN |
| **Token expires** | Token kadaluarsa otomatis setelah 8 jam |
| **CORS strict** | Hanya origin di `ALLOWED_ORIGIN` yang diizinkan |
| **Payload limit** | Body request dibatasi 512 KB |
| **Action whitelist** | Hanya action yang terdaftar bisa diteruskan ke GAS |
| **Secret sanitasi** | Field `secret`/`gasSecret` dihapus dari response GAS sebelum dikirim ke frontend |

---

## Struktur File

```
worker/
├── index.js               # Entry point Worker — semua logika ada di sini
├── wrangler.toml          # Konfigurasi aktif (JANGAN commit ke git)
├── wrangler.toml.example  # Template konfigurasi (aman di-commit)
└── README.md              # Dokumentasi ini
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `GAS_URL atau GAS_SECRET belum dikonfigurasi` | Jalankan `wrangler secret put` untuk kedua secret |
| `PIN salah` | Pastikan `ADMIN_PIN` yang di-set sama dengan yang diketik |
| `Token tidak valid` | Token expired (>8 jam) — login ulang |
| `Tidak dapat menghubungi GAS` | Cek `GAS_URL` sudah benar dan GAS sudah di-deploy sebagai Web App |
| `CORS error di browser` | Pastikan `ALLOWED_ORIGIN` sama persis dengan URL frontend (termasuk `https://`) |
| `Action tidak dikenali` | Pastikan nama action ada di whitelist `ALLOWED_ACTIONS` di `index.js` |
