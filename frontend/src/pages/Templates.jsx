// ============================================================
// Templates.jsx — Halaman Kelola Template Dokumen
// Fitur: Tambah, Edit, Clone, Hapus template Google Docs
// ============================================================
import { useState, useEffect } from 'react'
import {
  listTemplates,
  addTemplate,
  editTemplate,
  cloneTemplate,
  deleteTemplate,
} from '../lib/api'
import { JENIS_DOKUMEN } from '../lib/constants'
import FormField    from '../components/FormField'
import EmptyState   from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { useToast, ToastContainer } from '../components/Toast'

// ── Nilai awal form kosong ───────────────────────────────────
const EMPTY_FORM = {
  namaTemplate:   '',
  jenisDokumen:   '',
  docsTemplateId: '',
  variabel:       '',
}

// ── Helper: ubah array variabel → string CSV ─────────────────
function variabelToString(v) {
  if (!v) return ''
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}

// ── Ikon SVG inline ──────────────────────────────────────────
const IcoPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IcoEdit = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IcoClone = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
)
const IcoTrash = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)
const IcoDoc = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
)

// ============================================================
// Sub-komponen: Form Tambah / Edit (dipakai di dua modal)
// ============================================================
function TemplateForm({ form, onChange, onSubmit, onCancel, saving, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        label="Nama Template"
        name="namaTemplate"
        type="text"
        value={form.namaTemplate}
        onChange={onChange}
        placeholder="Contoh: Template Undangan Rapat"
        required
      />
      <FormField
        label="Jenis Dokumen"
        name="jenisDokumen"
        type="select"
        value={form.jenisDokumen}
        onChange={onChange}
        options={JENIS_DOKUMEN}
        required
      />
      <FormField
        label="Google Docs Template ID"
        name="docsTemplateId"
        type="text"
        value={form.docsTemplateId}
        onChange={onChange}
        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
        hint="ID file Google Docs — salin dari URL: /document/d/[ID DI SINI]/edit"
        required
      />
      <FormField
        label="Variabel Template"
        name="variabel"
        type="text"
        value={form.variabel}
        onChange={onChange}
        placeholder="nomorSurat, perihal, tanggal, tempat"
        hint="Tulis nama variabel {{...}} dipisah koma. Kosongkan jika tidak ada."
      />
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
          ) : isEdit ? 'Simpan Perubahan' : 'Simpan Template'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  )
}

// ============================================================
// Sub-komponen: Modal Edit
// ============================================================
function ModalEdit({ template, onSave, onClose }) {
  const [form, setForm]     = useState({
    namaTemplate:   template.namaTemplate   || '',
    jenisDokumen:   template.jenisDokumen   || '',
    docsTemplateId: template.docsTemplateId || '',
    variabel:       variabelToString(template.variabel),
  })
  const [saving, setSaving] = useState(false)
  const { toasts, removeToast, toast } = useToast()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.namaTemplate || !form.jenisDokumen || !form.docsTemplateId) {
      toast.error('Isi semua field yang wajib diisi.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan perubahan.')
      setSaving(false)
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header modal */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Edit Template</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Ubah data template: <span className="font-medium text-gray-600">{template.namaTemplate}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Body modal */}
          <div className="px-5 py-5">
            <TemplateForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={onClose}
              saving={saving}
              isEdit
            />
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================
// Sub-komponen: Kartu satu template
// ============================================================
function TemplateCard({ tmpl, onEdit, onClone, onHapus }) {
  const labelJenis = JENIS_DOKUMEN.find(j => j.value === tmpl.jenisDokumen)?.label || tmpl.jenisDokumen

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">

        {/* Ikon template */}
        <div className="w-10 h-10 rounded-lg bg-navy-100 text-navy-700 flex items-center
                        justify-center shrink-0 mt-0.5">
          <IcoDoc />
        </div>

        {/* Info template */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{tmpl.namaTemplate}</p>
              <p className="text-xs text-gray-500 mt-0.5">{labelJenis}</p>
            </div>
            {/* Badge aktif/nonaktif */}
            {tmpl.isActive === false && (
              <span className="badge badge-gray text-[10px] shrink-0">Nonaktif</span>
            )}
          </div>

          {/* Docs Template ID */}
          {tmpl.docsTemplateId ? (
            <a
              href={`https://docs.google.com/document/d/${tmpl.docsTemplateId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-hijau-600
                         hover:text-hijau-700 hover:underline font-mono mt-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {tmpl.docsTemplateId.length > 24
                ? tmpl.docsTemplateId.slice(0, 24) + '…'
                : tmpl.docsTemplateId}
            </a>
          ) : (
            <p className="text-[11px] text-gray-400 mt-1.5 italic">Belum ada Google Docs ID</p>
          )}

          {/* Variabel placeholder */}
          {tmpl.variabel?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tmpl.variabel.map((v, i) => (
                <span key={i} className="badge badge-gray text-[10px] font-mono">{`{{${v}}}`}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Baris aksi — di bawah info */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
        {/* Buka Google Docs */}
        {tmpl.docsTemplateId && (
          <a
            href={`https://docs.google.com/document/d/${tmpl.docsTemplateId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Buka Docs
          </a>
        )}

        <div className="flex-1" /> {/* spacer */}

        {/* Edit */}
        <button
          onClick={() => onEdit(tmpl)}
          title="Edit template"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-emas-50 text-emas-700 hover:bg-emas-100 border border-emas-200
                     transition-colors duration-150"
        >
          <IcoEdit /> Edit
        </button>

        {/* Clone */}
        <button
          onClick={() => onClone(tmpl)}
          title="Duplikat template ini"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-navy-50 text-navy-700 hover:bg-navy-100 border border-navy-200
                     transition-colors duration-150"
        >
          <IcoClone /> Duplikat
        </button>

        {/* Hapus */}
        <button
          onClick={() => onHapus(tmpl.id)}
          title="Hapus template"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-red-50 text-red-600 hover:bg-red-100 border border-red-200
                     transition-colors duration-150"
        >
          <IcoTrash /> Hapus
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Komponen utama Templates
// ============================================================
export default function Templates() {
  const { toasts, removeToast, toast } = useToast()

  const [data,         setData]         = useState([])
  const [loading,      setLoading]      = useState(true)

  // State form Tambah
  const [showTambah,   setShowTambah]   = useState(false)
  const [formTambah,   setFormTambah]   = useState(EMPTY_FORM)
  const [savingTambah, setSavingTambah] = useState(false)

  // State modal Edit
  const [tmplEdit,     setTmplEdit]     = useState(null)  // template yang sedang diedit

  // State konfirmasi hapus
  const [konfirmHapus, setKonfirmHapus] = useState(null)

  // State loading aksi (clone, hapus)
  const [loadingAksi,  setLoadingAksi]  = useState(false)

  // ── Muat data ─────────────────────────────────────────────
  async function muatData() {
    try {
      const arr = await listTemplates()
      setData(arr || [])
    } catch {
      toast.error('Gagal memuat daftar template.')
    }
  }

  useEffect(() => {
    muatData().finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handler form Tambah ───────────────────────────────────
  function handleChangeTambah(e) {
    const { name, value } = e.target
    setFormTambah(prev => ({ ...prev, [name]: value }))
  }

  async function handleTambah(e) {
    e.preventDefault()
    if (!formTambah.namaTemplate || !formTambah.jenisDokumen || !formTambah.docsTemplateId) {
      toast.error('Isi semua field yang wajib diisi.')
      return
    }
    setSavingTambah(true)
    try {
      await addTemplate({
        ...formTambah,
        variabel: formTambah.variabel.split(',').map(v => v.trim()).filter(Boolean),
      })
      toast.success('Template berhasil ditambahkan.')
      setFormTambah(EMPTY_FORM)
      setShowTambah(false)
      await muatData()
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan template.')
    } finally {
      setSavingTambah(false)
    }
  }

  // ── Handler Edit ──────────────────────────────────────────
  async function handleSimpanEdit(formBaru) {
    // formBaru: { namaTemplate, jenisDokumen, docsTemplateId, variabel (string) }
    await editTemplate(tmplEdit.id, {
      ...formBaru,
      variabel: formBaru.variabel.split(',').map(v => v.trim()).filter(Boolean),
    })
    toast.success('Template berhasil diperbarui.')
    setTmplEdit(null)
    await muatData()
  }

  // ── Handler Clone ─────────────────────────────────────────
  async function handleClone(tmpl) {
    setLoadingAksi(true)
    try {
      await cloneTemplate(tmpl)
      toast.success(`Duplikat "Salinan dari ${tmpl.namaTemplate}" berhasil dibuat.`)
      await muatData()
    } catch (err) {
      toast.error(err.message || 'Gagal menduplikat template.')
    } finally {
      setLoadingAksi(false)
    }
  }

  // ── Handler Hapus ─────────────────────────────────────────
  async function handleHapus(id) {
    setLoadingAksi(true)
    try {
      await deleteTemplate(id)
      // Hapus dari state lokal langsung (optimistic update)
      setData(prev => prev.filter(t => t.id !== id))
      toast.success('Template berhasil dihapus.')
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus template.')
    } finally {
      setLoadingAksi(false)
      setKonfirmHapus(null)
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-3xl space-y-5 pb-8">

        {/* ── Header halaman ── */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">Template Dokumen</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Kelola template Google Docs yang digunakan untuk generate dokumen.
            </p>
          </div>
          <button
            onClick={() => { setShowTambah(v => !v); setFormTambah(EMPTY_FORM) }}
            className="btn-primary shrink-0"
          >
            <IcoPlus />
            {showTambah ? 'Batal' : 'Tambah Template'}
          </button>
        </div>

        {/* ── Form Tambah Template ── */}
        {showTambah && (
          <div className="card p-5 border-l-4 border-hijau-400">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <IcoPlus />
              Tambah Template Baru
            </h3>
            <TemplateForm
              form={formTambah}
              onChange={handleChangeTambah}
              onSubmit={handleTambah}
              onCancel={() => setShowTambah(false)}
              saving={savingTambah}
              isEdit={false}
            />
          </div>
        )}

        {/* ── Panduan singkat ── */}
        {!showTambah && data.length === 0 && !loading && (
          <div className="card p-4 bg-emas-50 border border-emas-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-emas-600 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                   strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div className="text-sm text-emas-800 space-y-1">
                <p className="font-semibold">Cara menggunakan Template</p>
                <ol className="text-xs text-emas-700 list-decimal list-inside space-y-0.5">
                  <li>Buat template di Google Docs dengan placeholder <code className="bg-emas-100 px-1 rounded">{'{{namaVariabel}}'}</code></li>
                  <li>Salin ID file dari URL Google Docs</li>
                  <li>Klik "Tambah Template" di atas → isi form → simpan</li>
                  <li>Template siap dipakai saat membuat dokumen</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ── Daftar Template ── */}
        {loading ? (
          <LoadingState />
        ) : data.length === 0 ? (
          <div className="card">
            <EmptyState
              title="Belum ada template"
              subtitle="Tambahkan template Google Docs untuk mulai membuat dokumen secara otomatis."
              action={
                <button onClick={() => setShowTambah(true)} className="btn-primary">
                  <IcoPlus /> Tambah Template Pertama
                </button>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Info jumlah */}
            <p className="text-xs text-gray-400 px-1">
              {data.length} template terdaftar
              {loadingAksi && <span className="ml-2 text-hijau-600 font-medium">Memproses...</span>}
            </p>

            {data.map(tmpl => (
              <TemplateCard
                key={tmpl.id}
                tmpl={tmpl}
                onEdit={setTmplEdit}
                onClone={handleClone}
                onHapus={setKonfirmHapus}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Modal Edit ── */}
      {tmplEdit && (
        <ModalEdit
          template={tmplEdit}
          onSave={handleSimpanEdit}
          onClose={() => setTmplEdit(null)}
        />
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {konfirmHapus && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setKonfirmHapus(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* Ikon peringatan */}
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor"
                   strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 text-center mb-2">Hapus Template?</h3>
            <p className="text-sm text-gray-500 text-center mb-1 leading-relaxed">
              Template akan dihapus dari daftar.
            </p>
            <p className="text-xs text-gray-400 text-center mb-5">
              File Google Docs <strong>tidak</strong> akan ikut terhapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setKonfirmHapus(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Batal
              </button>
              <button
                onClick={() => handleHapus(konfirmHapus)}
                className="btn-danger flex-1 justify-center"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
