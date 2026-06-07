# PROJECT_CONTEXT.md
# SDENTIBAYA AdminKit — Konteks Proyek

> Dokumen ini adalah referensi utama pengembangan. Perbarui setiap ada keputusan teknis penting.

---

## Identitas Proyek

| Field            | Detail                                  |
|------------------|-----------------------------------------|
| Nama Aplikasi    | SDENTIBAYA AdminKit                     |
| Brand            | SDENTIBAYA                              |
| Slogan           | SDENTIBAYA MELAJU                       |
| Instansi         | SD Negeri 3 Pringgabaya                 |
| Website          | www.sdn3pringgabaya.sch.id              |
| Kepala Sekolah   | Maturiadi, S.Pd.                        |
| Tujuan Utama     | Webapp administrasi sekolah berbasis Cloudflare × Google Apps Script untuk membuat, mengarsipkan, dan mengekspor dokumen sekolah secara otomatis. |

---

## Stack Teknologi

### Frontend
- **React + Vite** — SPA, functional components, JavaScript (bukan TypeScript)
- **Tailwind CSS** — styling utility-first, tanpa library UI berat
- **Cloudflare Pages** — hosting frontend

### Backend / API Layer
- **Cloudflare Worker** — API proxy antara frontend dan Google Apps Script
  - Menyimpan `GAS_URL`, `GAS_SECRET`, `ADMIN_PIN` di environment variables
  - Frontend tidak pernah tahu URL GAS secara langsung

### Backend Google Workspace
- **Google Apps Script (GAS)** — logika backend utama
  - Wajib memvalidasi `secret token` pada setiap request masuk
- **Google Sheets** — database ringan (data siswa, guru, template, arsip)
- **Google Docs** — generator dokumen otomatis dari template
- **Google Drive** — penyimpanan arsip dokumen
- **Export PDF** — dari Google Docs via GAS

---

## Arsitektur Sistem

```
Frontend React (Cloudflare Pages)
        │
        │  HTTP Request (hanya ke Worker)
        ▼
Cloudflare Worker (API Proxy)
        │
        │  HTTP Request + secret token
        ▼
Google Apps Script (GAS)
        │
        ├──► Google Sheets  (baca/tulis data)
        ├──► Google Docs    (generate dokumen dari template)
        └──► Google Drive   (simpan & ekspor PDF)
        │
        ▼
Response JSON kembali ke Worker → Frontend
```

**Prinsip utama:**
- Frontend HANYA berkomunikasi dengan Cloudflare Worker
- Worker MENYIMPAN semua secret (GAS_URL, GAS_SECRET, ADMIN_PIN)
- GAS SELALU memvalidasi secret token sebelum memproses request

---

## Keputusan Teknis

| Tanggal    | Keputusan                                                                 | Alasan                                                        |
|------------|---------------------------------------------------------------------------|---------------------------------------------------------------|
| 2026-06-07 | Menggunakan JavaScript bukan TypeScript                                   | Lebih sederhana, mudah diedit oleh tim non-developer          |
| 2026-06-07 | Cloudflare Worker sebagai proxy, bukan direct call ke GAS dari frontend   | Keamanan: menyembunyikan GAS_URL dan secret dari publik       |
| 2026-06-07 | Google Sheets sebagai database                                            | Sudah familiar di lingkungan sekolah, zero cost               |
| 2026-06-07 | Tailwind CSS tanpa library UI berat                                       | Bundle ringan, mudah dikustomisasi, tidak ada ketergantungan  |
| 2026-06-07 | Login berbasis PIN (ADMIN_PIN di Worker env)                              | Sederhana untuk konteks sekolah, tidak perlu OAuth kompleks   |
| 2026-06-07 | Google Docs sebagai generator dokumen (bukan HTML-to-PDF)                 | Format dokumen rapi, sudah familiar, mudah diedit template-nya|

---

## Aturan Pengembangan

### Keamanan
- [ ] Jangan pernah expose `GAS_URL` di kode frontend
- [ ] Jangan pernah expose `GAS_SECRET` di kode frontend
- [ ] Semua request ke GAS harus melalui Cloudflare Worker
- [ ] GAS wajib memvalidasi `x-secret` header pada setiap request

### Kode
- [ ] Gunakan JavaScript (bukan TypeScript)
- [ ] Gunakan React functional components
- [ ] Gunakan Tailwind CSS untuk semua styling
- [ ] Jangan gunakan library UI berat (MUI, Ant Design, Chakra, dll.)
- [ ] Tambahkan komentar pada bagian penting
- [ ] Kode harus sederhana, rapi, dan mudah diedit
- [ ] Fokus pada fungsi berjalan dulu, bukan kesempurnaan

### Bahasa & Konten
- [ ] Semua teks UI menggunakan Bahasa Indonesia
- [ ] Nama dokumen, label form, notifikasi — semua Bahasa Indonesia

### Dokumentasi
- [ ] Perbarui `TASK_LOG.md` setiap selesai satu tahap
- [ ] Catat keputusan teknis penting di `PROJECT_CONTEXT.md` (tabel Keputusan Teknis)
- [ ] Jangan hapus file yang sudah dibuat kecuali jelas diperlukan
- [ ] Jangan refactor besar tanpa alasan yang jelas

---

## Struktur Folder Proyek (Rencana)

```
sdentibaya-adminkit/
├── frontend/                    # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Logo, gambar
│   │   ├── components/          # Komponen reusable
│   │   ├── pages/               # Halaman utama
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BuatDokumen.jsx
│   │   │   ├── ArsipDokumen.jsx
│   │   │   ├── MasterData.jsx
│   │   │   ├── TemplateDokumen.jsx
│   │   │   └── Pengaturan.jsx
│   │   ├── hooks/               # Custom hooks
│   │   ├── utils/               # Fungsi helper, API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── worker/                      # Cloudflare Worker
│   ├── src/
│   │   └── index.js             # Entry point Worker
│   └── wrangler.toml            # Konfigurasi Cloudflare Worker
│
├── gas/                         # Google Apps Script
│   ├── Code.gs                  # Entry point GAS (doPost)
│   ├── SheetService.gs          # Operasi Google Sheets
│   ├── DocService.gs            # Generate Google Docs
│   ├── DriveService.gs          # Manajemen Google Drive
│   └── appsscript.json          # Konfigurasi GAS manifest
│
├── PROJECT_CONTEXT.md           # ← file ini
├── APP_SPEC.md
├── TASK_LOG.md
└── TODO.md
```

---

## Kontak & Referensi

- Website sekolah: https://www.sdn3pringgabaya.sch.id
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Google Apps Script docs: https://developers.google.com/apps-script
