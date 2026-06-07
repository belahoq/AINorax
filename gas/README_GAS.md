# SDENTIBAYA AdminKit — Google Apps Script Backend

> Backend utama yang menghubungkan Cloudflare Worker dengan  
> Google Sheets, Google Docs, dan Google Drive.

---

## Arsitektur

```
Cloudflare Worker
      │
      │  POST + { secret, action, payload }
      ▼
Google Apps Script (doPost)
      │
      ├──► Google Sheets   — Settings, Documents, Templates, Logs
      ├──► Google Docs     — Generate dokumen dari template
      └──► Google Drive    — Simpan dokumen + export PDF
```

---

## Persiapan Awal (Lakukan Sekali)

### Langkah 1 — Buat Google Spreadsheet

1. Buka **[Google Sheets](https://sheets.google.com)**
2. Buat spreadsheet baru, beri nama: **SDENTIBAYA AdminKit DB**
3. Salin **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

---

### Langkah 2 — Buat Folder di Google Drive

1. Buka **[Google Drive](https://drive.google.com)**
2. Buat folder baru: **SDENTIBAYA Dokumen**
3. Buka folder → salin **Folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

---

### Langkah 3 — Buat Google Apps Script Project

1. Buka **[script.google.com](https://script.google.com)**
2. Klik **New Project**
3. Beri nama project: **SDENTIBAYA AdminKit GAS**
4. Hapus semua kode default di `Code.gs`
5. Salin seluruh isi file `gas/Code.gs` dari repo ini
6. Klik **Save** (Ctrl+S)

---

### Langkah 4 — Set Script Properties

1. Di Apps Script Editor: **Project Settings** (ikon ⚙️ kiri)
2. Scroll ke bawah → **Script Properties**
3. Klik **Add script property**, isi satu per satu:

| Property | Nilai | Keterangan |
|----------|-------|------------|
| `GAS_SECRET` | *(string acak panjang)* | **Wajib** — harus sama dengan di Worker |
| `SPREADSHEET_ID` | *(ID dari Langkah 1)* | **Wajib** |
| `DRIVE_FOLDER_ID` | *(ID dari Langkah 2)* | **Wajib** |
| `DEFAULT_TEMPLATE_DOC_ID` | *(ID Google Docs)* | Opsional — template default |

> ⚠️ **GAS_SECRET** harus identik dengan nilai `GAS_SECRET` yang di-set di Cloudflare Worker.  
> Gunakan string acak minimal 32 karakter. Contoh: `sdentibaya-secret-2026-xK9mP3qR`

---

### Langkah 5 — Inisialisasi Spreadsheet

1. Di Apps Script Editor, pilih fungsi **`initSpreadsheet`** dari dropdown
2. Klik **Run** ▶
3. Izinkan akses Google saat diminta (klik **Review Permissions → Allow**)
4. Tunggu hingga muncul alert "Inisialisasi berhasil!"

Setelah ini, Spreadsheet Anda akan otomatis memiliki 4 sheet:
- **Settings** — data master sekolah
- **Documents** — arsip semua dokumen yang dibuat
- **Templates** — daftar template Google Docs
- **Logs** — log semua aktivitas

---

### Langkah 6 — Deploy sebagai Web App

1. Di Apps Script Editor: **Deploy → New Deployment**
2. Klik ikon ⚙️ → pilih **Web App**
3. Isi konfigurasi:
   - **Description**: `SDENTIBAYA AdminKit v1.0`
   - **Execute as**: `Me` *(akun Google Anda)*
   - **Who has access**: `Anyone`
4. Klik **Deploy**
5. **Izinkan akses** saat diminta
6. Salin **Web App URL** yang muncul:
   ```
   https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
   ```

---

### Langkah 7 — Set GAS_URL di Cloudflare Worker

Masukkan URL dari Langkah 6 ke Worker:

```bash
# Di folder worker/
wrangler secret put GAS_SECRET
# Ketik nilai GAS_SECRET yang sama dengan di Script Properties

# Atau via wrangler.toml [vars]:
# GAS_URL = "https://script.google.com/macros/s/.../exec"
```

Atau via **Cloudflare Dashboard**:
`Workers & Pages → nama-worker → Settings → Variables and Secrets`

---

## Struktur Google Sheets

### Sheet: Settings
| Kolom | Field | Keterangan |
|-------|-------|------------|
| A | key | Nama setting (misal: namaSekolah) |
| B | value | Nilai setting |
| C | updatedAt | Timestamp terakhir diupdate |

**Setting default yang diisi saat `initSpreadsheet`:**
```
namaSekolah, npsn, alamat, kecamatan, kabupaten, provinsi,
telepon, website, email, brand, slogan, tahunAjaran,
namaKepsek, nipKepsek, pangkatKepsek
```

---

### Sheet: Documents
| Kolom | Field | Keterangan |
|-------|-------|------------|
| A | id | ID unik (DOC-timestamp-random) |
| B | createdAt | Timestamp dibuat (ISO) |
| C | type | Jenis dokumen (undangan_rapat, dst.) |
| D | number | Nomor surat/dokumen |
| E | subject | Perihal / judul singkat |
| F | title | Judul lengkap dokumen |
| G | createdBy | Nama pembuat |
| H | docUrl | URL Google Docs |
| I | pdfUrl | URL PDF di Drive |
| J | status | berhasil / draft / gagal |
| K | rawJson | Payload lengkap (JSON string) |

---

### Sheet: Templates
| Kolom | Field | Keterangan |
|-------|-------|------------|
| A | id | ID unik (TMPL-timestamp-random) |
| B | type | Jenis dokumen |
| C | name | Nama template |
| D | description | Deskripsi (opsional) |
| E | docTemplateId | ID file Google Docs template |
| F | placeholders | JSON array placeholder |
| G | isActive | TRUE / FALSE |
| H | createdAt | Timestamp dibuat |
| I | updatedAt | Timestamp diupdate |

---

### Sheet: Logs
| Kolom | Field | Keterangan |
|-------|-------|------------|
| A | id | ID log (LOG-timestamp-random) |
| B | timestamp | Waktu aksi (ISO) |
| C | action | Nama action yang dijalankan |
| D | user | Nama pengguna |
| E | detail | Detail keterangan |
| F | ip | IP address (tidak tersedia di GAS) |
| G | status | berhasil / gagal / info |

---

## Action yang Tersedia

| Action | Fungsi | Payload Wajib |
|--------|--------|---------------|
| `ping` | Health check GAS | — |
| `getSettings` | Ambil semua settings | — |
| `saveSettings` | Simpan/update settings | `{ key: value, ... }` |
| `getDashboardStats` | Statistik dokumen | — |
| `createDocument` | Buat dokumen baru | `{ jenis, ... field dokumen }` |
| `listDocuments` | Daftar arsip dokumen | `{ jenis?, status?, limit?, offset? }` |
| `getDocument` | Detail satu dokumen | `{ id }` |
| `listTemplates` | Daftar semua template | — |
| `saveTemplate` | Tambah/update template | `{ jenis, nama, docTemplateId, ... }` |
| `createLog` | Catat log manual | `{ action, user, detail, status }` |

---

## Format Request & Response

### Request (dari Cloudflare Worker ke GAS)
```json
{
  "secret":  "nilai-GAS_SECRET",
  "action":  "createDocument",
  "payload": {
    "jenis":      "undangan_rapat",
    "nomorSurat": "001/UN/VI/2026",
    "perihal":    "Rapat Koordinasi Persiapan Ujian"
  }
}
```

### Response (dari GAS ke Worker)
```json
{
  "success": true,
  "message": "Dokumen berhasil dibuat.",
  "data": {
    "id":      "DOC-1749291600000-A3F",
    "docUrl":  "https://docs.google.com/document/d/.../edit",
    "pdfUrl":  "https://drive.google.com/file/d/.../view",
    "jenis":   "undangan_rapat",
    "perihal": "Rapat Koordinasi Persiapan Ujian"
  },
  "meta": {
    "timestamp": "2026-06-07T10:00:00.000Z"
  }
}
```

---

## Cara Membuat Template Google Docs

Template menggunakan placeholder `{{nama_variabel}}` yang akan diganti otomatis.

### Placeholder global (selalu tersedia):
```
{{namaSekolah}}     → SD Negeri 3 Pringgabaya
{{npsn}}            → 50205367
{{alamat}}          → Jl. Raya Pringgabaya
{{kecamatan}}       → Pringgabaya
{{kabupaten}}       → Lombok Timur
{{provinsi}}        → Nusa Tenggara Barat
{{telepon}}         → (0376) 21XXX
{{website}}         → www.sdn3pringgabaya.sch.id
{{namaKepsek}}      → Maturiadi, S.Pd.
{{nipKepsek}}       → 19XXXXXXXXXXXXXX
{{pangkatKepsek}}   → Pembina, IV/a
{{tahunAjaran}}     → 2025/2026
{{tanggalHariIni}}  → 07 Juni 2026
{{tahun}}           → 2026
```

### Placeholder dari form (contoh untuk Surat Undangan):
```
{{nomorSurat}}   → 001/UN/VI/2026
{{perihal}}      → Rapat Koordinasi
{{hari}}         → Senin
{{tanggal}}      → 2026-06-09
{{waktu}}        → 09.00 WITA
{{tempat}}       → Ruang Kepala Sekolah
{{agenda}}       → 1. Pembukaan\n2. Pembahasan
{{tujuan}}       → Yth. Bapak/Ibu Guru...
```

### Langkah membuat template:
1. Buat Google Docs baru di folder **SDENTIBAYA Dokumen**
2. Tulis kop surat dan isi dokumen dengan placeholder `{{variabel}}`
3. Salin **File ID** dari URL Docs
4. Di aplikasi: menu **Template** → **Tambah Template**
5. Isi ID tersebut di field "Google Docs Template ID"

---

## Cara Update Deployment GAS

Setiap kali `Code.gs` diubah, wajib membuat deployment baru:

1. **Deploy → Manage Deployments**
2. Klik ✏️ pada deployment aktif
3. Pilih **Version: New version**
4. Klik **Deploy**
5. URL tidak berubah — Worker tidak perlu diupdate

> ⚠️ **Penting:** Setiap perubahan kode di GAS HARUS di-deploy ulang.  
> Tanpa redeploy, perubahan tidak akan aktif.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Akses ditolak. Secret token tidak valid.` | Pastikan `GAS_SECRET` di Script Properties sama persis dengan di Worker |
| `SPREADSHEET_ID belum dikonfigurasi` | Set Script Properties → `SPREADSHEET_ID` |
| `DRIVE_FOLDER_ID belum dikonfigurasi` | Set Script Properties → `DRIVE_FOLDER_ID` |
| Sheet tidak ditemukan | Jalankan fungsi `initSpreadsheet` dari Editor |
| `Exception: You do not have permission` | Re-authorize: Deploy → Manage → Edit → pilih New Version → Deploy |
| Template tidak ditemukan | Cek ID di Sheet Templates, pastikan kolom `isActive` = `TRUE` |
| PDF gagal dibuat | Pastikan akun GAS punya akses ke folder Drive |
| `ScriptApp.getOAuthToken()` error | Pastikan GAS di-deploy dengan opsi "Execute as: Me" |

---

## Catatan Keamanan

- `GAS_SECRET` hanya ada di Script Properties — **tidak pernah** tampil di kode
- Setiap request divalidasi secret sebelum diproses
- Semua aksi dicatat di Sheet Logs
- `doPost` adalah satu-satunya entry point — tidak ada endpoint lain
- GAS Web App bisa diakses siapa saja tapi **selalu** butuh secret yang benar
