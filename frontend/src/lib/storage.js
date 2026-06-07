// ============================================================
// storage.js — Helper localStorage untuk SDENTIBAYA AdminKit
// Semua key tersentralisasi di sini agar mudah dikelola.
// ============================================================

// === Kunci localStorage =====================================
export const STORAGE_KEYS = {
  MASTER_DATA: 'sdentibaya_master_data',
  // tambahkan kunci lain di sini saat dibutuhkan
  // TEMPLATES:   'sdentibaya_templates',
  // USER_PREFS:  'sdentibaya_user_prefs',
}

// ============================================================
// Generic helpers
// ============================================================

/**
 * Simpan nilai ke localStorage sebagai JSON.
 * @param {string} key
 * @param {*}      value
 * @returns {boolean} true jika berhasil
 */
export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn('[storage] storageSet gagal:', key, err)
    return false
  }
}

/**
 * Ambil nilai dari localStorage, parse JSON.
 * @param {string} key
 * @param {*}      fallback — nilai default jika tidak ada / gagal parse
 * @returns {*}
 */
export function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn('[storage] storageGet gagal:', key, err)
    return fallback
  }
}

/**
 * Hapus satu kunci dari localStorage.
 * @param {string} key
 */
export function storageRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.warn('[storage] storageRemove gagal:', key, err)
  }
}

/**
 * Cek apakah localStorage tersedia di browser ini.
 * @returns {boolean}
 */
export function storageAvailable() {
  try {
    const test = '__sdentibaya_test__'
    localStorage.setItem(test, '1')
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// ============================================================
// Master Data helpers — API spesifik
// ============================================================

/**
 * Simpan master data sekolah ke localStorage.
 * @param {object} data — objek master data lengkap
 * @returns {boolean}
 */
export function saveMasterData(data) {
  return storageSet(STORAGE_KEYS.MASTER_DATA, {
    ...data,
    _savedAt: new Date().toISOString(), // timestamp simpan terakhir
  })
}

/**
 * Ambil master data dari localStorage.
 * Jika belum ada, kembalikan null (caller akan pakai DEFAULT).
 * @returns {object|null}
 */
export function loadMasterData() {
  return storageGet(STORAGE_KEYS.MASTER_DATA, null)
}

/**
 * Hapus master data dari localStorage (reset ke default).
 */
export function resetMasterData() {
  storageRemove(STORAGE_KEYS.MASTER_DATA)
}

/**
 * Kapan terakhir master data disimpan.
 * @returns {string|null} — ISO string atau null
 */
export function getMasterDataSavedAt() {
  const data = storageGet(STORAGE_KEYS.MASTER_DATA, null)
  return data?._savedAt ?? null
}
