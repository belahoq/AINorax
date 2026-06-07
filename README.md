# SDENTIBAYA AdminKit

> **Sistem Administrasi Digital SD Negeri 3 Pringgabaya**  
> Berbasis Cloudflare × Google Apps Script — otomatis, aman, dan mudah digunakan.

**SDENTIBAYA MELAJU** 🏫

---

## Tentang Aplikasi

SDENTIBAYA AdminKit adalah webapp administrasi sekolah yang memungkinkan staf TU dan kepala sekolah untuk:

- 📄 **Membuat dokumen resmi** (surat, SK, berita acara, proposal, dll.) secara otomatis
- 🗂️ **Mengarsipkan** semua dokumen yang dibuat
- 📥 **Mengekspor** dokumen ke format PDF
- 🏫 **Mengelola master data** sekolah
- 🔌 **Terhubung aman** ke Google Workspace melalui Cloudflare Worker

---

## Arsitektur

```
React Frontend (Cloudflare Pages)
        │
        │  HTTPS — hanya ke Worker URL
        ▼
Cloudflare Worker  ← API proxy + autentikasi
        │
        │  HTTPS + GAS_SECRET
        ▼
Google Apps Script (Web App)
        │
        ├──► Google Sheets   — database (Settings, Documents, Templates, Logs)
        ├──► Google Docs     — generate dokumen dari template
        └──► Google Drive    — simpan dokumen + export PDF
```

---

## Struktur Folder

```
AINorax/
├── frontend/           # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/ # Layout, Sidebar, StatCard, DataTable, dll.
│   │   ├── pages/      # Login, Dashboard, BuatDokumen, Arsip, dll.
│   │   └── lib/        # api.js, auth.js, constants.js, storage.js
│   ├── README.md       # ← panduan menjalankan frontend
│   └── package.json
│
├── worker/             # Cloudflare Worker (API proxy)
│   ├── index.js        # Entry point — 3 endpoint
│   ├── wrangler.toml.example
│   └── README.md       # ← panduan setup & deploy Worker
│
├── gas/                # Google Apps Script backend
│   ├── Code.gs         # Entry point — semua logika GAS
│   └── README_GAS.md   # ← panduan setup & deploy GAS
│
├── PROJECT_CONTEXT.md  # Konteks teknis proyek
├── APP_SPEC.md         # Spesifikasi fitur MVP
├── TASK_LOG.md         # Log progres pengembangan
└── TODO.md             # Daftar tahap kerja
```

---

## Quick Start

### Prasyarat
- Node.js ≥ 18
- Akun Cloudflare (gratis)
- Akun Google

### 1. Clone repo

```bash
git clone https://github.com/belahoq/AINorax.git
cd AINorax
```

### 2. Jalankan frontend (mode dummy — tanpa backend)

```bash
cd frontend
npm install
npm run dev
# Buka http://localhost:5173 — PIN: 123456
```

### 3. Setup backend lengkap

| Komponen | Panduan |
|----------|---------|
| Google Apps Script | [`gas/README_GAS.md`](gas/README_GAS.md) |
| Cloudflare Worker | [`worker/README.md`](worker/README.md) |
| Frontend (produksi) | [`frontend/README.md`](frontend/README.md) |

---

## Fitur MVP

| Fitur | Status |
|-------|--------|
| Login PIN admin | ✅ |
| Dashboard statistik | ✅ |
| Buat dokumen (8 jenis) | ✅ |
| Arsip dokumen | ✅ |
| Master data sekolah | ✅ |
| Template Google Docs | ✅ |
| Pengaturan koneksi | ✅ |
| Cloudflare Worker API | ✅ |
| Google Apps Script backend | ✅ |
| SPMB | 🔜 |
| Absensi QR | 🔜 |
| Inventaris | 🔜 |

---

## 8 Jenis Dokumen

1. Surat Undangan Rapat
2. Surat Pemberitahuan Orang Tua
3. Surat Persetujuan Wali Murid
4. Surat Keterangan
5. SK Panitia
6. Berita Acara
7. Proposal Kegiatan
8. Notulen Rapat

---

## Keamanan

- ✅ `GAS_URL` dan `GAS_SECRET` tidak pernah terekspos ke frontend
- ✅ Semua request melalui Cloudflare Worker sebagai proxy
- ✅ Autentikasi HMAC-SHA256 dengan TTL 8 jam
- ✅ GAS memvalidasi secret token setiap request
- ✅ CORS dibatasi per domain (`ALLOWED_ORIGIN`)

---

## Identitas Sekolah

| Field | Nilai |
|-------|-------|
| Nama | SD Negeri 3 Pringgabaya |
| Brand | SDENTIBAYA |
| Slogan | SDENTIBAYA MELAJU |
| Website | www.sdn3pringgabaya.sch.id |
| Kepala Sekolah | Maturiadi, S.Pd. |

---

## Lisensi

Dikembangkan khusus untuk SD Negeri 3 Pringgabaya.  
&copy; 2026 SDENTIBAYA AdminKit
