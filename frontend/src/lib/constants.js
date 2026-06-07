// ============================================================
// constants.js — Konstanta global aplikasi SDENTIBAYA AdminKit
// ============================================================

// === Identitas Sekolah ===
// CATATAN: Field ini hanya digunakan di UI (Dashboard banner, Login, dll.)
// Data aktual untuk dokumen diambil dari DEFAULT_MASTER_DATA / GAS Settings.
export const SEKOLAH = {
  nama:        'SD Negeri 3 Pringgabaya',
  npsn:        '50205367',
  alamat:      'Jl. Raya Pringgabaya',        // jalan saja — detail di DEFAULT_MASTER_DATA
  kecamatan:   'Pringgabaya',
  kabupaten:   'Lombok Timur',
  provinsi:    'Nusa Tenggara Barat',
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

// ============================================================
// === KONFIGURASI FIELD PER JENIS DOKUMEN
// Digunakan oleh CreateDocument.jsx untuk form dinamis.
// type: 'text' | 'date' | 'time' | 'textarea' | 'select' | 'divider'
// group: string — opsional, nama grup/seksi di dalam form
// optional: true — tampilkan label "(opsional)"
// ============================================================

/** Opsi penanda tangan yang umum digunakan */
export const PENANDA_TANGAN_OPTIONS = [
  { value: 'kepala_sekolah', label: 'Kepala Sekolah — Maturiadi, S.Pd.' },
  { value: 'wakil_kepsek',   label: 'Wakil Kepala Sekolah' },
  { value: 'bendahara',      label: 'Bendahara Sekolah' },
  { value: 'operator',       label: 'Operator / Staf TU' },
]

export const DOC_FIELDS = {
  // ----------------------------------------------------------
  // 1. SURAT UNDANGAN RAPAT
  // ----------------------------------------------------------
  undangan_rapat: {
    label: 'Surat Undangan Rapat',
    icon:  'bell',
    color: 'hijau',
    groups: [
      {
        title: 'Identitas Surat',
        fields: [
          { name: 'nomorSurat', label: 'Nomor Surat', type: 'text',
            placeholder: '001/UN/VI/2026', required: true,
            hint: 'Format: nomor/kode/bulan romawi/tahun' },
          { name: 'lampiran',   label: 'Lampiran', type: 'text',
            placeholder: '1 (satu) lembar', optional: true },
          { name: 'perihal',    label: 'Perihal', type: 'text',
            placeholder: 'Undangan Rapat Koordinasi', required: true },
          { name: 'tujuan',     label: 'Tujuan Undangan', type: 'textarea', rows: 3,
            placeholder: 'Yth.\nBapak/Ibu Guru dan Staf\nSD Negeri 3 Pringgabaya', required: true },
        ],
      },
      {
        title: 'Waktu & Tempat',
        fields: [
          { name: 'hari',     label: 'Hari',    type: 'text',
            placeholder: 'Senin', required: true },
          { name: 'tanggal',  label: 'Tanggal', type: 'date', required: true },
          { name: 'waktu',    label: 'Waktu',   type: 'text',
            placeholder: '09.00 WITA s.d. selesai', required: true },
          { name: 'tempat',   label: 'Tempat',  type: 'text',
            placeholder: 'Ruang Kepala Sekolah SD Negeri 3 Pringgabaya', required: true },
          { name: 'agenda',   label: 'Agenda Rapat', type: 'textarea', rows: 3,
            placeholder: '1. Pembukaan\n2. Pembahasan agenda\n3. Penutup', required: true },
        ],
      },
      {
        title: 'Isi Surat',
        fields: [
          { name: 'isiPembuka', label: 'Kalimat Pembuka', type: 'textarea', rows: 2,
            placeholder: 'Dengan hormat, bersama surat ini kami mengundang Bapak/Ibu...',
            optional: true },
          { name: 'isiPenutup', label: 'Kalimat Penutup', type: 'textarea', rows: 2,
            placeholder: 'Demikian undangan ini kami sampaikan, atas kehadiran Bapak/Ibu kami ucapkan terima kasih.',
            optional: true },
          { name: 'penandaTangan', label: 'Penanda Tangan', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // 2. SURAT PEMBERITAHUAN ORANG TUA
  // ----------------------------------------------------------
  pemberitahuan_ortu: {
    label: 'Surat Pemberitahuan Orang Tua',
    icon:  'mail',
    color: 'navy',
    groups: [
      {
        title: 'Identitas Surat',
        fields: [
          { name: 'nomorSurat', label: 'Nomor Surat', type: 'text',
            placeholder: '002/PB/VI/2026', required: true },
          { name: 'perihal',    label: 'Perihal', type: 'text',
            placeholder: 'Pemberitahuan Kegiatan Ujian Akhir Semester', required: true },
        ],
      },
      {
        title: 'Detail Kegiatan',
        fields: [
          { name: 'namaKegiatan',  label: 'Nama Kegiatan', type: 'text',
            placeholder: 'Ujian Akhir Semester Genap', required: true },
          { name: 'tanggalKegiatan', label: 'Tanggal Kegiatan', type: 'date', required: true },
          { name: 'tempatKegiatan',  label: 'Tempat Kegiatan', type: 'text',
            placeholder: 'SD Negeri 3 Pringgabaya', required: true },
          { name: 'namaSiswa', label: 'Nama Siswa (jika spesifik)', type: 'text',
            placeholder: 'Kosongkan jika untuk seluruh siswa', optional: true },
        ],
      },
      {
        title: 'Isi Surat',
        fields: [
          { name: 'isiPemberitahuan', label: 'Isi Pemberitahuan', type: 'textarea', rows: 5,
            placeholder: 'Dengan hormat, kami sampaikan bahwa sekolah akan menyelenggarakan...',
            required: true },
          { name: 'penutup', label: 'Kalimat Penutup', type: 'textarea', rows: 2,
            placeholder: 'Demikian pemberitahuan ini kami sampaikan. Atas perhatian Bapak/Ibu kami ucapkan terima kasih.',
            optional: true },
          { name: 'penandaTangan', label: 'Penanda Tangan', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // 3. SURAT PERSETUJUAN WALI MURID
  // ----------------------------------------------------------
  persetujuan_wali: {
    label: 'Surat Persetujuan Wali Murid',
    icon:  'users',
    color: 'emas',
    groups: [
      {
        title: 'Identitas Surat',
        fields: [
          { name: 'nomorSurat', label: 'Nomor Surat', type: 'text',
            placeholder: '003/PST/VI/2026', required: true },
          { name: 'perihal',    label: 'Perihal Persetujuan', type: 'text',
            placeholder: 'Persetujuan Keikutsertaan Kegiatan Wisata Edukasi', required: true },
        ],
      },
      {
        title: 'Data Siswa',
        fields: [
          { name: 'namaSiswa', label: 'Nama Siswa', type: 'text', required: true },
          { name: 'kelas',     label: 'Kelas', type: 'select',
            options: DAFTAR_KELAS.map(k => ({ value: k, label: k })), required: true },
          { name: 'namaWali',  label: 'Nama Wali Murid', type: 'text', required: true },
        ],
      },
      {
        title: 'Isi Surat',
        fields: [
          { name: 'isiPersetujuan', label: 'Isi / Rincian Persetujuan', type: 'textarea', rows: 5,
            placeholder: 'Kami yang bertanda tangan di bawah ini menyatakan persetujuan terhadap...',
            required: true },
          { name: 'penandaTangan', label: 'Penanda Tangan Sekolah', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // 4. SURAT KETERANGAN
  // ----------------------------------------------------------
  surat_keterangan: {
    label: 'Surat Keterangan',
    icon:  'doc',
    color: 'cyan',
    groups: [
      {
        title: 'Identitas Surat',
        fields: [
          { name: 'nomorSurat', label: 'Nomor Surat', type: 'text',
            placeholder: '004/SK/VI/2026', required: true },
        ],
      },
      {
        title: 'Data Pihak yang Diterangkan',
        fields: [
          { name: 'namaPihak',   label: 'Nama Lengkap', type: 'text', required: true },
          { name: 'identitas',   label: 'NISN / NIP / NIK', type: 'text',
            optional: true, placeholder: 'Isi sesuai kebutuhan' },
          { name: 'ttl',         label: 'Tempat, Tanggal Lahir', type: 'text',
            placeholder: 'Pringgabaya, 01 Januari 2015', optional: true },
          { name: 'alamat',      label: 'Alamat', type: 'textarea', rows: 2,
            placeholder: 'Jl. Raya Pringgabaya, Lombok Timur', optional: true },
        ],
      },
      {
        title: 'Isi Keterangan',
        fields: [
          { name: 'isiKeterangan', label: 'Isi Keterangan', type: 'textarea', rows: 4,
            placeholder: 'Yang bersangkutan adalah benar siswa aktif di SD Negeri 3 Pringgabaya...',
            required: true },
          { name: 'keperluan',     label: 'Keperluan / Tujuan Surat', type: 'text',
            placeholder: 'Melengkapi persyaratan beasiswa', required: true },
          { name: 'penandaTangan', label: 'Penanda Tangan', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // 5. SK PANITIA
  // ----------------------------------------------------------
  sk_panitia: {
    label: 'SK Panitia',
    icon:  'badge',
    color: 'ungu',
    groups: [
      {
        title: 'Identitas SK',
        fields: [
          { name: 'nomorSK',    label: 'Nomor SK', type: 'text',
            placeholder: '005/SK-P/VI/2026', required: true },
          { name: 'tentang',    label: 'Tentang', type: 'text',
            placeholder: 'Pembentukan Panitia Ujian Akhir Semester Genap', required: true },
          { name: 'namaKegiatan', label: 'Nama Kegiatan', type: 'text',
            placeholder: 'Ujian Akhir Semester Genap TA 2025/2026', required: true },
          { name: 'tahunPelajaran', label: 'Tahun Pelajaran', type: 'text',
            placeholder: '2025/2026', required: true },
        ],
      },
      {
        title: 'Dasar Pertimbangan',
        fields: [
          { name: 'dasarPertimbangan', label: 'Dasar Pertimbangan / Konsideran', type: 'textarea', rows: 4,
            placeholder: '1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional\n2. ...',
            optional: true },
        ],
      },
      {
        title: 'Susunan Panitia',
        fields: [
          { name: 'daftarPanitia', label: 'Daftar Panitia', type: 'textarea', rows: 6,
            placeholder: 'Ketua       : Nama Lengkap, S.Pd.\nSekretaris  : Nama Lengkap\nBendahara   : Nama Lengkap\nAnggota     :\n1. Nama Lengkap\n2. Nama Lengkap',
            required: true },
          { name: 'tugasPanitia', label: 'Tugas Panitia', type: 'textarea', rows: 4,
            placeholder: '1. Menyusun dan melaksanakan rencana kegiatan\n2. Membuat laporan pelaksanaan kegiatan\n3. Bertanggung jawab kepada Kepala Sekolah',
            optional: true },
        ],
      },
      {
        title: 'Pengesahan',
        fields: [
          { name: 'tanggalDitetapkan', label: 'Tanggal Ditetapkan', type: 'date', required: true },
          { name: 'penandaTangan',     label: 'Penanda Tangan', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // 6. BERITA ACARA
  // ----------------------------------------------------------
  berita_acara: {
    label: 'Berita Acara',
    icon:  'clipboard',
    color: 'merah',
    groups: [
      {
        title: 'Identitas Berita Acara',
        fields: [
          { name: 'nomorBA',      label: 'Nomor Berita Acara', type: 'text',
            placeholder: '006/BA/VI/2026', required: true },
          { name: 'namaKegiatan', label: 'Nama Kegiatan', type: 'text',
            placeholder: 'Serah Terima Jabatan Kepala Perpustakaan', required: true },
        ],
      },
      {
        title: 'Waktu & Tempat',
        fields: [
          { name: 'hari',    label: 'Hari',    type: 'text',
            placeholder: 'Senin', required: true },
          { name: 'tanggal', label: 'Tanggal', type: 'date', required: true },
          { name: 'waktu',   label: 'Waktu',   type: 'text',
            placeholder: '10.00 WITA s.d. selesai', required: true },
          { name: 'tempat',  label: 'Tempat',  type: 'text',
            placeholder: 'Ruang Perpustakaan SD Negeri 3 Pringgabaya', required: true },
        ],
      },
      {
        title: 'Para Pihak',
        fields: [
          { name: 'pihakPertama', label: 'Pihak Pertama (Penyerah)', type: 'text',
            placeholder: 'Nama — Jabatan', required: true },
          { name: 'pihakKedua',   label: 'Pihak Kedua (Penerima)', type: 'text',
            placeholder: 'Nama — Jabatan', required: true },
        ],
      },
      {
        title: 'Isi Berita Acara',
        fields: [
          { name: 'uraianKegiatan', label: 'Uraian Kegiatan', type: 'textarea', rows: 4,
            placeholder: 'Pada hari ini telah dilaksanakan serah terima...', required: true },
          { name: 'hasilKegiatan',  label: 'Hasil Kegiatan / Kesimpulan', type: 'textarea', rows: 3,
            placeholder: 'Kegiatan berjalan lancar dan...', optional: true },
          { name: 'penandaTangan',  label: 'Penanda Tangan / Pemimpin Acara', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // 7. PROPOSAL KEGIATAN
  // ----------------------------------------------------------
  proposal_kegiatan: {
    label: 'Proposal Kegiatan',
    icon:  'list',
    color: 'hijau',
    groups: [
      {
        title: 'Identitas Proposal',
        fields: [
          { name: 'nomorDokumen',  label: 'Nomor Dokumen', type: 'text',
            placeholder: '007/PP/VI/2026', optional: true },
          { name: 'namaKegiatan',  label: 'Nama Kegiatan', type: 'text',
            placeholder: 'Pentas Seni Akhir Tahun Pelajaran 2025/2026', required: true },
          { name: 'tanggal',       label: 'Tanggal Rencana Kegiatan', type: 'date', required: true },
        ],
      },
      {
        title: 'Latar Belakang & Tujuan',
        fields: [
          { name: 'latarBelakang', label: 'Latar Belakang', type: 'textarea', rows: 5,
            placeholder: 'Dalam rangka mengembangkan bakat dan potensi siswa...', required: true },
          { name: 'tujuan',        label: 'Tujuan Kegiatan', type: 'textarea', rows: 3,
            placeholder: '1. Mengembangkan kreativitas siswa\n2. Mempererat kebersamaan\n3. ...', required: true },
        ],
      },
      {
        title: 'Pelaksanaan & Anggaran',
        fields: [
          { name: 'waktuPelaksanaan', label: 'Waktu Pelaksanaan', type: 'text',
            placeholder: 'Sabtu, 20 Juni 2026 pukul 08.00 WITA', required: true },
          { name: 'tempatPelaksanaan', label: 'Tempat Pelaksanaan', type: 'text',
            placeholder: 'Halaman SD Negeri 3 Pringgabaya', required: true },
          { name: 'sasaran',          label: 'Sasaran / Peserta', type: 'text',
            placeholder: 'Seluruh siswa kelas I–VI', optional: true },
          { name: 'anggaran',         label: 'Perkiraan Anggaran', type: 'text',
            placeholder: 'Rp 5.000.000 (Lima Juta Rupiah)', optional: true },
        ],
      },
      {
        title: 'Pengesahan',
        fields: [
          { name: 'penandaTangan', label: 'Penanda Tangan', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },

  // ----------------------------------------------------------
  // 8. NOTULEN RAPAT
  // ----------------------------------------------------------
  notulen_rapat: {
    label: 'Notulen Rapat',
    icon:  'list',
    color: 'navy',
    groups: [
      {
        title: 'Identitas Rapat',
        fields: [
          { name: 'nomorDokumen', label: 'Nomor Notulen', type: 'text',
            placeholder: '008/NTL/VI/2026', optional: true },
          { name: 'agenda',       label: 'Agenda Rapat', type: 'text',
            placeholder: 'Rapat Persiapan Ujian Akhir Semester', required: true },
          { name: 'tanggalRapat', label: 'Tanggal Rapat', type: 'date', required: true },
          { name: 'waktu',        label: 'Waktu', type: 'text',
            placeholder: '09.00 – 11.00 WITA', required: true },
          { name: 'tempat',       label: 'Tempat', type: 'text',
            placeholder: 'Ruang Rapat SD Negeri 3 Pringgabaya', required: true },
        ],
      },
      {
        title: 'Peserta & Pemimpin',
        fields: [
          { name: 'pemimpinRapat', label: 'Pemimpin Rapat', type: 'text',
            placeholder: 'Maturiadi, S.Pd.', required: true },
          { name: 'peserta',       label: 'Peserta Rapat', type: 'textarea', rows: 4,
            placeholder: '1. Nama — Jabatan\n2. Nama — Jabatan\n3. ...', required: true },
        ],
      },
      {
        title: 'Isi Notulen',
        fields: [
          { name: 'hasilRapat',     label: 'Hasil / Keputusan Rapat', type: 'textarea', rows: 6,
            placeholder: '1. Disepakati bahwa...\n2. Diputuskan bahwa...\n3. ...', required: true },
          { name: 'tindakLanjut',   label: 'Tindak Lanjut', type: 'textarea', rows: 3,
            placeholder: '1. Bagian kurikulum menyiapkan jadwal paling lambat...\n2. ...', optional: true },
          { name: 'notulis',        label: 'Notulis', type: 'text', required: true },
          { name: 'penandaTangan',  label: 'Penanda Tangan', type: 'select',
            options: PENANDA_TANGAN_OPTIONS, required: true },
        ],
      },
    ],
  },
}

// ============================================================
// === DEFAULT MASTER DATA SEKOLAH
// Digunakan sebagai nilai awal sebelum admin menyimpan perubahan.
// Struktur ini HARUS sinkron dengan form di MasterData.jsx
// dan dengan payload yang dikirim ke GAS action 'saveMasterData'.
// ============================================================
export const DEFAULT_MASTER_DATA = {
  // — Identitas Sekolah —
  namaSekolah:   'SD Negeri 3 Pringgabaya',
  npsn:          '50205367',
  alamat:        'Jl. Raya Pringgabaya',
  kecamatan:     'Pringgabaya',
  kabupaten:     'Lombok Timur',
  provinsi:      'Nusa Tenggara Barat',
  telepon:       '(0376) 21XXX',
  website:       'www.sdn3pringgabaya.sch.id',
  email:         'sdn3pringgabaya@gmail.com',

  // — Brand —
  brand:         'SDENTIBAYA',
  slogan:        'SDENTIBAYA MELAJU',
  tahunAjaran:   '2025/2026',

  // — Kepala Sekolah —
  namaKepsek:    'Maturiadi, S.Pd.',
  nipKepsek:     '19XXXXXXXXXXXXXX',
  pangkatKepsek: 'Pembina, IV/a',

  // — Aset Digital (URL, opsional) —
  urlLogo:          '',   // URL logo sekolah
  urlTtd:           '',   // URL tanda tangan digital kepsek (opsional)
  urlStempel:       '',   // URL stempel/cap sekolah (opsional)
}

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

// ============================================================
// === DUMMY DATA ARSIP DOKUMEN
// 15 entri, mencakup semua jenis dokumen & 3 status
// ============================================================
export const STATUS_DOKUMEN = [
  { value: 'berhasil', label: 'Berhasil' },
  { value: 'draft',    label: 'Draft'    },
  { value: 'gagal',    label: 'Gagal'    },
]

export const DUMMY_ARSIP_DOKUMEN = [
  {
    id: 'DOC-001',
    tanggal:     '2026-06-05',
    jenis:       'Surat Undangan Rapat',
    jenisValue:  'undangan_rapat',
    nomorSurat:  '012/UN/VI/2026',
    perihal:     'Rapat Koordinasi Persiapan Ujian Kelas VI',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-001/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-001/view',
  },
  {
    id: 'DOC-002',
    tanggal:     '2026-06-03',
    jenis:       'Berita Acara',
    jenisValue:  'berita_acara',
    nomorSurat:  '011/BA/VI/2026',
    perihal:     'Serah Terima Pengelolaan Perpustakaan',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-002/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-002/view',
  },
  {
    id: 'DOC-003',
    tanggal:     '2026-05-28',
    jenis:       'SK Panitia',
    jenisValue:  'sk_panitia',
    nomorSurat:  '010/SKP/V/2026',
    perihal:     'Panitia Pelaksanaan Ujian Akhir Semester Genap TA 2025/2026',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-003/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-003/view',
  },
  {
    id: 'DOC-004',
    tanggal:     '2026-05-20',
    jenis:       'Surat Pemberitahuan Orang Tua',
    jenisValue:  'pemberitahuan_ortu',
    nomorSurat:  '009/PB/V/2026',
    perihal:     'Pemberitahuan Jadwal Ujian Semester Genap',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-004/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-004/view',
  },
  {
    id: 'DOC-005',
    tanggal:     '2026-05-15',
    jenis:       'Proposal Kegiatan',
    jenisValue:  'proposal_kegiatan',
    nomorSurat:  '008/PP/V/2026',
    perihal:     'Proposal Kegiatan Pentas Seni Akhir Tahun Pelajaran 2025/2026',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-005/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-005/view',
  },
  {
    id: 'DOC-006',
    tanggal:     '2026-05-10',
    jenis:       'Surat Keterangan',
    jenisValue:  'surat_keterangan',
    nomorSurat:  '007/SK/V/2026',
    perihal:     'Keterangan Masih Aktif Bersekolah — Ahmad Fauzi',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-006/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-006/view',
  },
  {
    id: 'DOC-007',
    tanggal:     '2026-05-08',
    jenis:       'Notulen Rapat',
    jenisValue:  'notulen_rapat',
    nomorSurat:  '006/NTL/V/2026',
    perihal:     'Notulen Rapat Pembahasan Anggaran BOS Triwulan II',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-007/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-007/view',
  },
  {
    id: 'DOC-008',
    tanggal:     '2026-05-05',
    jenis:       'Surat Persetujuan Wali Murid',
    jenisValue:  'persetujuan_wali',
    nomorSurat:  '005/PST/V/2026',
    perihal:     'Persetujuan Keikutsertaan Wisata Edukasi Kelas V',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-008/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-008/view',
  },
  {
    id: 'DOC-009',
    tanggal:     '2026-04-28',
    jenis:       'Surat Undangan Rapat',
    jenisValue:  'undangan_rapat',
    nomorSurat:  '004/UN/IV/2026',
    perihal:     'Undangan Rapat Pleno Kenaikan Kelas',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-009/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-009/view',
  },
  {
    id: 'DOC-010',
    tanggal:     '2026-04-20',
    jenis:       'SK Panitia',
    jenisValue:  'sk_panitia',
    nomorSurat:  '003/SKP/IV/2026',
    perihal:     'SK Panitia Penerimaan Peserta Didik Baru TA 2026/2027',
    dibuatOleh:  'Admin',
    status:      'draft',
    docsUrl:     '',
    pdfUrl:      '',
  },
  {
    id: 'DOC-011',
    tanggal:     '2026-04-15',
    jenis:       'Berita Acara',
    jenisValue:  'berita_acara',
    nomorSurat:  '002/BA/IV/2026',
    perihal:     'Berita Acara Pemeriksaan Barang Inventaris Semester Genap',
    dibuatOleh:  'Admin',
    status:      'draft',
    docsUrl:     '',
    pdfUrl:      '',
  },
  {
    id: 'DOC-012',
    tanggal:     '2026-04-10',
    jenis:       'Proposal Kegiatan',
    jenisValue:  'proposal_kegiatan',
    nomorSurat:  '001/PP/IV/2026',
    perihal:     'Proposal Kegiatan Class Meeting Semester Genap',
    dibuatOleh:  'Admin',
    status:      'draft',
    docsUrl:     '',
    pdfUrl:      '',
  },
  {
    id: 'DOC-013',
    tanggal:     '2026-04-05',
    jenis:       'Surat Keterangan',
    jenisValue:  'surat_keterangan',
    nomorSurat:  '015/SK/IV/2026',
    perihal:     'Keterangan Pindah Sekolah — Baiq Nurfadila',
    dibuatOleh:  'Admin',
    status:      'gagal',
    docsUrl:     '',
    pdfUrl:      '',
  },
  {
    id: 'DOC-014',
    tanggal:     '2026-03-25',
    jenis:       'Surat Pemberitahuan Orang Tua',
    jenisValue:  'pemberitahuan_ortu',
    nomorSurat:  '014/PB/III/2026',
    perihal:     'Pemberitahuan Libur Hari Raya Nyepi',
    dibuatOleh:  'Admin',
    status:      'gagal',
    docsUrl:     '',
    pdfUrl:      '',
  },
  {
    id: 'DOC-015',
    tanggal:     '2026-03-18',
    jenis:       'Notulen Rapat',
    jenisValue:  'notulen_rapat',
    nomorSurat:  '013/NTL/III/2026',
    perihal:     'Notulen Rapat Pembahasan Program Kerja Semester Genap',
    dibuatOleh:  'Admin',
    status:      'berhasil',
    docsUrl:     'https://docs.google.com/document/d/dummy-015/edit',
    pdfUrl:      'https://drive.google.com/file/d/dummy-015/view',
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
