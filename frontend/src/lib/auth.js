// ============================================================
// auth.js — Manajemen sesi autentikasi SDENTIBAYA AdminKit
// Menyimpan token + data user ke localStorage agar tetap
// login setelah refresh halaman.
// ============================================================
import { SESSION_KEY } from './constants'

// Kunci localStorage untuk data user
const USER_KEY = 'sdentibaya_user'

// ============================================================
// saveSession — simpan token + data user setelah login
// ============================================================

/**
 * Simpan session ke localStorage setelah login berhasil.
 * @param {string} token
 * @param {Object} user - { name, role }
 */
export function saveSession(token, user) {
  try {
    localStorage.setItem(SESSION_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}))
  } catch (err) {
    // Fallback ke sessionStorage jika localStorage tidak tersedia
    sessionStorage.setItem(SESSION_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user || {}))
  }
}

// ============================================================
// getSession — ambil session yang tersimpan
// ============================================================

/**
 * Ambil session dari localStorage.
 * @returns {{ token: string|null, user: Object|null }}
 */
export function getSession() {
  try {
    const token = localStorage.getItem(SESSION_KEY)
      || sessionStorage.getItem(SESSION_KEY)
      || null

    const rawUser = localStorage.getItem(USER_KEY)
      || sessionStorage.getItem(USER_KEY)
      || null

    const user = rawUser ? JSON.parse(rawUser) : null

    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

// ============================================================
// getToken — ambil token saja (untuk Authorization header)
// ============================================================

/**
 * Ambil token dari storage.
 * @returns {string|null}
 */
export function getToken() {
  return getSession().token
}

// ============================================================
// isAuthenticated — cek apakah sudah login
// ============================================================

/**
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken()
}

// ============================================================
// logout — hapus session dari storage
// ============================================================

/**
 * Hapus semua data session.
 */
export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(USER_KEY)
  } catch {
    // silent fail
  }
}

// ─── Alias lama agar tidak ada import yang rusak ──────────────
export const saveToken    = (token) => saveSession(token, null)
export const removeToken  = logout
export const isLoggedIn   = isAuthenticated
