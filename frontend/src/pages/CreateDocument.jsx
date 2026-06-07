// ============================================================
// CreateDocument.jsx — Halaman Buat Dokumen dengan form dinamis
// ============================================================
import { useState, useMemo } from 'react'
import { useNavigate }       from 'react-router-dom'
import { JENIS_DOKUMEN, DOC_FIELDS, SEKOLAH, PENANDA_TANGAN_OPTIONS } from '../lib/constants'
import { createDocument } from '../lib/api'
import FormField             from '../components/FormField'
import { useToast, ToastContainer } from '../components/Toast'

// ── Ikon ────────────────────────────────────────────────────
const IcoCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
)
const IcoDoc = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
)
const IcoEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IcoReset = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <polyline points="1,4 1,10 7,10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
  </svg>
)
const IcoSpin = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
  </svg>
)


// ── Helper: label penanda tangan ────────────────────────────
function labelPenanda(val) {
  return PENANDA_TANGAN_OPTIONS.find(o => o.value === val)?.label || val || '—'
}

// ── Helper: format tanggal ISO → Indonesia ──────────────────
function fmtTgl(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

// ── Flatten semua field dari groups ─────────────────────────
function flatFields(groups = []) {
  return groups.flatMap(g => g.fields)
}

// ── Validasi: kembalikan object { fieldName: pesanError } ───
function validate(groups, form) {
  const errors = {}
  flatFields(groups).forEach(f => {
    if (f.required && !String(form[f.name] ?? '').trim()) {
      errors[f.name] = 'Field ini wajib diisi.'
    }
  })
  return errors
}

// ── Step indicator ───────────────────────────────────────────
const STEPS = ['Pilih Jenis', 'Isi Data', 'Preview', 'Selesai']

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done    = i < current
        const active  = i === current
        const last    = i === STEPS.length - 1
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            {/* Lingkaran nomor */}
            <div className={[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
              'shrink-0 transition-all duration-200',
              done   ? 'bg-hijau-600 text-white'           : '',
              active ? 'bg-hijau-600 text-white ring-4 ring-hijau-100' : '',
              !done && !active ? 'bg-gray-100 text-gray-400' : '',
            ].join(' ')}>
              {done ? <IcoCheck /> : i + 1}
            </div>
            {/* Label */}
            <span className={[
              'ml-1.5 text-xs font-medium whitespace-nowrap',
              active ? 'text-hijau-700' : done ? 'text-gray-500' : 'text-gray-400',
            ].join(' ')}>
              {s}
            </span>
            {/* Garis penghubung */}
            {!last && (
              <div className={[
                'flex-1 h-px mx-2',
                done ? 'bg-hijau-300' : 'bg-gray-200',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}


// ── Kartu pilihan jenis dokumen ──────────────────────────────
const ICON_MAP = {
  bell:      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  mail:      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  users:     <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  doc:       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  badge:     <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  clipboard: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  list:      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
}

const COLOR_MAP = {
  hijau: { card: 'border-hijau-200 bg-hijau-50 hover:border-hijau-400', icon: 'bg-hijau-100 text-hijau-700', sel: 'border-hijau-500 ring-2 ring-hijau-200 bg-hijau-50' },
  navy:  { card: 'border-navy-200  bg-navy-50  hover:border-navy-400',  icon: 'bg-navy-100  text-navy-700',  sel: 'border-navy-500  ring-2 ring-navy-200  bg-navy-50'  },
  emas:  { card: 'border-emas-200  bg-emas-50  hover:border-emas-400',  icon: 'bg-emas-100  text-emas-700',  sel: 'border-emas-500  ring-2 ring-emas-200  bg-emas-50'  },
  cyan:  { card: 'border-cyan-200  bg-cyan-50  hover:border-cyan-400',  icon: 'bg-cyan-100  text-cyan-700',  sel: 'border-cyan-500  ring-2 ring-cyan-200  bg-cyan-50'  },
  ungu:  { card: 'border-purple-200 bg-purple-50 hover:border-purple-400', icon: 'bg-purple-100 text-purple-700', sel: 'border-purple-500 ring-2 ring-purple-200 bg-purple-50' },
  merah: { card: 'border-red-200   bg-red-50   hover:border-red-400',   icon: 'bg-red-100   text-red-700',   sel: 'border-red-500   ring-2 ring-red-200   bg-red-50'   },
}

// ── Step 1: pilih jenis ──────────────────────────────────────
function StepPilihJenis({ jenis, onPilih }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Pilih jenis dokumen yang ingin dibuat:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {JENIS_DOKUMEN.map((j) => {
          const cfg     = DOC_FIELDS[j.value]
          const color   = COLOR_MAP[cfg?.color] || COLOR_MAP.hijau
          const dipilih = jenis === j.value
          return (
            <button
              key={j.value}
              type="button"
              onClick={() => onPilih(j.value)}
              className={[
                'flex items-center gap-3 p-4 rounded-xl border-2 text-left',
                'transition-all duration-150 w-full',
                dipilih ? color.sel : color.card,
              ].join(' ')}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color.icon}`}>
                {ICON_MAP[cfg?.icon] || ICON_MAP.doc}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug">{j.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {cfg?.groups?.length ?? 0} seksi · {flatFields(cfg?.groups).length ?? 0} field
                </p>
              </div>
              {dipilih && (
                <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-hijau-500 flex items-center justify-center">
                  <IcoCheck />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}


// ── Step 2: isi form ─────────────────────────────────────────
function StepIsiForm({ cfg, form, errors, onChange }) {
  return (
    <div className="space-y-6">
      {cfg.groups.map((group, gi) => (
        <div key={gi} className="space-y-4">
          {/* Header seksi */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-navy-100 text-navy-700 flex items-center
                             justify-center text-[11px] font-bold shrink-0">
              {gi + 1}
            </span>
            <h4 className="text-sm font-semibold text-gray-700">{group.title}</h4>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Field dalam grup */}
          <div className="space-y-4 pl-1">
            {group.fields.map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={form[field.name] ?? ''}
                onChange={onChange}
                placeholder={field.placeholder ?? ''}
                options={field.options ?? []}
                rows={field.rows ?? 3}
                required={!!field.required}
                optional={!!field.optional}
                hint={field.hint}
                error={errors[field.name]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


// ── Step 3: preview ringkasan ────────────────────────────────
function StepPreview({ cfg, form, jenis }) {
  const allFields = flatFields(cfg.groups)

  // Label tampil untuk field select
  function displayVal(field, raw) {
    if (!raw) return <span className="text-gray-300 italic">—</span>
    if (field.name === 'penandaTangan') return labelPenanda(raw)
    if (field.type === 'select') {
      return field.options?.find(o => o.value === raw)?.label ?? raw
    }
    if (field.type === 'date') return fmtTgl(raw)
    return raw
  }

  return (
    <div className="space-y-5">
      {/* Banner info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-emas-50 border border-emas-200">
        <svg className="w-5 h-5 text-emas-600 shrink-0 mt-0.5" fill="none" stroke="currentColor"
             strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-emas-800">Periksa kembali data Anda</p>
          <p className="text-xs text-emas-700 mt-0.5">
            Pastikan semua data sudah benar sebelum dokumen dibuat.
            Setelah digenerate, Anda dapat membuka dan mengedit Google Docs-nya.
          </p>
        </div>
      </div>

      {/* Info sekolah */}
      <div className="card p-4 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Data Sekolah (otomatis)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {[
            ['Nama Sekolah', SEKOLAH.nama],
            ['NPSN', SEKOLAH.npsn],
            ['Kepala Sekolah', SEKOLAH.namaKepsek],
            ['Tahun Ajaran', SEKOLAH.tahunAjaran],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="text-gray-400 w-28 shrink-0">{k}</span>
              <span className="text-gray-700 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data form per grup */}
      {cfg.groups.map((group, gi) => (
        <div key={gi} className="card overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {group.title}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {group.fields.map((field) => (
              <div key={field.name}
                   className="flex gap-3 px-4 py-3 text-sm hover:bg-gray-50/50">
                <span className="text-gray-400 w-40 shrink-0 text-xs pt-0.5">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-0.5">*</span>}
                </span>
                <span className="text-gray-800 flex-1 whitespace-pre-wrap leading-relaxed text-xs">
                  {displayVal(field, form[field.name])}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


// ── Step 4: hasil generate ───────────────────────────────────
function StepHasil({ hasil, onBuatLagi }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-5">
      {/* Animasi centang */}
      <div className="w-20 h-20 rounded-full bg-hijau-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-hijau-600" fill="none" stroke="currentColor"
             strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800">Dokumen Berhasil Dibuat!</h3>
        <p className="text-sm text-gray-500 mt-1">
          Dokumen telah disimpan dan siap diunduh atau diedit.
        </p>
      </div>

      {/* Tombol aksi dokumen */}
      <div className="flex flex-wrap gap-3 justify-center">
        <a href={hasil?.docsUrl ?? '#'} target="_blank" rel="noopener noreferrer"
           className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          Buka Google Docs
        </a>
        <a href={hasil?.pdfUrl ?? '#'} target="_blank" rel="noopener noreferrer"
           className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Unduh PDF
        </a>
      </div>

      {/* Info mode */}
      {hasil?.docsUrl?.includes('SIMULASI') ? (
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
          <span className="font-medium text-emas-600">Mode Demo:</span>{' '}
          Link di atas adalah simulasi. Hubungkan backend Worker dan GAS untuk generate dokumen nyata.
        </p>
      ) : (
        <p className="text-xs text-hijau-600 max-w-xs leading-relaxed font-medium">
          ✓ Dokumen tersimpan di Google Drive Anda.
        </p>
      )}

      <button onClick={onBuatLagi} className="btn-secondary text-sm">
        <IcoReset /> Buat Dokumen Lain
      </button>
    </div>
  )
}


// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function CreateDocument() {
  const navigate               = useNavigate()
  const { toasts, removeToast, toast } = useToast()

  // Step: 0=pilih jenis | 1=isi form | 2=preview | 3=selesai
  const [step,    setStep]    = useState(0)
  const [jenis,   setJenis]   = useState('')
  const [form,    setForm]    = useState({})
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [hasil,   setHasil]   = useState(null)

  // Config jenis yang dipilih
  const cfg = useMemo(() => (jenis ? DOC_FIELDS[jenis] : null), [jenis])

  // ── Handler ────────────────────────────────────────────────
  function handlePilihJenis(val) {
    setJenis(val)
    setForm({})
    setErrors({})
    setHasil(null)
  }

  function handleChange(e) {
    const { name, value, type: t, checked } = e.target
    setForm(prev => ({ ...prev, [name]: t === 'checkbox' ? checked : value }))
    // Hapus error field saat diisi
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // Lanjut dari step 0 → 1
  function handleLanjutKeForm() {
    if (!jenis) {
      toast.error('Pilih jenis dokumen terlebih dahulu.')
      return
    }
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Lanjut dari step 1 → 2 (preview), dengan validasi
  function handleLanjutKePreview() {
    const errs = validate(cfg.groups, form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Lengkapi field yang wajib diisi.')
      // Scroll ke error pertama
      const firstErr = Object.keys(errs)[0]
      document.getElementById(`field-${firstErr}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate dokumen — panggil API nyata (atau simulasi jika dummy)
  async function handleGenerate() {
    setLoading(true)
    try {
      // Payload lengkap: data form + data sekolah
      const payload = {
        jenis,
        namaSekolah:         SEKOLAH.nama,
        npsn:                SEKOLAH.npsn,
        namaKepsek:          SEKOLAH.namaKepsek,
        nipKepsek:           SEKOLAH.nipKepsek,
        tahunAjaran:         SEKOLAH.tahunAjaran,
        dibuatOleh:          'admin',
        penandaTanganLabel:  labelPenanda(form.penandaTangan),
        ...form,
      }

      // Panggil API (Worker → GAS), atau simulasi jika backend belum aktif
      const res = await createDocument(payload)

      setHasil({
        docsUrl: res.docUrl  || res.docsUrl || '#',
        pdfUrl:  res.pdfUrl  || '#',
        id:      res.id      || '',
      })
      toast.success(res.message || 'Dokumen berhasil dibuat!')
      setStep(3)

    } catch (err) {
      // Pesan ramah untuk operator sekolah
      const msg = err.message || 'Gagal membuat dokumen. Coba lagi atau hubungi administrator.'
      toast.error(msg)
    } finally {
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Reset ke awal
  function handleReset() {
    setStep(0)
    setJenis('')
    setForm({})
    setErrors({})
    setHasil(null)
  }


  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-2xl space-y-5 pb-8">

        {/* ── Step bar ── */}
        <StepBar current={step} />

        {/* ── Judul halaman ── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {step === 0 && 'Pilih Jenis Dokumen'}
              {step === 1 && `Isi Data — ${cfg?.label ?? ''}`}
              {step === 2 && 'Preview & Konfirmasi'}
              {step === 3 && 'Dokumen Selesai'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 0 && 'Pilih jenis dokumen yang akan dibuat.'}
              {step === 1 && 'Isi semua field yang diperlukan. Tanda * wajib diisi.'}
              {step === 2 && 'Periksa kembali data sebelum dokumen dibuat.'}
              {step === 3 && 'Dokumen Anda telah berhasil dibuat dan disimpan.'}
            </p>
          </div>
          {/* Badge jenis dipilih di step 1–2 */}
          {(step === 1 || step === 2) && cfg && (
            <span className="badge-gray text-xs shrink-0">{cfg.label}</span>
          )}
        </div>

        {/* ── Panel konten per step ── */}
        <div className="card p-5">

          {step === 0 && (
            <StepPilihJenis jenis={jenis} onPilih={handlePilihJenis} />
          )}

          {step === 1 && cfg && (
            <StepIsiForm
              cfg={cfg}
              form={form}
              errors={errors}
              onChange={handleChange}
            />
          )}

          {step === 2 && cfg && (
            <StepPreview cfg={cfg} form={form} jenis={jenis} />
          )}

          {step === 3 && (
            <StepHasil hasil={hasil} onBuatLagi={handleReset} />
          )}
        </div>

        {/* ── Tombol navigasi (tidak tampil di step 3) ── */}
        {step < 3 && (
          <div className="flex items-center justify-between gap-3">
            {/* Tombol kembali */}
            <div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="btn-secondary"
                >
                  ← Kembali
                </button>
              )}
            </div>

            {/* Tombol kanan */}
            <div className="flex gap-3">
              {/* Reset */}
              {step > 0 && (
                <button type="button" onClick={handleReset} className="btn-secondary">
                  <IcoReset /> Reset
                </button>
              )}

              {/* Step 0: lanjut ke form */}
              {step === 0 && (
                <button
                  type="button"
                  onClick={handleLanjutKeForm}
                  disabled={!jenis}
                  className="btn-primary disabled:opacity-40"
                >
                  Lanjut →
                </button>
              )}

              {/* Step 1: lanjut ke preview */}
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleLanjutKePreview}
                  className="btn-primary"
                >
                  <IcoEye /> Preview Data
                </button>
              )}

              {/* Step 2: generate */}
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <><IcoSpin /> Membuat Dokumen...</>
                  ) : (
                    <><IcoDoc /> Buat Dokumen</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
