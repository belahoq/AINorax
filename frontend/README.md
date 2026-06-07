# SDENTIBAYA AdminKit — Frontend

> Sistem Administrasi SD Negeri 3 Pringgabaya  
> **SDENTIBAYA MELAJU**

---

## Stack

- React 18 + Vite 5
- Tailwind CSS 3
- React Router DOM 6
- JavaScript (bukan TypeScript)

## Cara Menjalankan

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Buka browser di: **http://localhost:5173**

## Cara Build untuk Production

```bash
npm run build
```

Hasil build ada di folder `dist/` — siap deploy ke Cloudflare Pages.

## Struktur Folder

```
src/
├── styles/
│   └── index.css          # Global CSS + Tailwind directives
├── lib/
│   ├── constants.js       # Konstanta global (nama sekolah, menu, dll.)
│   ├── auth.js            # Fungsi autentikasi (token sessionStorage)
│   └── api.js             # Fungsi API call ke Cloudflare Worker
├── components/
│   ├── Layout.jsx         # Layout utama (sidebar + topbar + konten)
│   ├── Sidebar.jsx        # Navigasi sidebar
│   ├── Topbar.jsx         # Header atas
│   ├── StatCard.jsx       # Kartu statistik dashboard
│   ├── DataTable.jsx      # Tabel data reusable
│   ├── FormField.jsx      # Input form reusable
│   ├── Toast.jsx          # Notifikasi toast
│   ├── EmptyState.jsx     # Tampilan data kosong
│   └── LoadingState.jsx   # Tampilan loading
├── pages/
│   ├── Login.jsx          # Halaman login PIN
│   ├── Dashboard.jsx      # Dashboard utama
│   ├── CreateDocument.jsx # Buat dokumen baru
│   ├── Archive.jsx        # Arsip dokumen
│   ├── MasterData.jsx     # Data master sekolah
│   ├── Templates.jsx      # Kelola template dokumen
│   ├── Settings.jsx       # Pengaturan koneksi
│   └── ComingSoon.jsx     # Placeholder fitur belum ada
├── App.jsx                # Routing utama
└── main.jsx               # Entry point React

## Login Default (Development)

PIN: `123456`  
*(Nanti akan diambil dari ADMIN_PIN Cloudflare Worker env)*

## Catatan

- Frontend hanya berkomunikasi dengan **Cloudflare Worker**, bukan langsung ke GAS
- Semua teks UI menggunakan **Bahasa Indonesia**
- Data dummy digunakan selama belum ada backend nyata
```
