// ============================================================
// constants.js — Konstanta global aplikasi SDENTIBAYA AdminKit
// ============================================================

// === Identitas Sekolah ===
export const SEKOLAH = {
  nama:        'SD Negeri 3 Pringgabaya',
  npsn:        '50205367',
  alamat:      'Jl. Raya Pringgabaya, Kec. Pringgabaya, Kab. Lombok Timur, NTB',
  telepon:     '(0376) 21XXX',
  website:     'www.sdn3pringgabaya.sch.id',
  email:       'sdn3pringgabaya@gmail.com',
  namaKepsek:  'Maturiadi, S.Pd.',
  nipKepsek:   '19XXXXXXXXXXXXXX',
  tahunAjaran: '2025/2026',
}

// === Brand ===
export const BRAND = {
  nama:   'SDENTIBAYA',
  slogan: 'SDENTIBAYA MELAJU',
}

// === Menu Navigasi Sidebar ===
export const MENU_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'grid',
  },
  {
    label: 'Buat Dokumen',
    path: '/buat-dokumen',
    icon: 'file-plus',
  },
  {
    label: 'Arsip Dokumen',
    path: '/arsip',
    icon: 'archive',
  },
  {
    label: 'Master Data',
    path: '/master-data',
    icon: 'database',
  },
  {
    label: 'Template Dokumen',
    path: '/template',
    icon: 'layout-template',
  },
  {
    label: 'Pengaturan',
    path: '/pengaturan',
    icon: 'settings',
  },
]

// === Jenis Dokumen ===
export const JENIS_DOKUMEN = [
  { value: 'undangan_rapat',          label: 'Surat Undangan Rapat' },
  { value: 'pemberitahuan_ortu',      label: 'Surat Pemberitahuan Orang Tua' },
  { value: 'persetujuan_wali',        label: 'Surat Persetujuan Wali Murid' },
  { value: 'surat_keterangan',        label: 'Surat Keterangan' },
  { value: 'sk_panitia',              label: 'SK Panitia' },
  { value: 'berita_acara',            label: 'Berita Acara' },
  { value: 'proposal_kegiatan',       label: 'Proposal Kegiatan' },
  { value: 'notulen_rapat',           label: 'Notulen Rapat' },
]

// === Daftar Kelas ===
export const DAFTAR_KELAS = [
  'Kelas I-A', 'Kelas I-B',
  'Kelas II-A', 'Kelas II-B',
  'Kelas III-A', 'Kelas III-B',
  'Kelas IV-A', 'Kelas IV-B',
  'Kelas V-A', 'Kelas V-B',
  'Kelas VI-A', 'Kelas VI-B',
]

// === Kunci sessionStorage ===
export const SESSION_KEY = 'sdentibaya_token'

// === URL API (Cloudflare Worker) ===
// Gunakan env variable saat build production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
