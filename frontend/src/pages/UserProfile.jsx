// ============================================================
// UserProfile.jsx — Halaman Profil Pengguna
// Semua user (admin & operator) bisa mengakses halaman ini.
// Fitur: edit profil, ganti password, upload/URL foto profil.
// ============================================================
import { useState, useRef }   from 'react'
import { updateProfile }      from '../lib/api'
import { getProfile, saveProfile, getRole } from '../lib/auth'
import { useToast, ToastContainer }         from '../components/Toast'

// ── Ikon ────────────────────────────────────────────────────
const IcoCamera = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IcoEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IcoKey = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78l1.06-1.06"/>
    <path d="M11 8l2 2M14 2l4 4"/>
  </svg>
)
const IcoSave = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/>
    <polyline points="7,3 7,8 15,8"/>
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
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                       text-xs font-semibold bg-navy-100 text-navy-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Administrator
      </span>
    )
  }
  // Guru / Staf — label sesuai role
  const label = role === 'staf' ? 'Staf' : 'Guru'
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                     text-xs font-semibold bg-hijau-100 text-hijau-700">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      {label}
    </span>
  )
}

// ============================================================
// Komponen utama
// ============================================================
export default function UserProfile() {
  const { toasts, removeToast, toast } = useToast()

  // Inisialisasi form dari profil yang tersimpan
  const profile = getProfile() || {}
  const role    = getRole()

  const [tab, setTab] = useState('profil') // 'profil' | 'password'

  // ── State form profil ─────────────────────────────────────
  const [formProfil, setFormProfil] = useState({
    nama:      profile.name   || profile.nama || '',
    email:     profile.email  || '',
    nip:       profile.nip    || '',
    jabatan:   profile.jabatan || '',
    telepon:   profile.telepon || '',
    alamat:    profile.alamat  || '',
    foto:      profile.foto    || '',
    bio:       profile.bio     || '',
  })
  const [savingProfil, setSavingProfil] = useState(false)
  const [fotoPreview,  setFotoPreview]  = useState(profile.foto || '')
  const [fotoMode,     setFotoMode]     = useState('url') // 'url' | 'upload'
  const fileInputRef = useRef(null)

  // ── State form password ────────────────────────────────────
  const [formPassword, setFormPassword] = useState({
    passwordLama: '', passwordBaru: '', konfirmBaru: '',
  })
  const [savingPass,  setSavingPass]  = useState(false)
  const [showPassLama,  setShowPassLama]  = useState(false)
  const [showPassBaru,  setShowPassBaru]  = useState(false)
  const [showKonfirm,   setShowKonfirm]   = useState(false)

  // ── Handler form profil ───────────────────────────────────
  function handleProfilChange(e) {
    const { name, value } = e.target
    setFormProfil(prev => ({ ...prev, [name]: value }))
    if (name === 'foto') setFotoPreview(value)
  }

  // Upload foto: konversi ke base64 (hanya untuk preview lokal)
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      toast.error('Ukuran foto maksimal 500 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = ev.target.result
      setFotoPreview(b64)
      setFormProfil(prev => ({ ...prev, foto: b64 }))
    }
    reader.readAsDataURL(file)
  }

  async function handleSimpanProfil(e) {
    e.preventDefault()
    if (!formProfil.nama.trim()) {
      toast.error('Nama tidak boleh kosong.')
      return
    }
    setSavingProfil(true)
    try {
      const payload = { ...formProfil, id: profile.id }
      const result  = await updateProfile(payload)

      // Jika GAS mengupload foto ke Drive dan mengembalikan URL publik,
      // pakai URL tersebut (bukan base64 yang ada di formProfil.foto)
      const fotoTersimpan = result?.data?.foto || formProfil.foto

      // Update preview ke URL Drive (agar tidak ada base64 besar di memory)
      if (result?.data?.foto) {
        setFotoPreview(result.data.foto)
        setFormProfil(prev => ({ ...prev, foto: result.data.foto }))
      }

      // Simpan ke localStorage — gunakan URL Drive, bukan base64
      saveProfile({
        name:    formProfil.nama,
        nama:    formProfil.nama,
        email:   formProfil.email,
        nip:     formProfil.nip,
        jabatan: formProfil.jabatan,
        telepon: formProfil.telepon,
        alamat:  formProfil.alamat,
        foto:    fotoTersimpan,
        bio:     formProfil.bio,
      })
      toast.success('Profil berhasil diperbarui.')
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil.')
    } finally {
      setSavingProfil(false)
    }
  }

  // ── Handler form password ─────────────────────────────────
  function handlePassChange(e) {
    const { name, value } = e.target
    setFormPassword(prev => ({ ...prev, [name]: value }))
  }

  async function handleGantiPassword(e) {
    e.preventDefault()
    if (!formPassword.passwordLama) {
      toast.error('Masukkan password lama terlebih dahulu.'); return
    }
    if (formPassword.passwordBaru.length < 6) {
      toast.error('Password baru minimal 6 karakter.'); return
    }
    if (formPassword.passwordBaru !== formPassword.konfirmBaru) {
      toast.error('Konfirmasi password baru tidak cocok.'); return
    }
    setSavingPass(true)
    try {
      await updateProfile({
        id:          profile.id,
        email:       formProfil.email,
        passwordLama: formPassword.passwordLama,
        passwordBaru: formPassword.passwordBaru,
        _action:     'changePassword',
      })
      toast.success('Password berhasil diubah. Silakan login ulang jika diminta.')
      setFormPassword({ passwordLama: '', passwordBaru: '', konfirmBaru: '' })
    } catch (err) {
      toast.error(err.message || 'Gagal mengganti password.')
    } finally {
      setSavingPass(false)
    }
  }

  // ── Nama inisial untuk avatar ─────────────────────────────
  const initials = (formProfil.nama || 'U')
    .split(' ').slice(0, 2)
    .map(w => w.charAt(0).toUpperCase()).join('')

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-2xl pb-10">

        {/* ── KARTU HERO PROFIL ── */}
        <div className="card overflow-hidden mb-6">
          {/* Strip warna atas */}
          <div className="h-24 bg-gradient-to-r from-navy-800 via-navy-700 to-hijau-600 relative">
            <div className="absolute -bottom-10 left-5">
              {/* Avatar besar */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br
                                from-navy-400 to-navy-600 flex items-center justify-center
                                shadow-lg overflow-hidden">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto profil"
                         className="w-full h-full object-cover"
                         onError={() => setFotoPreview('')} />
                  ) : (
                    <span className="text-2xl font-bold text-white">{initials}</span>
                  )}
                </div>
                {/* Overlay edit foto */}
                <button
                  onClick={() => setTab('profil')}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center
                             justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ubah foto"
                >
                  <IcoCamera />
                </button>
              </div>
            </div>
          </div>

          {/* Info nama + role */}
          <div className="pt-12 pb-4 px-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">
                {formProfil.nama || 'Nama Pengguna'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {formProfil.jabatan || 'Jabatan belum diisi'}
              </p>
              {formProfil.email && (
                <p className="text-xs text-gray-400 mt-0.5">{formProfil.email}</p>
              )}
            </div>
            <RoleBadge role={role} />
          </div>

          {/* Bio singkat */}
          {formProfil.bio && (
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {formProfil.bio}
              </p>
            </div>
          )}

          {/* Stat bar singkat */}
          <div className="px-5 pb-4 flex flex-wrap gap-4 border-t border-gray-100 pt-3">
            {[
              { label: 'NIP',     value: formProfil.nip     || '—' },
              { label: 'Telepon', value: formProfil.telepon || '—' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TAB NAVIGASI ── */}
        <div className="flex gap-0 border-b border-gray-200 mb-5">
          {[
            { id: 'profil',   label: 'Edit Profil', icon: <IcoEdit /> },
            { id: 'password', label: 'Ganti Password', icon: <IcoKey /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors',
                'border-b-2 -mb-px',
                tab === t.id
                  ? 'border-hijau-500 text-hijau-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: EDIT PROFIL ── */}
        {tab === 'profil' && (
          <form onSubmit={handleSimpanProfil} noValidate className="space-y-5">

            {/* Foto Profil */}
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Foto Profil</h3>

              {/* Toggle mode */}
              <div className="flex gap-2">
                {['url', 'upload'].map(m => (
                  <button key={m} type="button"
                    onClick={() => setFotoMode(m)}
                    className={[
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      fotoMode === m
                        ? 'bg-navy-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    ].join(' ')}>
                    {m === 'url' ? 'Dari URL' : 'Upload File'}
                  </button>
                ))}
              </div>

              {fotoMode === 'url' ? (
                <div className="space-y-1.5">
                  <label className="form-label">URL Foto</label>
                  <input
                    name="foto" type="url" value={formProfil.foto}
                    onChange={handleProfilChange}
                    placeholder="https://drive.google.com/..."
                    className="form-input"
                  />
                  <p className="text-xs text-gray-400">
                    Salin URL langsung dari Google Drive atau sumber lain (harus publik)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="form-label">Pilih File Foto</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center
                               cursor-pointer hover:border-hijau-400 hover:bg-hijau-50 transition-colors"
                  >
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview"
                           className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                           onError={() => setFotoPreview('')} />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center
                                      justify-center mx-auto mb-2 text-gray-400">
                        <IcoCamera />
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      Klik untuk pilih foto
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG — Maks. 500 KB
                    </p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*"
                         className="hidden" onChange={handleFileChange} />
                </div>
              )}

              {/* Preview foto */}
              {fotoPreview && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <img src={fotoPreview} alt="Preview"
                       className="w-10 h-10 rounded-full object-cover"
                       onError={() => setFotoPreview('')} />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Preview foto profil</p>
                    <button type="button"
                      onClick={() => { setFotoPreview(''); setFormProfil(p => ({ ...p, foto: '' })) }}
                      className="text-xs text-red-500 hover:underline mt-0.5">
                      Hapus foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Informasi Pribadi */}
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Informasi Pribadi</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="form-label">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nama" type="text" value={formProfil.nama}
                    onChange={handleProfilChange}
                    placeholder="Nama lengkap dengan gelar"
                    className="form-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Jabatan
                    <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                  </label>
                  <input
                    name="jabatan" type="text" value={formProfil.jabatan}
                    onChange={handleProfilChange}
                    placeholder="Guru Kelas V / Staf TU"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="form-label">Email
                    <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                  </label>
                  <input
                    name="email" type="email" value={formProfil.email}
                    onChange={handleProfilChange}
                    placeholder="nama@sdn3pringgabaya.sch.id"
                    className="form-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">NIP
                    <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                  </label>
                  <input
                    name="nip" type="text" value={formProfil.nip}
                    onChange={handleProfilChange}
                    placeholder="18 digit NIP ASN"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Nomor Telepon
                  <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                </label>
                <input
                  name="telepon" type="text" value={formProfil.telepon}
                  onChange={handleProfilChange}
                  placeholder="08XXXXXXXXXX"
                  className="form-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Alamat
                  <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                </label>
                <textarea
                  name="alamat" value={formProfil.alamat}
                  onChange={handleProfilChange}
                  placeholder="Alamat lengkap..."
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Bio / Tentang Saya
                  <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                </label>
                <textarea
                  name="bio" value={formProfil.bio}
                  onChange={handleProfilChange}
                  placeholder="Ceritakan sedikit tentang diri Anda..."
                  rows={3}
                  className="form-textarea"
                />
                <p className="text-xs text-gray-400">
                  {formProfil.bio.length}/200 karakter
                </p>
              </div>
            </div>

            {/* Tombol simpan */}
            <div className="flex justify-end">
              <button type="submit" disabled={savingProfil} className="btn-primary">
                {savingProfil ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <><IcoSave /> Simpan Perubahan</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB: GANTI PASSWORD ── */}
        {tab === 'password' && (
          <form onSubmit={handleGantiPassword} noValidate>
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Ganti Password</h3>

              <div className="p-3 rounded-lg bg-emas-50 border border-emas-200 text-xs text-emas-800">
                <p className="font-semibold mb-0.5">Catatan</p>
                <p>Khusus untuk akun <strong>Guru / Staf</strong>. Admin login dengan PIN — ganti PIN melalui Cloudflare Dashboard.</p>
              </div>

              {/* Password lama */}
              <div className="space-y-1.5">
                <label className="form-label">Password Lama <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="passwordLama" type={showPassLama ? 'text' : 'password'}
                    value={formPassword.passwordLama} onChange={handlePassChange}
                    placeholder="Password saat ini" className="form-input pr-9" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassLama(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <IcoEye open={showPassLama} />
                  </button>
                </div>
              </div>

              {/* Password baru */}
              <div className="space-y-1.5">
                <label className="form-label">Password Baru <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="passwordBaru" type={showPassBaru ? 'text' : 'password'}
                    value={formPassword.passwordBaru} onChange={handlePassChange}
                    placeholder="Minimal 6 karakter" className="form-input pr-9" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassBaru(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <IcoEye open={showPassBaru} />
                  </button>
                </div>
              </div>

              {/* Konfirmasi password baru */}
              <div className="space-y-1.5">
                <label className="form-label">Konfirmasi Password Baru <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="konfirmBaru" type={showKonfirm ? 'text' : 'password'}
                    value={formPassword.konfirmBaru} onChange={handlePassChange}
                    placeholder="Ulangi password baru" className="form-input pr-9" />
                  <button type="button" tabIndex={-1} onClick={() => setShowKonfirm(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <IcoEye open={showKonfirm} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={savingPass} className="btn-primary">
                  {savingPass ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <><IcoKey /> Ganti Password</>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </>
  )
}
