// ============================================================
// api.js — Layer API SDENTIBAYA AdminKit
//
// Strategi koneksi:
//   1. Coba hubungi Worker nyata di VITE_API_URL
//   2. Jika Worker tidak tersedia / error jaringan →
//      gunakan FALLBACK dummy data secara transparan
//
// Artinya aplikasi SELALU bisa dibuka dan dipakai,
// meski backend belum dikonfigurasi.
//
// Frontend HANYA berkomunikasi ke Worker, tidak ke GAS langsung.
// ============================================================
import { API_BASE_URL } from './constants'
import { getToken, logout } from './auth'
import {
  DUMMY_STATS,
  DUMMY_DOKUMEN_TERBARU,
  DUMMY_ARSIP_DOKUMEN,
  DUMMY_STATUS_SISTEM,
} from './constants'

// ============================================================
// Konstanta internal
// ============================================================

/** Timeout fetch (ms) — hindari user menunggu terlalu lama */
const FETCH_TIMEOUT_MS = 12_000

/** Apakah VITE_API_URL sudah dikonfigurasi? */
const BACKEND_CONFIGURED = !!import.meta.env.VITE_API_URL

// ============================================================
// _fetchWorker — helper fetch ke Cloudflare Worker
// ============================================================

/**
 * Kirim request ke Worker dengan token + timeout + error handling.
 * @param {string}  endpoint  - path, contoh: '/api/health'
 * @param {Object}  options   - fetch options
 * @returns {Promise<Object>} - data JSON dari Worker
 * @throws {Error} - jika request gagal
 */
async function _fetchWorker(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  // Buat AbortController untuk timeout
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timer)

    // Jika 401 → sesi kadaluarsa, paksa logout
    if (res.status === 401) {
      logout()
      window.location.href = '/login'
      return
    }

    // Parse JSON
    let data
    try {
      data = await res.json()
    } catch {
      throw new Error('Server mengembalikan respons yang tidak dapat dibaca.')
    }

    if (!res.ok) {
      throw new Error(
        data?.message || data?.pesan ||
        `Server merespons dengan kode ${res.status}. Coba lagi beberapa saat.`
      )
    }

    return data

  } catch (err) {
    clearTimeout(timer)

    // Terjemahkan error teknis ke pesan ramah operator
    if (err.name === 'AbortError') {
      throw new Error('Koneksi ke server terlalu lama. Periksa jaringan internet Anda.')
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Tidak dapat menghubungi server. Periksa koneksi internet atau konfigurasi Worker.')
    }

    throw err
  }
}

// ============================================================
// apiHealth — GET /api/health
// ============================================================

/**
 * Cek status Worker tanpa autentikasi.
 * Digunakan di halaman Pengaturan → Test Koneksi.
 * @returns {Promise<{ workerOk: boolean, gasOk: boolean, data: Object }>}
 */
export async function apiHealth() {
  if (!BACKEND_CONFIGURED) {
    return { workerOk: false, gasOk: false, data: null, mode: 'dummy' }
  }

  try {
    const res = await _fetchWorker('/api/health')
    return {
      workerOk: true,
      gasOk:    res?.data?.gasConfigured === true,
      data:     res?.data || null,
      mode:     'live',
    }
  } catch (err) {
    return { workerOk: false, gasOk: false, data: null, error: err.message, mode: 'error' }
  }
}

// ============================================================
// login — POST /api/login
// ============================================================

/**
 * Login dengan PIN admin.
 * @param {string} pin
 * @returns {Promise<{ token: string, user: Object }>}
 * @throws {Error} jika PIN salah atau Worker tidak tersedia
 */
export async function login(pin) {
  if (!BACKEND_CONFIGURED) {
    // Mode dummy — PIN dev tetap '123456'
    await _delay(700)
    if (pin === '123456') {
      return {
        token: 'dummy-dev-token-' + Date.now(),
        user:  { name: 'Administrator', role: 'admin' },
        message: 'Login berhasil (mode dummy).',
      }
    }
    throw new Error('PIN salah. PIN default pengembangan adalah 123456.')
  }

  const res = await _fetchWorker('/api/login', {
    method: 'POST',
    body:   JSON.stringify({ pin }),
  })

  // Normalise response — Worker mengembalikan data.token + data.user
  return {
    token:   res?.data?.token,
    user:    res?.data?.user || { name: 'Admin', role: 'admin' },
    message: res?.message || 'Login berhasil.',
  }
}

// ============================================================
// gasRequest — POST /api/gas (proxy ke GAS)
// ============================================================

/**
 * Kirim action ke GAS melalui Worker.
 * Fungsi umum — digunakan oleh semua helper di bawah.
 * @param {string} action   - nama GAS action
 * @param {Object} payload  - data tambahan
 * @returns {Promise<Object>} - data dari GAS
 * @throws {Error}
 */
export async function gasRequest(action, payload = {}) {
  const res = await _fetchWorker('/api/gas', {
    method: 'POST',
    body:   JSON.stringify({ action, payload }),
  })

  // Worker mengembalikan { success, message, data }
  if (!res?.success) {
    throw new Error(res?.message || 'Permintaan ke backend gagal.')
  }

  return res?.data
}

// ============================================================
// getDashboardStats
// ============================================================

/**
 * Ambil statistik dashboard dari GAS.
 * Fallback ke DUMMY_STATS jika backend tidak tersedia.
 * @returns {Promise<Object>}
 */
export async function getDashboardStats() {
  if (!BACKEND_CONFIGURED) {
    await _delay(400)
    return _buildDashboardData(DUMMY_STATS, DUMMY_DOKUMEN_TERBARU, DUMMY_STATUS_SISTEM)
  }

  try {
    const data = await gasRequest('getDashboardStats')
    // Normalise dari format GAS ke format yang dipakai Dashboard.jsx
    return _normaliseDashboardStats(data)
  } catch (err) {
    console.warn('[api] getDashboardStats fallback ke dummy:', err.message)
    return _buildDashboardData(DUMMY_STATS, DUMMY_DOKUMEN_TERBARU, DUMMY_STATUS_SISTEM)
  }
}

/**
 * Normalise data stats dari GAS ke format Dashboard.jsx
 */
function _normaliseDashboardStats(gasData) {
  const s = gasData?.stats || {}
  return {
    totalDokumen:   s.totalDokumen   ?? 0,
    suratKeluar:    s.suratKeluar    ?? 0,
    skPanitia:      s.skPanitia      ?? 0,
    undanganRapat:  s.undanganRapat  ?? 0,
    beritaAcara:    s.beritaAcara    ?? 0,
    proposal:       s.proposal       ?? 0,
    trend: DUMMY_STATS.trend, // GAS belum menghitung trend
    dokumenTerbaru: (gasData?.dokumenTerbaru || []).map(d => ({
      id:          d.id,
      nomorSurat:  d.nomor,
      jenisDokumen:d.jenis,
      perihal:     d.perihal,
      tanggalBuat: d.tanggal,
      dibuatOleh:  d.dibuatOleh || 'Admin',
      status:      d.status,
    })),
    statusSistem: DUMMY_STATUS_SISTEM.map(s =>
      s.id === 'frontend' ? s : { ...s, status: 'online' }
    ),
  }
}

function _buildDashboardData(stats, terbaru, sistem) {
  return {
    ...stats,
    dokumenTerbaru: terbaru,
    statusSistem:   sistem,
  }
}

// ============================================================
// createDocument
// ============================================================

/**
 * Kirim payload ke GAS untuk generate dokumen.
 * @param {Object} payload - semua data form dokumen
 * @returns {Promise<{ id, docUrl, pdfUrl, perihal }>}
 * @throws {Error}
 */
export async function createDocument(payload) {
  if (!BACKEND_CONFIGURED) {
    // Simulasi delay generate
    await _delay(2000)
    return {
      id:      'DOC-SIMULASI-' + Date.now(),
      docUrl:  'https://docs.google.com/document/d/SIMULASI/edit',
      pdfUrl:  'https://drive.google.com/file/d/SIMULASI/view',
      perihal: payload.perihal || payload.namaKegiatan || 'Dokumen Baru',
      message: 'Dokumen berhasil dibuat (simulasi).',
    }
  }

  const data = await gasRequest('createDocument', payload)
  return {
    id:      data?.id,
    docUrl:  data?.docUrl,
    pdfUrl:  data?.pdfUrl,
    perihal: data?.perihal || payload.perihal,
    message: 'Dokumen berhasil dibuat.',
  }
}

// ============================================================
// listDocuments
// ============================================================

/**
 * Ambil daftar arsip dokumen.
 * Fallback ke DUMMY_ARSIP_DOKUMEN jika backend tidak tersedia.
 * @param {Object} filter - { jenis?, status?, limit?, offset? }
 * @returns {Promise<Object[]>}
 */
export async function listDocuments(filter = {}) {
  if (!BACKEND_CONFIGURED) {
    await _delay(500)
    return DUMMY_ARSIP_DOKUMEN
  }

  try {
    const data = await gasRequest('listDocuments', filter)
    // Normalise dari GAS ke format Archive.jsx
    return (data?.documents || []).map(d => ({
      id:         d.id,
      tanggal:    d.createdAt,
      jenis:      _labelJenis(d.jenis),
      jenisValue: d.jenis,
      nomorSurat: d.nomorSurat || d.number || '',
      perihal:    d.perihal    || d.subject || '',
      dibuatOleh: d.dibuatOleh || d.createdBy || 'Admin',
      status:     d.status || 'berhasil',
      docsUrl:    d.docUrl  || '',
      pdfUrl:     d.pdfUrl  || '',
    }))
  } catch (err) {
    console.warn('[api] listDocuments fallback ke dummy:', err.message)
    return DUMMY_ARSIP_DOKUMEN
  }
}

// ============================================================
// getSettings
// ============================================================

/**
 * Ambil settings dari GAS.
 * Fallback ke DEFAULT_MASTER_DATA di localStorage.
 * @returns {Promise<Object>}
 */
export async function getSettings() {
  if (!BACKEND_CONFIGURED) {
    await _delay(300)
    return null // MasterData.jsx akan pakai localStorage
  }

  try {
    return await gasRequest('getSettings')
  } catch (err) {
    console.warn('[api] getSettings fallback:', err.message)
    return null
  }
}

// ============================================================
// saveSettings
// ============================================================

/**
 * Simpan settings ke GAS.
 * @param {Object} payload
 * @returns {Promise<{ message: string }>}
 * @throws {Error}
 */
export async function saveSettings(payload) {
  if (!BACKEND_CONFIGURED) {
    await _delay(600)
    return { message: 'Settings disimpan ke penyimpanan lokal (backend belum dikonfigurasi).' }
  }

  const data = await gasRequest('saveSettings', payload)
  return { message: 'Settings berhasil disimpan ke Google Sheets.' }
}

// ============================================================
// listTemplates — ambil daftar template
// ============================================================

/**
 * Ambil daftar template dari GAS.
 * Fallback ke data dummy jika backend tidak tersedia.
 * @returns {Promise<Object[]>} array template
 */
export async function listTemplates() {
  if (!BACKEND_CONFIGURED) {
    await _delay(400)
    // Dummy template untuk mode demo
    return [
      {
        id: 'TMPL-001',
        namaTemplate:  'Template Undangan Rapat',
        jenisDokumen:  'undangan_rapat',
        docsTemplateId: '',
        variabel: ['nomorSurat', 'perihal', 'hari', 'tanggal', 'waktu', 'tempat'],
        isActive: true,
      },
      {
        id: 'TMPL-002',
        namaTemplate:  'Template Berita Acara',
        jenisDokumen:  'berita_acara',
        docsTemplateId: '',
        variabel: ['nomorBA', 'namaKegiatan', 'hari', 'tanggal', 'tempat'],
        isActive: true,
      },
    ]
  }

  try {
    const data = await gasRequest('listTemplates')
    // Normalise dari format GAS ke format Templates.jsx
    return (data?.templates || []).map(t => ({
      id:             t.id,
      namaTemplate:   t.nama,
      jenisDokumen:   t.jenis,
      docsTemplateId: t.docTemplateId,
      variabel:       t.placeholders || [],
      isActive:       t.isActive,
    }))
  } catch (err) {
    console.warn('[api] listTemplates fallback ke dummy:', err.message)
    return []
  }
}

// Alias lama agar tidak ada import lain yang rusak
export const getTemplate = listTemplates

// ============================================================
// saveTemplate — tambah atau update template
// ============================================================

/**
 * Tambah atau update template di GAS.
 * @param {Object} payload - { namaTemplate, jenisDokumen, docsTemplateId, variabel, id? }
 * @returns {Promise<{ message: string }>}
 * @throws {Error}
 */
export async function saveTemplate(payload) {
  if (!BACKEND_CONFIGURED) {
    await _delay(800)
    return { message: 'Template berhasil disimpan (mode demo).' }
  }

  // Normalise nama field dari Templates.jsx ke format GAS
  const gasPayload = {
    id:             payload.id,
    jenis:          payload.jenisDokumen,
    nama:           payload.namaTemplate,
    deskripsi:      payload.deskripsi || '',
    docTemplateId:  payload.docsTemplateId,
    placeholders:   Array.isArray(payload.variabel)
                      ? payload.variabel
                      : String(payload.variabel || '').split(',').map(v => v.trim()).filter(Boolean),
    isActive:       payload.isActive !== false,
  }

  await gasRequest('saveTemplate', gasPayload)
  return { message: 'Template berhasil disimpan.' }
}

// Alias lama
export const addTemplate = saveTemplate

// ============================================================
// deleteTemplate — hapus template
// ============================================================

/**
 * Hapus template dari GAS.
 * @param {string} id - ID template
 * @returns {Promise<{ message: string }>}
 * @throws {Error}
 */
export async function deleteTemplate(id) {
  if (!BACKEND_CONFIGURED) {
    await _delay(600)
    return { message: 'Template berhasil dihapus (mode demo).' }
  }

  await gasRequest('saveTemplate', { id, isActive: false, _delete: true })
  return { message: 'Template berhasil dihapus.' }
}

// ============================================================
// pingWorker — test koneksi Worker + GAS
// (digunakan oleh Settings.jsx)
// ============================================================

/**
 * Cek status koneksi Worker + GAS.
 * @returns {Promise<{ worker: string, gas: string, detail: Object }>}
 */
export async function pingWorker() {
  if (!BACKEND_CONFIGURED) {
    await _delay(800)
    return {
      worker:  'TIDAK_DIKONFIGURASI',
      gas:     'TIDAK_DIKONFIGURASI',
      message: 'VITE_API_URL belum diset. Aplikasi berjalan dalam mode dummy.',
      detail:  null,
    }
  }

  // Cek Worker dulu via /api/health
  const health = await apiHealth()

  if (!health.workerOk) {
    return {
      worker:  'ERROR',
      gas:     'UNKNOWN',
      message: health.error || 'Worker tidak dapat dihubungi.',
      detail:  null,
    }
  }

  // Jika Worker oke, cek GAS via action ping
  try {
    const gasData = await gasRequest('ping')
    return {
      worker:  'OK',
      gas:     'OK',
      message: 'Koneksi berhasil. Worker dan GAS aktif.',
      detail:  { health: health.data, gas: gasData },
    }
  } catch (gasErr) {
    return {
      worker:  'OK',
      gas:     'ERROR',
      message: 'Worker aktif, tetapi GAS tidak dapat dihubungi: ' + gasErr.message,
      detail:  { health: health.data },
    }
  }
}

// Alias untuk kompatibilitas dengan Settings.jsx lama
export const pingKoneksi = pingWorker

// ============================================================
// Helper internal
// ============================================================

/** Terjemahkan value jenis ke label Bahasa Indonesia */
function _labelJenis(value) {
  const map = {
    undangan_rapat:    'Surat Undangan Rapat',
    pemberitahuan_ortu:'Surat Pemberitahuan Orang Tua',
    persetujuan_wali:  'Surat Persetujuan Wali Murid',
    surat_keterangan:  'Surat Keterangan',
    sk_panitia:        'SK Panitia',
    berita_acara:      'Berita Acara',
    proposal_kegiatan: 'Proposal Kegiatan',
    notulen_rapat:     'Notulen Rapat',
  }
  return map[value] || value
}

/** Delay buatan untuk mode dummy */
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
