// ============================================================
// auth.js — Manajemen autentikasi (token di sessionStorage)
// ============================================================
import { SESSION_KEY } from './constants'

/**
 * Simpan token ke sessionStorage setelah login berhasil
 * @param {string} token
 */
export function saveToken(token) {
  sessionStorage.setItem(SESSION_KEY, token)
}

/**
 * Ambil token dari sessionStorage
 * @returns {string|null}
 */
export function getToken() {
  return sessionStorage.getItem(SESSION_KEY)
}

/**
 * Hapus token (logout)
 */
export function removeToken() {
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Cek apakah user sudah login
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!getToken()
}
