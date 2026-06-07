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
  nama:    'SDENTIBAYA',
  produk:  'AdminKit',
  slogan:  'SDENTIBAYA MELAJU',
  versi:   'MVP',
}

// ============================================================
// === Menu Navigasi Sidebar — dikelompokkan per seksi ===
// ============================================================
export const MENU_GROUPS = [
  {
    // Seksi utama — fitur inti dokumen
    label: null, // tanpa judul grup
    items: [
      { label: 'Dashboard',     path: '/dashboard',    icon: 'grid'    },
      { label: 'Buat Dokumen',  path: '/buat-dokumen', icon: 'file-plus' },
      { label: 'Arsip Dokumen', path: '/arsip',        icon: 'archive' },
      { label: 'Template',      path: '/template',     icon: 'layout-template' },
    ],
  },
  {
    // Seksi data & administrasi
    label: 'Administrasi',
    items: [
      { label: 'Master Data', path: '/master-data', icon: 'database' },
      { label: 'SPMB',        path: '/spmb',        icon: 'users',    badge: 'Coming Soon' },
      { label: 'Absensi QR',  path: '/absensi-qr',  icon: 'qr-code',  badge: 'Coming Soon' },
      { label: 'Inventaris',  path: '/inventaris',  icon: 'box',      badge: 'Coming Soon' },
    ],
  },
  {
    // Seksi sistem
    label: 'Sistem',
    items: [
      { label: 'Pengaturan', path: '/pengaturan', icon: 'settings' },
    ],
  },
]

// Flat list untuk keperluan Topbar (page title lookup)
export const MENU_ITEMS = MENU_GROUPS.flatMap((g) => g.items)

// === Jenis Dokumen ===
export const JENIS_DOKUMEN = [
  { value: 'undangan_rapat',     label: 'Surat Undangan Rapat' },
  { value: 'pemberitahuan_ortu', label: 'Surat Pemberitahuan Orang Tua' },
  { value: 'persetujuan_wali',   label: 'Surat Persetujuan Wali Murid' },
  { value: 'surat_keterangan',   label: 'Surat Keterangan' },
  { value: 'sk_panitia',         label: 'SK Panitia' },
  { value: 'berita_acara',       label: 'Berita Acara' },
  { value: 'proposal_kegiatan',  label: 'Proposal Kegiatan' },
  { value: 'notulen_rapat',      label: 'Notulen Rapat' },
]

// === Daftar Kelas ===
export const DAFTAR_KELAS = [
  'Kelas I-A',   'Kelas I-B',
  'Kelas II-A',  'Kelas II-B',
  'Kelas III-A', 'Kelas III-B',
  'Kelas IV-A',  'Kelas IV-B',
  'Kelas V-A',   'Kelas V-B',
  'Kelas VI-A',  'Kelas VI-B',
]

// === Kunci sessionStorage ===
export const SESSION_KEY = 'sdentibaya_token'

// === URL API (Cloudflare Worker) ===
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// ============================================================
// === DATA DUMMY — digunakan sementara sebelum backend aktif ===
// ============================================================

/** Statistik ringkasan untuk Dashboard */
export const DUMMY_STATS = {
  totalDokumen:    47,
  suratKeluar:     18,
  skPanitia:        6,
  undanganRapat:    9,
  beritaAcara:      8,
  proposal:         6,
  // perubahan dari bulan lalu (untuk label trend)
  trend: {
    totalDokumen: '+5',
    suratKeluar:  '+3',
    skPanitia:    '+1',
    undanganRapat:'+2',
    beritaAcara:  '0',
    proposal:     '+1',
  },
}

/** Daftar dokumen terbaru untuk tabel Dashboard */
export const DUMMY_DOKUMEN_TERBARU = [
  {
    id: '1',
    nomorSurat:    '012/UN/VI/2026',
    jenisDokumen:  'Surat Undangan Rapat',
    perihal:       'Rapat Koordinasi Persiapan Ujian Kelas VI',
    tanggalBuat:   '2026-06-05',
    dibuatOleh:    'Admin',
    status:        'selesai',
  },
  {
    id: '2',
    nomorSurat:    '011/BA/VI/2026',
    jenisDokumen:  'Berita Acara',
    perihal:       'Serah Terima Pengelolaan Perpustakaan',
    tanggalBuat:   '2026-06-03',
    dibuatOleh:    'Admin',
    status:        'selesai',
  },
  {
    id: '3',
    nomorSurat:    '010/SKP/V/2026',
    jenisDokumen:  'SK Panitia',
    perihal:       'Panitia Pelaksanaan Ujian Akhir Semester',
    tanggalBuat:   '2026-05-28',
    dibuatOleh:    'Admin',
    status:        'selesai',
  },
  {
    id: '4',
    nomorSurat:    '009/PB/V/2026',
    jenisDokumen:  'Surat Pemberitahuan Orang Tua',
    perihal:       'Pemberitahuan Jadwal Ujian Semester Genap',
    tanggalBuat:   '2026-05-20',
    dibuatOleh:    'Admin',
    status:        'selesai',
  },
  {
    id: '5',
    nomorSurat:    '008/PP/V/2026',
    jenisDokumen:  'Proposal Kegiatan',
    perihal:       'Proposal Kegiatan Pentas Seni Akhir Tahun',
    tanggalBuat:   '2026-05-15',
    dibuatOleh:    'Admin',
    status:        'selesai',
  },
  {
    id: '6',
    nomorSurat:    '007/SK/V/2026',
    jenisDokumen:  'Surat Keterangan',
    perihal:       'Keterangan Masih Aktif Bersekolah',
    tanggalBuat:   '2026-05-10',
    dibuatOleh:    'Admin',
    status:        'selesai',
  },
]

/** Status sistem untuk section monitoring Dashboard */
export const DUMMY_STATUS_SISTEM = [
  {
    id:      'frontend',
    label:   'Frontend',
    detail:  'Cloudflare Pages',
    status:  'online',   // 'online' | 'offline' | 'unknown'
  },
  {
    id:      'worker',
    label:   'Worker API',
    detail:  'Cloudflare Worker',
    status:  'unknown',
  },
  {
    id:      'gas',
    label:   'Backend GAS',
    detail:  'Google Apps Script',
    status:  'unknown',
  },
]
