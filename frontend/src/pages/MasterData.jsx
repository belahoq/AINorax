// ============================================================
// MasterData.jsx — Halaman Master Data Sekolah
// Fitur: form edit, validasi, simpan ke localStorage,
//        reset ke default, preview kop surat sederhana.
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_MASTER_DATA } from '../lib/constants'
import { saveMasterData, loadMasterData, resetMasterData, getMasterDataSavedAt } from '../lib/storage'
import { getSettings, saveSettings } from '../lib/api'
import FormField from '../components/FormField'
import { useToast, ToastContainer } from '../components/Toast'

// ============================================================
// Konfigurasi seksi + field form
// ============================================================
const SEKSI_FORM = [
  {
    id:    'identitas',
    judul: 'Identitas Sekolah',
    icon:  <IcoSchool />,
    fields: [
      { name: 'namaSekolah', label: 'Nama Sekolah',   type: 'text',
        placeholder: 'SD Negeri 3 Pringgabaya', required: true },
      { name: 'npsn',        label: 'NPSN',           type: 'text',
        placeholder: '50205367', required: true,
        hint: 'Nomor Pokok Sekolah Nasional (8 digit)' },
      { name: 'alamat',      label: 'Alamat Jalan',   type: 'text',
        placeholder: 'Jl. Raya Pringgabaya', required: true },
      { name: 'kecamatan',   label: 'Kecamatan',      type: 'text',
        placeholder: 'Pringgabaya', required: true },
      { name: 'kabupaten',   label: 'Kabupaten/Kota', type: 'text',
        placeholder: 'Lombok Timur', required: true },
      { name: 'provinsi',    label: 'Provinsi',       type: 'text',
        placeholder: 'Nusa Tenggara Barat', required: true },
      { name: 'telepon',     label: 'Nomor Telepon',  type: 'text',
        placeholder: '(0376) 21XXX', optional: true },
      { name: 'website',     label: 'Website Sekolah', type: 'text',
        placeholder: 'www.sdn3pringgabaya.sch.id', optional: true },
      { name: 'email',       label: 'Email Sekolah',  type: 'email',
        placeholder: 'sdn3pringgabaya@gmail.com', optional: true },
    ],
  },
  {
    id:    'brand',
    judul: 'Brand & Tahun Ajaran',
    icon:  <IcoBrand />,
    fields: [
      { name: 'brand',       label: 'Nama Brand / Singkatan', type: 'text',
        placeholder: 'SDENTIBAYA', required: true,
        hint: 'Nama singkat yang digunakan sebagai identitas digital' },
      { name: 'slogan',      label: 'Slogan',                 type: 'text',
        placeholder: 'SDENTIBAYA MELAJU', optional: true },
      { name: 'tahunAjaran', label: 'Tahun Ajaran Aktif',     type: 'text',
        placeholder: '2025/2026', required: true,
        hint: 'Format: YYYY/YYYY' },
    ],
  },
  {
    id:    'kepsek',
    judul: 'Kepala Sekolah',
    icon:  <IcoUser />,
    fields: [
      { name: 'namaKepsek',    label: 'Nama Kepala Sekolah', type: 'text',
        placeholder: 'Maturiadi, S.Pd.', required: true },
      { name: 'nipKepsek',     label: 'NIP Kepala Sekolah',  type: 'text',
        placeholder: '19XXXXXXXXXXXXXX', optional: true,
        hint: '18 digit NIP ASN' },
      { name: 'pangkatKepsek', label: 'Pangkat / Golongan',  type: 'text',
        placeholder: 'Pembina, IV/a', optional: true },
    ],
  },
  {
    id:    'aset',
    judul: 'Aset Digital',
    icon:  <IcoImage />,
    fields: [
      { name: 'urlLogo',    label: 'URL Logo Sekolah', type: 'text',
        placeholder: 'https://drive.google.com/...', optional: true,
        hint: 'Link langsung ke file gambar logo (PNG/JPG)' },
      { name: 'urlTtd',     label: 'URL Tanda Tangan Digital', type: 'text',
        placeholder: 'https://drive.google.com/...', optional: true,
        hint: 'Tanda tangan Kepala Sekolah (PNG transparan, opsional)' },
      { name: 'urlStempel', label: 'URL Stempel / Cap Sekolah', type: 'text',
        placeholder: 'https://drive.google.com/...', optional: true,
        hint: 'Stempel/cap resmi sekolah (PNG transparan, opsional)' },
    ],
  },
]

// ============================================================
// Helper: validasi field wajib
// ============================================================
function validate(form) {
  const errors = {}
  SEKSI_FORM.forEach(seksi =>
    seksi.fields.forEach(f => {
      if (f.required && !String(form[f.name] ?? '').trim()) {
        errors[f.name] = 'Field ini wajib diisi.'
      }
    })
  )
  return errors
}

// ============================================================
// Helper: format timestamp disimpan
// ============================================================
function fmtSavedAt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ============================================================
// Komponen utama
// ============================================================
export default function MasterData() {
  const { toasts, removeToast, toast } = useToast()

  const [form,        setForm]        = useState(() => {
    // Inisialisasi: coba dari localStorage, fallback ke default
    const saved = loadMasterData()
    return saved ? { ...DEFAULT_MASTER_DATA, ...saved } : { ...DEFAULT_MASTER_DATA }
  })
  const [errors,      setErrors]      = useState({})
  const [saving,      setSaving]      = useState(false)
  const [savedAt,     setSavedAt]     = useState(() => fmtSavedAt(getMasterDataSavedAt()))
  const [showPreview, setShowPreview] = useState(false)
  const [showReset,   setShowReset]   = useState(false)
  const [dirty,       setDirty]       = useState(false)  // ada perubahan belum disimpan

  // Sinkronisasi dari backend GAS jika tersedia
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const serverData = await getSettings()
        if (mounted && serverData && Object.keys(serverData).length > 0) {
          // Merge: data server menimpa default, localStorage menimpa server
          const localData = loadMasterData()
          setForm(prev => ({
            ...DEFAULT_MASTER_DATA,
            ...serverData,
            ...(localData || {}),
          }))
        }
      } catch {
        // Tetap gunakan data lokal/default
      }
    })()
    return () => { mounted = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setDirty(true)
    // Hapus error field saat diisi
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }, [errors])

  async function handleSimpan(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Lengkapi field yang wajib diisi terlebih dahulu.')
      const firstErr = Object.keys(errs)[0]
      document.getElementById(`field-${firstErr}`)?.scrollIntoView({
        behavior: 'smooth', block: 'center',
      })
      return
    }
    setSaving(true)
    try {
      // 1. Selalu simpan ke localStorage
      const ok = saveMasterData(form)
      if (!ok) {
        toast.error('Gagal menyimpan. Browser mungkin memblokir penyimpanan lokal.')
        setSaving(false)
        return
      }

      // 2. Jika backend aktif, sinkronisasi ke GAS juga
      if (import.meta.env.VITE_API_URL) {
        try {
          await saveSettings(form)
          toast.success('Data master berhasil disimpan ke Google Sheets dan perangkat lokal.')
        } catch (syncErr) {
          // localStorage sudah tersimpan, GAS gagal — beri tahu tapi jangan block
          toast.warning('Data disimpan di perangkat lokal. Sinkronisasi ke server gagal: ' + syncErr.message)
        }
      } else {
        toast.success('Data master berhasil disimpan ke penyimpanan lokal.')
      }

      const ts = fmtSavedAt(getMasterDataSavedAt())
      setSavedAt(ts)
      setDirty(false)
      setErrors({})
    } catch (err) {
      toast.error('Gagal menyimpan: ' + (err.message || 'Kesalahan tidak diketahui'))
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    resetMasterData()
    setForm({ ...DEFAULT_MASTER_DATA })
    setErrors({})
    setDirty(false)
    setSavedAt(null)
    setShowReset(false)
    toast.info('Data master telah direset ke nilai bawaan.')
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-3xl pb-10">

        {/* ── Header halaman ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between
                        gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-800">Master Data Sekolah</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Data ini digunakan sebagai variabel otomatis di semua dokumen yang dibuat.
            </p>
          </div>
          {/* Tombol preview kop surat */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn-secondary shrink-0 text-sm"
          >
            <IcoEye /> Preview Kop Surat
          </button>
        </div>

        {/* ── Banner terakhir disimpan ── */}
        {savedAt && !dirty && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-hijau-50
                          border border-hijau-200 mb-5 text-xs text-hijau-700">
            <svg className="w-4 h-4 shrink-0 text-hijau-500" fill="none"
                 stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Disimpan terakhir: <span className="font-semibold ml-1">{savedAt}</span>
          </div>
        )}

        {/* ── Banner belum disimpan ── */}
        {dirty && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emas-50
                          border border-emas-200 mb-5 text-xs text-emas-700">
            <svg className="w-4 h-4 shrink-0 text-emas-500" fill="none"
                 stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Ada perubahan yang belum disimpan.
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSimpan} noValidate>
          <div className="space-y-5">
            {SEKSI_FORM.map((seksi, si) => (
              <SeksiCard
                key={seksi.id}
                seksi={seksi}
                nomor={si + 1}
                form={form}
                errors={errors}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* ── Tombol aksi ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6
                          pt-5 border-t border-gray-100">
            {/* Reset */}
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="btn-secondary text-sm text-red-500 hover:border-red-300
                         hover:bg-red-50"
            >
              <IcoReset /> Reset ke Default
            </button>

            {/* Simpan */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <><IcoSpin /> Menyimpan...</>
              ) : (
                <><IcoSave /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* ── Modal Preview Kop Surat ── */}
      {showPreview && (
        <ModalPreviewKop data={form} onClose={() => setShowPreview(false)} />
      )}

      {/* ── Modal Konfirmasi Reset ── */}
      {showReset && (
        <ModalKonfirmasiReset
          onConfirm={handleReset}
          onCancel={() => setShowReset(false)}
        />
      )}
    </>
  )
}

// ============================================================
// Sub-komponen: Kartu seksi form
// ============================================================
function SeksiCard({ seksi, nomor, form, errors, onChange }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="card overflow-hidden">
      {/* Header seksi — bisa dilipat */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left
                   hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <div className="w-7 h-7 rounded-lg bg-navy-100 text-navy-700
                        flex items-center justify-center shrink-0 text-xs font-bold">
          {nomor}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-navy-600 shrink-0">{seksi.icon}</span>
          <span className="text-sm font-semibold text-gray-800">{seksi.judul}</span>
        </div>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0
                      ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Body seksi */}
      {open && (
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {seksi.fields.map(field => {
            // Field alamat & brand/slogan: lebar penuh
            const fullWidth = ['alamat', 'slogan', 'urlLogo', 'urlTtd', 'urlStempel']
              .includes(field.name)
            return (
              <div key={field.name} className={fullWidth ? 'sm:col-span-2' : ''}>
                <FormField
                  {...field}
                  value={form[field.name] ?? ''}
                  onChange={onChange}
                  error={errors[field.name]}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sub-komponen: Modal Preview Kop Surat
// ============================================================
function ModalPreviewKop({ data, onClose }) {
  const alamatLengkap = [
    data.alamat,
    data.kecamatan ? `Kec. ${data.kecamatan}` : '',
    data.kabupaten,
    data.provinsi,
  ].filter(Boolean).join(', ')

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]
                   overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Preview Kop Surat</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Tampilan kop surat berdasarkan data yang diisi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100
                       hover:text-gray-600 transition-colors"
          >
            <IcoX />
          </button>
        </div>

        {/* Area preview kop — mirip kop surat resmi */}
        <div className="p-6 sm:p-8">
          <div className="border-2 border-gray-800 rounded-sm overflow-hidden">

            {/* Kop surat */}
            <div className="border-b-4 border-gray-800 px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Logo placeholder */}
                <div className="w-16 h-16 rounded-full border-2 border-gray-800
                                flex items-center justify-center shrink-0 overflow-hidden
                                bg-gray-100">
                  {data.urlLogo ? (
                    <img
                      src={data.urlLogo}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 text-center
                                     leading-tight px-1">
                      LOGO
                    </span>
                  )}
                </div>

                {/* Identitas kop */}
                <div className="flex-1 text-center">
                  <p className="text-[11px] font-semibold text-gray-600 tracking-wider uppercase">
                    PEMERINTAH KABUPATEN {(data.kabupaten || 'LOMBOK TIMUR').toUpperCase()}
                  </p>
                  <p className="text-[11px] text-gray-500 tracking-wide uppercase">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </p>
                  <h1 className="text-[17px] font-black text-gray-900 leading-tight
                                 mt-0.5 tracking-wide uppercase">
                    {data.namaSekolah || 'NAMA SEKOLAH'}
                  </h1>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                    {alamatLengkap || 'Alamat Sekolah'}
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-1
                                  flex-wrap text-[10px] text-gray-500">
                    {data.telepon && <span>Telp: {data.telepon}</span>}
                    {data.website && <span>Web: {data.website}</span>}
                    {data.email   && <span>Email: {data.email}</span>}
                    {data.npsn    && <span>NPSN: {data.npsn}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Area isi surat (dummy) */}
            <div className="px-6 py-4">
              <div className="space-y-2">
                <div className="flex gap-4 text-[11px] text-gray-700">
                  <span className="w-24 shrink-0">Nomor</span>
                  <span>: ___/___/{new Date().getFullYear()}</span>
                </div>
                <div className="flex gap-4 text-[11px] text-gray-700">
                  <span className="w-24 shrink-0">Lampiran</span>
                  <span>: —</span>
                </div>
                <div className="flex gap-4 text-[11px] text-gray-700">
                  <span className="w-24 shrink-0">Perihal</span>
                  <span>: <em className="text-gray-400">[isi otomatis dari form dokumen]</em></span>
                </div>
              </div>

              {/* Isi placeholder */}
              <div className="mt-4 space-y-1.5">
                {[100, 95, 88, 72].map((w, i) => (
                  <div key={i}
                       className={`h-2.5 bg-gray-100 rounded-full`}
                       style={{ width: `${w}%` }} />
                ))}
              </div>

              {/* Tanda tangan */}
              <div className="mt-6 flex justify-end">
                <div className="text-center text-[11px] text-gray-700">
                  <p>
                    {data.kecamatan || 'Pringgabaya'},{' '}
                    {new Date().toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p className="mt-1">Kepala Sekolah,</p>
                  {/* Tanda tangan digital */}
                  <div className="h-10 flex items-center justify-center my-1">
                    {data.urlTtd ? (
                      <img src={data.urlTtd} alt="TTD"
                           className="h-10 object-contain"
                           onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="h-8 w-28 border-b border-dashed border-gray-300" />
                    )}
                  </div>
                  <p className="font-bold underline underline-offset-2">
                    {data.namaKepsek || 'Nama Kepala Sekolah'}
                  </p>
                  <p>NIP. {data.nipKepsek || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info preview */}
          <p className="text-xs text-gray-400 text-center mt-3">
            Tampilan preview — desain akhir ditentukan oleh template Google Docs.
          </p>
        </div>

        <div className="px-5 pb-5 flex justify-end">
          <button onClick={onClose} className="btn-primary">Tutup</button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Sub-komponen: Modal Konfirmasi Reset
// ============================================================
function ModalKonfirmasiReset({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
           onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center
                        justify-center mx-auto mb-4">
          <IcoReset className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-800 text-center mb-2">
          Reset ke Data Default?
        </h3>
        <p className="text-sm text-gray-500 text-center mb-5 leading-relaxed">
          Semua perubahan yang belum disimpan dan data yang tersimpan di perangkat ini
          akan dihapus dan digantikan dengan data bawaan aplikasi.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="btn-secondary flex-1 justify-center">
            Batal
          </button>
          <button onClick={onConfirm} className="btn-danger flex-1 justify-center">
            Ya, Reset
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Ikon SVG inline
// ============================================================
function IcoSchool() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )
}
function IcoBrand() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  )
}
function IcoUser() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IcoImage() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  )
}
function IcoEye() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function IcoSave() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
      <polyline points="17,21 17,13 7,13 7,21"/>
      <polyline points="7,3 7,8 15,8"/>
    </svg>
  )
}
function IcoReset() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <polyline points="1,4 1,10 7,10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  )
}
function IcoSpin() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
    </svg>
  )
}
function IcoX() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  )
}
