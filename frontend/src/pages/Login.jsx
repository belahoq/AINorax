// ============================================================
// Login.jsx — Halaman login PIN admin
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, loginWithEmail } from '../lib/api'
import { saveSession, isAuthenticated } from '../lib/auth'
import { BRAND, SEKOLAH } from '../lib/constants'

const EyeIcon = ({ open }) => open ? (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()

  // Tab: 'admin' (PIN) atau 'operator' (email+password)
  const [tab,     setTab]     = useState('admin')
  const [pin,     setPin]     = useState('')
  const [email,   setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Jika sudah login, langsung ke dashboard
  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard', { replace: true })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let res
      if (tab === 'admin') {
        if (!pin.trim()) { setError('Masukkan PIN terlebih dahulu.'); setLoading(false); return }
        res = await login(pin)
      } else {
        if (!email.trim() || !password) { setError('Email dan password wajib diisi.'); setLoading(false); return }
        res = await loginWithEmail(email, password)
      }
      saveSession(res.token, res.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali data Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-hijau-900
                    flex items-center justify-center p-4">

      {/* Dekorasi */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-hijau-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-navy-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header hijau */}
          <div className="bg-gradient-to-r from-hijau-600 to-hijau-500 px-8 py-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm
                            flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-black text-white">SD</span>
            </div>
            <h1 className="text-xl font-bold text-white">{BRAND.nama}</h1>
            <p className="text-xs text-hijau-100 mt-0.5 tracking-widest uppercase">
              {BRAND.slogan}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-7">
            <div className="text-center mb-6">
              <h2 className="text-base font-semibold text-gray-800">Masuk ke AdminKit</h2>
              <p className="text-xs text-gray-400 mt-0.5">{SEKOLAH.nama}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Tab pilih jenis login */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-2">
                {[
                  { id: 'admin',    label: 'Admin (PIN)'     },
                  { id: 'operator', label: 'Operator (Email)' },
                ].map(t => (
                  <button key={t.id} type="button"
                    onClick={() => { setTab(t.id); setError('') }}
                    className={[
                      'flex-1 py-2 text-xs font-semibold transition-colors',
                      tab === t.id
                        ? 'bg-hijau-600 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50',
                    ].join(' ')}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Form Admin (PIN) */}
              {tab === 'admin' && (
                <div>
                  <label className="form-label">PIN Admin</label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={e => { setPin(e.target.value); setError('') }}
                      placeholder="Masukkan PIN"
                      className={`form-input pr-10 text-center tracking-[0.3em] text-lg font-semibold
                        ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
                      maxLength={16}
                      autoFocus
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                                 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      <EyeIcon open={showPin} />
                    </button>
                  </div>
                </div>
              )}

              {/* Form Operator (Email + Password) */}
              {tab === 'operator' && (
                <div className="space-y-3">
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="nama@sdn3pringgabaya.sch.id"
                      className={`form-input ${error ? 'border-red-400' : ''}`}
                      autoFocus disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => { setPassword(e.target.value); setError('') }}
                        placeholder="Password"
                        className={`form-input pr-10 ${error ? 'border-red-400' : ''}`}
                        disabled={loading} autoComplete="current-password"
                      />
                      <button type="button" tabIndex={-1}
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <EyeIcon open={showPass} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pesan error */}
              {error && (
                <p className="text-xs text-red-600 flex items-start gap-1.5
                              bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"/>
                  </svg>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || (tab === 'admin' ? !pin.trim() : (!email.trim() || !password))}
                className="btn-primary w-full justify-center py-2.5 text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                              stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                    </svg>
                    Memverifikasi...
                  </>
                ) : 'Masuk'}
              </button>
            </form>
          </div>
        </div>

        {/* Keterangan mode */}
        {!import.meta.env.VITE_API_URL && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20">
            <p className="text-xs text-white/60 text-center">
              <span className="text-emas-400 font-semibold">Mode Demo</span>
              {' '}— Backend belum dikonfigurasi. PIN: <span className="font-mono font-bold text-white/80">123456</span>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-white/40 mt-4">
          &copy; {new Date().getFullYear()} {SEKOLAH.nama}
        </p>
      </div>
    </div>
  )
}
