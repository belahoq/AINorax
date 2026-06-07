# APP_SPEC.md
# SDENTIBAYA AdminKit — Spesifikasi Aplikasi

> Dokumen spesifikasi fitur MVP. Perbarui jika ada perubahan scope fitur.

---

## Ringkasan Aplikasi

SDENTIBAYA AdminKit adalah webapp administrasi sekolah yang memungkinkan admin (staf TU/kepala sekolah) untuk:
- Membuat dokumen resmi sekolah secara otomatis dari template
- Mengarsipkan dokumen yang sudah dibuat
- Mengekspor dokumen ke format PDF
- Mengelola data master sekolah
- Mengatur koneksi ke backend Google Workspace

---

## Daftar Fitur MVP

### 1. Login Admin

**Tujuan:** Mengamankan akses aplikasi  
**Mekanisme:** PIN-based login (ADMIN_PIN disimpan di Cloudflare Worker env)  
**Alur:**
1. Admin buka halaman login
2. Masukkan PIN
3. Frontend kirim PIN ke Worker (`POST /api/auth`)
4. Worker bandingkan dengan `ADMIN_PIN` env var
5. Jika cocok → Worker kembalikan session token (simple JWT atau signed token)
6. Frontend simpan token di sessionStorage
7. Semua request berikutnya sertakan token di header

**UI:**
- Tampilan elegan bernuansa dunia pendidikan
- Logo sekolah / brand SDENTIBAYA
- Slogan: "SDENTIBAYA MELAJU"
- Form PIN dengan karakter tersembunyi (●●●●●●)
- Tombol "Masuk"
- Tidak ada fitur register / forgot PIN (diatur manual di Worker env)

---

### 2. Dashboard

**Tujuan:** Halaman utama setelah login, menampilkan ringkasan aktivitas  
**Konten:**
- Sambutan + nama instansi (SD Negeri 3 Pringgabaya)
- Statistik cepat:
  - Jumlah dokumen dibuat bulan ini
  - Jumlah dokumen dalam arsip
  - Jumlah template tersedia
- Shortcut / aksi cepat ke fitur utama
- Aktivitas terbaru (dokumen terakhir dibuat)

---

### 3. Buat Dokumen

**Tujuan:** Generate dokumen resmi dari template yang sudah disiapkan  
**Alur:**
1. Pilih jenis dokumen dari dropdown
2. Isi form data sesuai jenis dokumen
3. Preview data yang akan diisi
4. Klik "Buat Dokumen"
5. Frontend kirim data ke Worker (`POST /api/dokumen/buat`)
6. Worker teruskan ke GAS dengan secret token
7. GAS buka template Google Docs, isi variabel, simpan ke Drive
8. GAS kembalikan link Google Docs + link PDF
9. Frontend tampilkan link download

**Jenis Dokumen MVP:**

| No | Jenis Dokumen                    | Field Utama                                                    |
|----|----------------------------------|----------------------------------------------------------------|
| 1  | Surat Undangan Rapat             | Nomor surat, perihal, hari/tanggal, waktu, tempat, peserta    |
| 2  | Surat Pemberitahuan Orang Tua    | Nomor surat, perihal, nama siswa, kelas, isi pemberitahuan    |
| 3  | Surat Persetujuan Wali Murid     | Nomor surat, nama siswa, kelas, nama wali, perihal persetujuan|
| 4  | Surat Keterangan                 | Nomor surat, nama yang diterangkan, keperluan, keterangan     |
| 5  | SK Panitia                       | Nomor SK, nama kegiatan, tanggal, daftar panitia + jabatan    |
| 6  | Berita Acara                     | Nomor BA, kegiatan, tanggal, tempat, peserta, isi berita acara|
| 7  | Proposal Kegiatan                | Nama kegiatan, latar belakang, tujuan, waktu, anggaran        |
| 8  | Notulen Rapat                    | Tanggal rapat, agenda, peserta, hasil keputusan, notulis      |

---

### 4. Arsip Dokumen

**Tujuan:** Melihat dan mengelola dokumen yang sudah dibuat  
**Fitur:**
- Tabel daftar dokumen (dari Google Sheets via Worker/GAS)
- Filter berdasarkan: jenis dokumen, bulan/tahun
- Kolom: No, Jenis, Nomor Surat, Perihal, Tanggal Dibuat, Aksi
- Aksi per dokumen: Lihat (Google Docs), Download PDF, Hapus
- Pencarian berdasarkan nomor surat / perihal

---

### 5. Master Data Sekolah

**Tujuan:** Menyimpan data referensi yang digunakan di semua dokumen  
**Data yang dikelola:**

| Kategori         | Data                                                          |
|------------------|---------------------------------------------------------------|
| Profil Sekolah   | Nama sekolah, NPSN, alamat, telepon, website, logo           |
| Kepala Sekolah   | Nama, NIP, gelar                                             |
| Staf TU          | Nama staf, jabatan                                           |
| Data Kelas       | Nama kelas, wali kelas                                       |
| Tahun Ajaran     | Tahun ajaran aktif                                           |

---

### 6. Template Dokumen

**Tujuan:** Mengelola template Google Docs yang digunakan untuk generate dokumen  
**Fitur:**
- Daftar template yang terdaftar (nama + jenis dokumen)
- Link ke Google Docs template (untuk diedit langsung di Google Docs)
- Kolom variabel yang tersedia di setiap template
- Tambah / edit / hapus mapping template

**Catatan:** Template fisik tetap ada di Google Drive. Di sini hanya menyimpan ID/URL template dan mapping variabel-nya.

---

### 7. Pengaturan Koneksi Backend

**Tujuan:** Mengatur dan memverifikasi koneksi ke Google Apps Script melalui Worker  
**Fitur:**
- Tampilkan status koneksi Worker ↔ GAS (ping test)
- Info environment yang aktif (nama Worker, mode: dev/prod)
- Tombol "Test Koneksi" — kirim ping ke Worker, Worker ping ke GAS
- Panduan cara setup GAS_URL dan GAS_SECRET di Cloudflare Worker
- Tidak ada form untuk mengubah GAS_URL/GAS_SECRET dari UI (demi keamanan, harus lewat Cloudflare Dashboard)

---

## API Endpoints (Cloudflare Worker)

| Method | Endpoint                  | Fungsi                                      |
|--------|---------------------------|---------------------------------------------|
| POST   | `/api/auth`               | Verifikasi PIN, kembalikan session token    |
| GET    | `/api/ping`               | Health check Worker + GAS                  |
| GET    | `/api/dashboard/stats`    | Statistik untuk dashboard                  |
| POST   | `/api/dokumen/buat`       | Generate dokumen baru                      |
| GET    | `/api/dokumen/arsip`      | Ambil daftar arsip dokumen                 |
| DELETE | `/api/dokumen/:id`        | Hapus dokumen dari arsip                   |
| GET    | `/api/master`             | Ambil data master sekolah                  |
| POST   | `/api/master`             | Update data master sekolah                 |
| GET    | `/api/template`           | Ambil daftar template                      |
| POST   | `/api/template`           | Tambah/update template                     |
| DELETE | `/api/template/:id`       | Hapus template                             |

---

## GAS Actions (Google Apps Script)

Setiap request ke GAS menggunakan `doPost` dengan body JSON:

```json
{
  "secret": "GAS_SECRET_VALUE",
  "action": "nama_action",
  "payload": { ... }
}
```

| Action                  | Fungsi                                            |
|-------------------------|---------------------------------------------------|
| `ping`                  | Health check GAS                                  |
| `getDashboardStats`     | Hitung statistik dokumen                          |
| `buatDokumen`           | Generate Google Docs dari template, simpan        |
| `getArsipDokumen`       | Ambil daftar dokumen dari Sheets                  |
| `hapusDokumen`          | Hapus baris di Sheets + file di Drive             |
| `getMasterData`         | Ambil data master dari Sheets                     |
| `updateMasterData`      | Update data master di Sheets                      |
| `getTemplate`           | Ambil daftar template dari Sheets                 |
| `addTemplate`           | Tambah template baru ke Sheets                    |
| `deleteTemplate`        | Hapus template dari Sheets                        |

---

## Struktur Google Sheets (Database)

### Sheet: `ArsipDokumen`
| Kolom | Nama        | Keterangan                          |
|-------|-------------|-------------------------------------|
| A     | id          | ID unik (timestamp)                 |
| B     | jenisDokumen| Jenis dokumen                       |
| C     | nomorSurat  | Nomor surat                         |
| D     | perihal     | Perihal / judul dokumen             |
| E     | tanggalBuat | Tanggal dibuat (ISO string)         |
| F     | docsId      | Google Docs file ID                 |
| G     | docsUrl     | URL Google Docs                     |
| H     | pdfUrl      | URL PDF (exported)                  |
| I     | dibuatOleh  | Nama pembuat                        |

### Sheet: `MasterData`
| Kolom | Nama      | Keterangan                            |
|-------|-----------|---------------------------------------|
| A     | key       | Key unik (namaSekolah, npsn, dll.)    |
| B     | value     | Nilai data                            |
| C     | label     | Label tampilan                        |

### Sheet: `Template`
| Kolom | Nama          | Keterangan                          |
|-------|---------------|-------------------------------------|
| A     | id            | ID unik template                    |
| B     | namaTemplate  | Nama template                       |
| C     | jenisDokumen  | Jenis dokumen yang menggunakan      |
| D     | docsTemplateId| Google Docs template file ID        |
| E     | variabel      | JSON string daftar variabel         |

---

## Variabel Template Dokumen

Variabel ditulis dalam template Google Docs dengan format: `{{nama_variabel}}`

**Variabel global (tersedia di semua template):**
```
{{namaSekolah}}      → SD Negeri 3 Pringgabaya
{{npsn}}             → NPSN Sekolah
{{alamatSekolah}}    → Alamat lengkap
{{teleponSekolah}}   → Nomor telepon
{{namaKepsek}}       → Maturiadi, S.Pd.
{{nipKepsek}}        → NIP Kepala Sekolah
{{tahunAjaran}}      → Tahun ajaran aktif
{{tanggalHariIni}}   → Tanggal saat dokumen dibuat
```

---

## Non-Functional Requirements

| Aspek         | Target                                                            |
|---------------|-------------------------------------------------------------------|
| Performa      | Halaman load < 3 detik, generate dokumen < 10 detik              |
| Keamanan      | GAS_URL tidak pernah terekspos di frontend / network tab         |
| Kompatibilitas| Browser modern (Chrome, Firefox, Edge) — tidak perlu IE          |
| Bahasa UI     | 100% Bahasa Indonesia                                             |
| Offline       | Tidak diperlukan (butuh koneksi untuk GAS)                       |
| Mobile        | Responsive (bisa dipakai di tablet/HP untuk keadaan darurat)     |
