// ============================================================
// SDENTIBAYA AdminKit — Cloudflare Worker
// Versi : 1.0.0
// Fungsi: API proxy antara React frontend dan Google Apps Script
//
// Arsitektur:
//   Frontend → Worker (index.js) → Google Apps Script → Sheets/Docs/Drive
//
// Environment variables (wajib diset di Cloudflare Dashboard):
//   GAS_URL        — URL deployment Google Apps Script
//   GAS_SECRET     — Token rahasia bersama Worker ↔ GAS
//   ADMIN_PIN      — PIN login admin
//   ALLOWED_ORIGIN — Origin frontend, misal https://adminkit.pages.dev
// ============================================================

// ============================================================
// KONSTANTA
// ============================================================

/** Versi aplikasi — ditampilkan di /api/health */
const APP_VERSION = '1.0.0'

/** Nama layanan */
const SERVICE_NAME = 'SDENTIBAYA AdminKit Worker'

/** Ukuran maksimum body request (bytes) — 512 KB */
const MAX_BODY_SIZE = 512 * 1024

/** Durasi token session (ms) — 8 jam */
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000

// ============================================================
// ENTRY POINT — Cloudflare Workers fetch handler
// ============================================================

export default {
  async fetch(request, env) {
    // Tangani preflight CORS lebih dulu (sebelum apapun)
    if (request.method === 'OPTIONS') {
      return handleCors(request, env)
    }

    try {
      const url      = new URL(request.url)
      const pathname = url.pathname

      // ── Router ─────────────────────────────────────────────
      if (pathname === '/api/health' && request.method === 'GET') {
        return withCors(await handleHealth(request, env), request, env)
      }

      if (pathname === '/api/login' && request.method === 'POST') {
        return withCors(await handleLogin(request, env), request, env)
      }

      if (pathname === '/api/gas' && request.method === 'POST') {
        return withCors(await handleGas(request, env), request, env)
      }

      // ── 404 untuk route tidak dikenal ───────────────────────
      return withCors(
        jsonResponse(404, false, 'Endpoint tidak ditemukan.', {
          path: pathname,
          method: request.method,
        }),
        request, env
      )

    } catch (err) {
      // Tangkap error yang tidak terduga
      console.error('[Worker] Unhandled error:', err)
      return withCors(
        jsonResponse(500, false, 'Terjadi kesalahan internal pada server.'),
        request, env
      )
    }
  },
}

// ============================================================
// HANDLER: GET /api/health
// Cek status Worker dan ketersediaan konfigurasi GAS.
// Tidak membutuhkan autentikasi — endpoint publik.
// ============================================================

async function handleHealth(request, env) {
  const gasConfigured = !!(env.GAS_URL && env.GAS_SECRET)
  const pinConfigured = !!env.ADMIN_PIN

  return jsonResponse(200, true, 'Worker aktif.', {
    service:       SERVICE_NAME,
    version:       APP_VERSION,
    timestamp:     new Date().toISOString(),
    gasConfigured,
    pinConfigured,
    // Jangan tampilkan nilai env — hanya boolean
  })
}

// ============================================================
// HANDLER: POST /api/login
// Validasi PIN admin dari env, kembalikan session token.
// Token sederhana berbasis HMAC-SHA256 agar bisa diverifikasi
// ulang di /api/gas tanpa menyimpan state di Worker.
// ============================================================

async function handleLogin(request, env) {
  // Pastikan ADMIN_PIN sudah dikonfigurasi
  if (!env.ADMIN_PIN) {
    return jsonResponse(503, false,
      'ADMIN_PIN belum dikonfigurasi di environment Worker.')
  }

  // Baca dan validasi ukuran body
  const body = await readBody(request)
  if (body === null) {
    return jsonResponse(400, false, 'Request body tidak valid atau terlalu besar.')
  }

  const { pin } = body

  // Validasi keberadaan field pin
  if (!pin || typeof pin !== 'string') {
    return jsonResponse(400, false, 'Field "pin" wajib diisi.')
  }

  // Validasi panjang PIN (mencegah brute-force dengan payload besar)
  if (pin.length > 32) {
    return jsonResponse(400, false, 'Format PIN tidak valid.')
  }

  // Bandingkan PIN — gunakan perbandingan timing-safe via HMAC
  const pinValid = await timingSafeEqual(pin, env.ADMIN_PIN)
  if (!pinValid) {
    // Tambah delay kecil untuk memperlambat brute-force
    await sleep(300)
    return jsonResponse(401, false, 'PIN salah. Silakan coba lagi.')
  }

  // Buat session token sederhana (HMAC-SHA256)
  const token = await generateToken(env.ADMIN_PIN)

  return jsonResponse(200, true, 'Login berhasil.', {
    token,
    expiresIn: TOKEN_TTL_MS / 1000, // dalam detik
    user: {
      name: 'Administrator',
      role: 'admin',
    },
  })
}

// ============================================================
// HANDLER: POST /api/gas
// Proxy request dari frontend ke Google Apps Script.
// Wajib memiliki Authorization header dengan token valid.
// ============================================================

async function handleGas(request, env) {
  // Pastikan GAS sudah dikonfigurasi
  if (!env.GAS_URL || !env.GAS_SECRET) {
    return jsonResponse(503, false,
      'GAS_URL atau GAS_SECRET belum dikonfigurasi di environment Worker.')
  }

  // ── 1. Validasi token Authorization ─────────────────────────
  const authHeader = request.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return jsonResponse(401, false,
      'Authorization header tidak ditemukan atau format salah. Gunakan: Bearer <token>')
  }

  const token = authHeader.slice(7).trim()
  const tokenValid = await verifyToken(token, env.ADMIN_PIN)
  if (!tokenValid) {
    return jsonResponse(401, false,
      'Token tidak valid atau sudah kadaluarsa. Silakan login ulang.')
  }

  // ── 2. Baca dan validasi body ────────────────────────────────
  const body = await readBody(request)
  if (body === null) {
    return jsonResponse(400, false,
      'Request body tidak valid atau melebihi batas ukuran (512 KB).')
  }

  const { action, payload } = body

  if (!action || typeof action !== 'string') {
    return jsonResponse(400, false, 'Field "action" wajib diisi dan harus string.')
  }

  // Whitelist action yang diizinkan (opsional tapi direkomendasikan)
  const ALLOWED_ACTIONS = [
    'ping',
    'getDashboardStats',
    'buatDokumen',
    'getArsipDokumen',
    'hapusDokumen',
    'getMasterData',
    'saveMasterData',
    'getTemplate',
    'addTemplate',
    'deleteTemplate',
  ]

  if (!ALLOWED_ACTIONS.includes(action)) {
    return jsonResponse(400, false,
      `Action "${action}" tidak dikenali. Pastikan action yang dikirim valid.`)
  }

  // ── 3. Bangun payload untuk GAS ─────────────────────────────
  // GAS_SECRET ditambahkan di sini — TIDAK PERNAH dikirim ke frontend
  const gasPayload = {
    secret:  env.GAS_SECRET,
    action,
    payload: payload ?? {},
  }

  // ── 4. Forward ke Google Apps Script ────────────────────────
  let gasResponse
  try {
    gasResponse = await fetch(env.GAS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(gasPayload),
    })
  } catch (networkErr) {
    console.error('[Worker] Gagal menghubungi GAS:', networkErr)
    return jsonResponse(502, false,
      'Tidak dapat menghubungi Google Apps Script. Periksa GAS_URL dan pastikan GAS sudah di-deploy.')
  }

  // ── 5. Baca response GAS ─────────────────────────────────────
  let gasData
  try {
    gasData = await gasResponse.json()
  } catch (parseErr) {
    console.error('[Worker] GAS response bukan JSON valid:', parseErr)
    return jsonResponse(502, false,
      'Response dari Google Apps Script tidak dapat dibaca. Pastikan GAS me-return JSON.')
  }

  // ── 6. Sanitasi — hapus secret dari response jika ada ───────
  if (gasData && typeof gasData === 'object') {
    delete gasData.secret
    delete gasData.gasSecret
  }

  // ── 7. Teruskan response ke frontend ────────────────────────
  const statusCode = gasResponse.ok ? 200 : (gasResponse.status || 500)
  return jsonResponse(
    statusCode,
    gasResponse.ok,
    gasData?.message ?? gasData?.pesan ?? (gasResponse.ok ? 'Berhasil.' : 'GAS mengembalikan error.'),
    gasData?.data ?? gasData
  )
}

// ============================================================
// HELPER: jsonResponse
// Format respons JSON yang konsisten di semua endpoint.
//
// Schema:
// {
//   success : boolean,
//   message : string,
//   data    : object | null,
//   meta    : { timestamp, requestId }
// }
// ============================================================

function jsonResponse(status, success, message, data = null) {
  const body = {
    success,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ============================================================
// HELPER: CORS
// withCors   — tambahkan CORS headers ke response yang ada
// handleCors — kembalikan response kosong 204 untuk preflight
// ============================================================

function getCorsHeaders(request, env) {
  // Ambil origin yang diizinkan dari env, fallback ke '*' (hanya dev)
  const allowedOrigin = env.ALLOWED_ORIGIN || '*'

  // Jika ALLOWED_ORIGIN berisi daftar origin (pisah koma), cek request origin
  const requestOrigin = request.headers.get('Origin') ?? ''
  let origin = allowedOrigin

  if (allowedOrigin !== '*') {
    const allowed = allowedOrigin.split(',').map(o => o.trim())
    origin = allowed.includes(requestOrigin) ? requestOrigin : allowed[0]
  }

  return {
    'Access-Control-Allow-Origin':      origin,
    'Access-Control-Allow-Methods':     'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, Authorization',
    'Access-Control-Max-Age':           '86400', // cache preflight 24 jam
    'Access-Control-Allow-Credentials': 'true',
  }
}

function withCors(response, request, env) {
  const corsHeaders = getCorsHeaders(request, env)
  const newHeaders  = new Headers(response.headers)
  Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v))
  return new Response(response.body, {
    status:     response.status,
    statusText: response.statusText,
    headers:    newHeaders,
  })
}

function handleCors(request, env) {
  return new Response(null, {
    status:  204,
    headers: getCorsHeaders(request, env),
  })
}

// ============================================================
// HELPER: readBody
// Baca dan parse JSON body, validasi ukuran maks.
// Return null jika gagal atau terlalu besar.
// ============================================================

async function readBody(request) {
  try {
    // Cek Content-Length jika tersedia
    const contentLength = parseInt(request.headers.get('Content-Length') ?? '0', 10)
    if (contentLength > MAX_BODY_SIZE) return null

    const text = await request.text()

    // Validasi ukuran aktual
    if (new TextEncoder().encode(text).length > MAX_BODY_SIZE) return null

    return JSON.parse(text)
  } catch {
    return null
  }
}

// ============================================================
// HELPER: Token — HMAC-SHA256 sederhana
//
// Token = base64url(HMAC-SHA256(timestamp + ":" + adminPin, adminPin))
// Tidak menyimpan state — verifikasi dengan re-generate dan compare.
//
// CATATAN: Ini adalah implementasi sederhana yang cocok untuk
// aplikasi sekolah single-admin. Untuk multi-user, gunakan JWT
// atau Cloudflare KV untuk session management.
// ============================================================

/**
 * Generate token session berbasis timestamp + HMAC.
 * Format: <timestamp_hex>.<hmac_hex>
 */
async function generateToken(secret) {
  const ts   = Date.now().toString(16) // timestamp hex
  const data = `${ts}:sdentibaya`
  const hmac = await hmacSha256(data, secret)
  return `${ts}.${hmac}`
}

/**
 * Verifikasi token — cek HMAC valid dan belum expired.
 */
async function verifyToken(token, secret) {
  try {
    if (!token || !secret) return false

    const parts = token.split('.')
    if (parts.length !== 2) return false

    const [tsHex, hmacReceived] = parts

    // Cek expired
    const ts  = parseInt(tsHex, 16)
    const now = Date.now()
    if (isNaN(ts) || now - ts > TOKEN_TTL_MS) return false

    // Re-compute HMAC dan bandingkan
    const data        = `${tsHex}:sdentibaya`
    const hmacExpected = await hmacSha256(data, secret)
    return await timingSafeEqual(hmacReceived, hmacExpected)

  } catch {
    return false
  }
}

/**
 * HMAC-SHA256 menggunakan Web Crypto API (tersedia di Workers).
 * Kembalikan hex string.
 */
async function hmacSha256(message, secret) {
  const enc     = new TextEncoder()
  const keyMat  = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sigBuf  = await crypto.subtle.sign('HMAC', keyMat, enc.encode(message))
  return Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Perbandingan string timing-safe — mencegah timing attacks.
 * Implementasi manual karena Workers tidak memiliki crypto.timingSafeEqual.
 */
async function timingSafeEqual(a, b) {
  // Gunakan HMAC compare via Web Crypto
  const enc  = new TextEncoder()
  const key  = await crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
  const sigA = await crypto.subtle.sign('HMAC', key, enc.encode(a))
  const sigB = await crypto.subtle.sign('HMAC', key, enc.encode(b))

  // Compare byte by byte — length already constant from HMAC
  const arrA = new Uint8Array(sigA)
  const arrB = new Uint8Array(sigB)
  let result = 0
  for (let i = 0; i < arrA.length; i++) {
    result |= arrA[i] ^ arrB[i]
  }
  return result === 0
}

// ============================================================
// HELPER: sleep
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
