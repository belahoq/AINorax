// ============================================================
// api.js — Fungsi API call ke Cloudflare Worker
// Frontend HANYA berkomunikasi ke Worker, tidak pernah ke GAS langsung
// ============================================================
import { API_BASE_URL } from './constants'
import { getToken, removeToken } from './auth'

/**
 * Helper fetch dengan auth header otomatis
 * @param {string} endpoint - contoh: '/api/dashboard/stats'
 * @param {object} options  - fetch options (method, body, dll.)
 */
async function fetchAPI(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Jika 401 → token expired, paksa logout
  if (res.status === 401) {
    removeToken()
    window.location.href = '/login'
    return
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.pesan || data.message || 'Terjadi kesalahan pada server.')
  }

  return data
}

// ============================================================
// AUTH
// ============================================================

/** Login dengan PIN */
export async function login(pin) {
  // -- MODE DUMMY (sebelum Worker tersedia) --
  // Hapus blok ini setelah Worker siap
  if (import.meta.env.DEV) {
    await _delay(800)
    if (pin === '123456') {
      return { token: 'dummy-token-dev-123', pesan: 'Login berhasil' }
    }
    throw new Error('PIN salah. Silakan coba lagi.')
  }
  // -- END MODE DUMMY --

  return fetchAPI('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
}

// ============================================================
// DASHBOARD
// ============================================================

/** Ambil statistik dashboard */
export async function getDashboardStats() {
  if (import.meta.env.DEV) {
    await _delay(500)
    return {
      dokumenBulanIni: 12,
      totalArsip: 47,
      totalTemplate: 8,
      dokumenTerakhir: [
        { id: '1', jenis: 'Surat Undangan Rapat',      perihal: 'Rapat Komite Sekolah',        tanggal: '2026-06-05' },
        { id: '2', jenis: 'Berita Acara',              perihal: 'Serah Terima Jabatan',         tanggal: '2026-06-03' },
        { id: '3', jenis: 'Surat Pemberitahuan Orang Tua', perihal: 'Libur Hari Raya Idul Adha', tanggal: '2026-06-01' },
      ],
    }
  }
  return fetchAPI('/api/dashboard/stats')
}

// ============================================================
// DOKUMEN
// ============================================================

/** Buat dokumen baru */
export async function buatDokumen(payload) {
  if (import.meta.env.DEV) {
    await _delay(1500)
    return {
      docsUrl: 'https://docs.google.com/document/d/dummy-id/edit',
      pdfUrl:  'https://drive.google.com/file/d/dummy-id/view',
      pesan:   'Dokumen berhasil dibuat.',
    }
  }
  return fetchAPI('/api/dokumen/buat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Ambil daftar arsip dokumen */
export async function getArsipDokumen() {
  if (import.meta.env.DEV) {
    await _delay(600)
    return {
      data: [
        { id: '1', jenisDokumen: 'Surat Undangan Rapat',       nomorSurat: '001/UN/VI/2026', perihal: 'Rapat Komite Sekolah',          tanggalBuat: '2026-06-05', docsUrl: '#', pdfUrl: '#' },
        { id: '2', jenisDokumen: 'Berita Acara',               nomorSurat: '002/BA/VI/2026', perihal: 'Serah Terima Jabatan',           tanggalBuat: '2026-06-03', docsUrl: '#', pdfUrl: '#' },
        { id: '3', jenisDokumen: 'Surat Keterangan',           nomorSurat: '003/SK/VI/2026', perihal: 'Keterangan Masih Sekolah',      tanggalBuat: '2026-06-01', docsUrl: '#', pdfUrl: '#' },
        { id: '4', jenisDokumen: 'SK Panitia',                 nomorSurat: '004/SKP/V/2026', perihal: 'Panitia Ujian Kelas VI',        tanggalBuat: '2026-05-20', docsUrl: '#', pdfUrl: '#' },
        { id: '5', jenisDokumen: 'Surat Pemberitahuan Orang Tua', nomorSurat: '005/PB/V/2026', perihal: 'Pemberitahuan Ujian Nasional', tanggalBuat: '2026-05-15', docsUrl: '#', pdfUrl: '#' },
      ],
    }
  }
  return fetchAPI('/api/dokumen/arsip')
}

/** Hapus dokumen */
export async function hapusDokumen(id) {
  if (import.meta.env.DEV) {
    await _delay(600)
    return { pesan: 'Dokumen berhasil dihapus.' }
  }
  return fetchAPI(`/api/dokumen/${id}`, { method: 'DELETE' })
}

// ============================================================
// MASTER DATA
// ============================================================

/** Ambil data master sekolah */
export async function getMasterData() {
  if (import.meta.env.DEV) {
    await _delay(400)
    return {
      namaSekolah:  'SD Negeri 3 Pringgabaya',
      npsn:         '50205367',
      alamat:       'Jl. Raya Pringgabaya, Kec. Pringgabaya, Kab. Lombok Timur, NTB',
      telepon:      '(0376) 21XXX',
      website:      'www.sdn3pringgabaya.sch.id',
      email:        'sdn3pringgabaya@gmail.com',
      namaKepsek:   'Maturiadi, S.Pd.',
      nipKepsek:    '19XXXXXXXXXXXXXX',
      tahunAjaran:  '2025/2026',
    }
  }
  return fetchAPI('/api/master')
}

/** Update data master sekolah */
export async function updateMasterData(payload) {
  if (import.meta.env.DEV) {
    await _delay(800)
    return { pesan: 'Data master berhasil diperbarui.' }
  }
  return fetchAPI('/api/master', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ============================================================
// TEMPLATE
// ============================================================

/** Ambil daftar template */
export async function getTemplate() {
  if (import.meta.env.DEV) {
    await _delay(400)
    return {
      data: [
        { id: '1', namaTemplate: 'Template Undangan Rapat',          jenisDokumen: 'Surat Undangan Rapat',       docsTemplateId: 'dummy-1', variabel: ['nomorSurat','perihal','tanggal','waktu','tempat'] },
        { id: '2', namaTemplate: 'Template Pemberitahuan Orang Tua', jenisDokumen: 'Surat Pemberitahuan Orang Tua', docsTemplateId: 'dummy-2', variabel: ['nomorSurat','namaSiswa','kelas','isiPemberitahuan'] },
        { id: '3', namaTemplate: 'Template Berita Acara',            jenisDokumen: 'Berita Acara',               docsTemplateId: 'dummy-3', variabel: ['nomorBA','kegiatan','tanggal','tempat','peserta'] },
      ],
    }
  }
  return fetchAPI('/api/template')
}

/** Tambah template baru */
export async function addTemplate(payload) {
  if (import.meta.env.DEV) {
    await _delay(800)
    return { pesan: 'Template berhasil ditambahkan.' }
  }
  return fetchAPI('/api/template', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Hapus template */
export async function deleteTemplate(id) {
  if (import.meta.env.DEV) {
    await _delay(600)
    return { pesan: 'Template berhasil dihapus.' }
  }
  return fetchAPI(`/api/template/${id}`, { method: 'DELETE' })
}

// ============================================================
// PENGATURAN / PING
// ============================================================

/** Ping Worker + GAS */
export async function pingKoneksi() {
  if (import.meta.env.DEV) {
    await _delay(1000)
    return { worker: 'OK', gas: 'OK', pesan: 'Koneksi berhasil (mode dev)' }
  }
  return fetchAPI('/api/ping')
}

// ============================================================
// Helper
// ============================================================

/** Delay buatan untuk mode dummy */
function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
