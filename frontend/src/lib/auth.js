// ============================================================
// auth.js — Manajemen sesi autentikasi SDENTIBAYA AdminKit
// Mendukung multi-role: admin (PIN) dan operator (email+password)
// ============================================================
import { SESSION_KEY, USER_PROFILE_KEY, USER_ROLES } from './constants'

// Kunci localStorage untuk raw user object dari server
const USER_KEY = 'sdentibaya_user'

// ============================================================
// saveSession — simpan token + data user setelah login
// ============================================================
export function saveSession(token, user) {
  try {
    localStorage.setItem(SESSION_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}))
  } catch {
    sessionStorage.setItem(SESSION_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user || {}))
  }
}

// ============================================================
// getSession — ambil session yang tersimpan
// ============================================================
export function getSession() {
  try {
    const token   = localStorage.getItem(SESSION_KEY)
                 || sessionStorage.getItem(SESSION_KEY)
                 || null
    const rawUser = localStorage.getItem(USER_KEY)
                 || sessionStorage.getItem(USER_KEY)
                 || null
    const user    = rawUser ? JSON.parse(rawUser) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

// ============================================================
// getToken — ambil token untuk Authorization header
// ============================================================
export function getToken() {
  return getSession().token
}

// ============================================================
// getUser — ambil objek user lengkap
// ============================================================
export function getUser() {
  return getSession().user
}

// ============================================================
// getRole — ambil role user yang sedang login
// @returns {'admin'|'operator'|null}
// ============================================================
export function getRole() {
  const user = getUser()
  return user?.role || null
}

// ============================================================
// isAdmin — cek apakah user yang login adalah admin
// ============================================================
export function isAdmin() {
  return getRole() === USER_ROLES.ADMIN
}

// ============================================================
// isAuthenticated — cek apakah sudah login
// ============================================================
export function isAuthenticated() {
  return !!getToken()
}

// ============================================================
// saveProfile — simpan data profil lengkap (foto, jabatan, dll.)
// Dipisah dari session agar bisa diupdate tanpa re-login
// ============================================================
export function saveProfile(profileData) {
  try {
    const existing = getProfile() || {}
    const merged   = { ...existing, ...profileData, _updatedAt: new Date().toISOString() }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(merged))
  } catch {
    // silent fail
  }
}

// ============================================================
// getProfile — ambil data profil lengkap
// ============================================================
export function getProfile() {
  try {
    const raw  = localStorage.getItem(USER_PROFILE_KEY)
    const user = getUser() // data dasar dari token
    const stored = raw ? JSON.parse(raw) : {}
    // Merge: data dari token sebagai base, stored menimpa
    return { ...user, ...stored }
  } catch {
    return getUser()
  }
}

// ============================================================
// logout — hapus semua data session dan profil
// ============================================================
export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(USER_PROFILE_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(USER_KEY)
  } catch {
    // silent fail
  }
}

// ─── Alias lama agar tidak ada import yang rusak ──────────────
export const saveToken   = (token) => saveSession(token, null)
export const removeToken = logout
export const isLoggedIn  = isAuthenticated
