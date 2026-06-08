// ============================================================
// AddUser.jsx — Halaman Tambah Pengguna (Admin Only)
// Lokasi di sidebar: Sistem > Tambah Pengguna
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { addUser, listUsers, deleteUser } from '../lib/api'
import FormField               from '../components/FormField'
import { useToast, ToastContainer } from '../components/Toast'
import LoadingState            from '../components/LoadingState'
import EmptyState              from '../components/EmptyState'

// ── Opsi Role ────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'guru',  label: 'Guru'  },
  { value: 'staf',  label: 'Staf'  },
  { value: 'admin', label: 'Admin — akses penuh' },
]

// ── Form kosong default ──────────────────────────────────────
const EMPTY_FORM = {
  email:    '',
  password: '',
  role:     'guru',
}

// ── Ikon ────────────────────────────────────────────────────
const IcoUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcoShield = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IcoEye = ({ open }) => open ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

// ── Badge role ───────────────────────────────────────────────
function RoleBadge({ role }) {
  if (role === 'admin')
    return <span className="badge badge-navy text-xs">Admin</span>
  if (role === 'guru')
    return <span className="badge badge-green text-xs">Guru</span>
  return <span className="badge badge-yellow text-xs">Staf</span>
}

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ active }) {
  return active
    ? <span className="badge-green badge text-xs">Aktif</span>
    : <span className="badge-gray  badge text-xs">Nonaktif</span>
}

// ============================================================
// Komponen utama
// ============================================================
export default function AddUser() {
  const navigate = useNavigate()
  const { toasts, removeToast, toast } = useToast()

  const [form,        setForm]        = useState(EMPTY_FORM)
  const [errors,      setErrors]      = useState({})
  const [saving,      setSaving]      = useState(false)
  const [showPass,    setShowPass]    = useState(false)

  // Daftar user + state hapus
  const [users,        setUsers]       = useState([])
  const [loadingList,  setLoadingList] = useState(true)
  const [hapusId,      setHapusId]     = useState(null)   // id yang dikonfirmasi hapus
  const [deletingId,   setDeletingId]  = useState(null)   // id yang sedang dihapus

  // Muat daftar user saat halaman dibuka
  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => toast.warning('Gagal memuat daftar pengguna.'))
      .finally(() => setLoadingList(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validasi ─────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!form.email.trim()) e.email = 'Email wajib diisi.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Format email tidak valid.'
    if (!form.password)     e.password = 'Password wajib diisi.'
    else if (form.password.length < 6)
      e.password = 'Password minimal 6 karakter.'
    if (!form.role) e.role = 'Role wajib dipilih.'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Lengkapi semua field yang wajib diisi.')
      return
    }

    setSaving(true)
    try {
      const payload = { email: form.email.trim().toLowerCase(), password: form.password, role: form.role }
      await addUser(payload)
      toast.success(`Pengguna berhasil ditambahkan.`)
      setForm(EMPTY_FORM)
      setErrors({})
      // Refresh daftar
      const fresh = await listUsers()
      setUsers(fresh)
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan pengguna.')
    } finally {
      setSaving(false)
    }
  }

  // ── Handler Hapus ─────────────────────────────────────────
  async function handleHapus(id) {
    setDeletingId(id)
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('Pengguna berhasil dihapus.')
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus pengguna.')
    } finally {
      setDeletingId(null)
      setHapusId(null)
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-3xl space-y-6 pb-10">

        {/* ── Header ── */}
        <div>
          <h2 className="text-base font-bold text-gray-800">Tambah Pengguna</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Tambahkan akun untuk operator atau admin tambahan.
            Hanya administrator yang dapat mengakses halaman ini.
          </p>
        </div>

        {/* ── Catatan keamanan ── */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-navy-50 border border-navy-200">
          <IcoShield />
          <div className="text-xs text-navy-800">
            <p className="font-semibold mb-0.5">Hak Akses Pengguna</p>
            <div className="space-y-1 text-navy-700">
              <p><strong>Admin</strong> — akses penuh: semua menu termasuk Master Data, Tambah Pengguna, dan Pengaturan.</p>
              <p><strong>Guru / Staf</strong> — akses dokumen: Dashboard, Buat Dokumen, Arsip, Template. Tidak bisa mengubah pengaturan sistem.</p>
            </div>
          </div>
        </div>

        {/* ── Form tambah user ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
              Data Pengguna Baru
            </h3>

            {/* Email */}
            <FormField
              label="Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="nama@sdn3pringgabaya.sch.id"
              required error={errors.email}
              hint="Digunakan untuk login"
            />

            {/* Password dengan toggle show/hide */}
            <div className="space-y-1.5">
              <label className="form-label">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className={`form-input pr-9 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <IcoEye open={showPass} />
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-gray-400">
                Pengguna dapat mengubah password kapan saja melalui halaman Profil.
              </p>
            </div>

            {/* Role */}
            <FormField
              label="Role / Hak Akses" name="role" type="select"
              value={form.role} onChange={handleChange}
              options={ROLE_OPTIONS}
              required error={errors.role}
              hint="Admin memiliki akses penuh. Guru dan Staf hanya bisa membuat dan melihat dokumen."
            />

            {/* Tombol */}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <><IcoUser /> Tambah Pengguna</>
                )}
              </button>
              <button type="button" onClick={() => { setForm(EMPTY_FORM); setErrors({}) }} className="btn-secondary">
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* ── Daftar pengguna yang sudah ada ── */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Pengguna Terdaftar</h3>
            <span className="badge badge-gray text-xs">{users.length} akun</span>
          </div>

          {loadingList ? (
            <LoadingState size="sm" />
          ) : users.length === 0 ? (
            <EmptyState title="Belum ada pengguna" compact />
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-400 to-navy-600
                                  flex items-center justify-center shrink-0 overflow-hidden">
                    {u.foto ? (
                      <img src={u.foto} alt={u.nama || u.email}
                           className="w-full h-full object-cover"
                           onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {(u.nama || u.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {u.nama || <span className="text-gray-400 italic">Belum diisi</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email || '—'}</p>
                  </div>

                  {/* Badge + Hapus */}
                  <div className="flex items-center gap-2 shrink-0">
                    <RoleBadge role={u.role} />
                    <StatusBadge active={u.isActive !== false} />

                    {/* Tombol hapus — nonaktif untuk akun admin diri sendiri */}
                    <button
                      onClick={() => setHapusId(u.id)}
                      disabled={deletingId === u.id}
                      title="Hapus pengguna"
                      className="ml-1 p-1.5 rounded-lg text-red-400 hover:bg-red-50
                                 hover:text-red-600 transition-colors disabled:opacity-40
                                 disabled:cursor-not-allowed"
                    >
                      {deletingId === u.id ? (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Modal Konfirmasi Hapus ── */}
      {hapusId && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setHapusId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor"
                   strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 text-center mb-2">Hapus Pengguna?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              Akun pengguna ini akan dihapus secara permanen dari database.
            </p>
            <p className="text-xs text-red-500 text-center mb-5">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setHapusId(null)} className="btn-secondary flex-1 justify-center">
                Batal
              </button>
              <button onClick={() => handleHapus(hapusId)} className="btn-danger flex-1 justify-center">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
