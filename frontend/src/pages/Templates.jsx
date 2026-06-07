// ============================================================
// Templates.jsx — Halaman Kelola Template Dokumen
// ============================================================
import { useState, useEffect } from 'react'
import { listTemplates, addTemplate, deleteTemplate } from '../lib/api'
import { JENIS_DOKUMEN } from '../lib/constants'
import FormField    from '../components/FormField'
import EmptyState   from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { useToast, ToastContainer } from '../components/Toast'

const EMPTY_FORM = { namaTemplate: '', jenisDokumen: '', docsTemplateId: '', variabel: '' }

export default function Templates() {
  const { toasts, removeToast, toast } = useToast()

  const [data,         setData]         = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [saving,       setSaving]       = useState(false)
  const [konfirmHapus, setKonfirmHapus] = useState(null)

  useEffect(() => {
    listTemplates()
      .then((arr) => setData(arr || []))
      .catch(() => toast.error('Gagal memuat template.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleTambah(e) {
    e.preventDefault()
    if (!form.namaTemplate || !form.jenisDokumen || !form.docsTemplateId) {
      toast.error('Isi semua field wajib.')
      return
    }
    setSaving(true)
    try {
      await addTemplate({
        ...form,
        variabel: form.variabel.split(',').map((v) => v.trim()).filter(Boolean),
      })
      toast.success('Template berhasil ditambahkan.')
      // Muat ulang
      const arr = await listTemplates()
      setData(arr || [])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan template.')
    } finally {
      setSaving(false)
    }
  }

  async function handleHapus(id) {
    try {
      await deleteTemplate(id)
      setData((prev) => prev.filter((t) => t.id !== id))
      toast.success('Template berhasil dihapus.')
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus template.')
    } finally {
      setKonfirmHapus(null)
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-3xl space-y-5">

        {/* === Tombol Tambah === */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {showForm ? 'Batal' : 'Tambah Template'}
          </button>
        </div>

        {/* === Form Tambah Template === */}
        {showForm && (
          <form onSubmit={handleTambah} className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Tambah Template Baru</h3>
            <FormField
              label="Nama Template" name="namaTemplate" type="text"
              value={form.namaTemplate} onChange={handleChange}
              placeholder="Template Undangan Rapat" required
            />
            <FormField
              label="Jenis Dokumen" name="jenisDokumen" type="select"
              value={form.jenisDokumen} onChange={handleChange}
              options={JENIS_DOKUMEN} required
            />
            <FormField
              label="Google Docs Template ID" name="docsTemplateId" type="text"
              value={form.docsTemplateId} onChange={handleChange}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              hint="ID file Google Docs (bukan URL lengkap)" required
            />
            <FormField
              label="Variabel Template" name="variabel" type="text"
              value={form.variabel} onChange={handleChange}
              placeholder="nomorSurat, perihal, tanggal, tempat"
              hint="Pisahkan dengan koma. Contoh: nomorSurat, perihal, tanggal"
            />
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Menyimpan...' : 'Simpan Template'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Batal
              </button>
            </div>
          </form>
        )}

        {/* === Daftar Template === */}
        {loading ? (
          <LoadingState />
        ) : data.length === 0 ? (
          <div className="card">
            <EmptyState
              title="Belum ada template"
              subtitle="Tambahkan template Google Docs untuk mulai membuat dokumen."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((tmpl) => (
              <div key={tmpl.id} className="card p-4 flex items-start gap-4">
                {/* Ikon */}
                <div className="w-10 h-10 rounded-lg bg-navy-100 text-navy-700 flex items-center
                                justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{tmpl.namaTemplate}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tmpl.jenisDokumen}</p>
                  {tmpl.variabel?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tmpl.variabel.map((v) => (
                        <span key={v} className="badge-gray text-xs">{`{{${v}}}`}</span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Aksi */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://docs.google.com/document/d/${tmpl.docsTemplateId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Buka Docs
                  </a>
                  <button
                    onClick={() => setKonfirmHapus(tmpl.id)}
                    className="btn-danger text-xs px-3 py-1.5"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal konfirmasi hapus */}
      {konfirmHapus && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Hapus Template?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Template akan dihapus dari daftar. File Google Docs tidak akan ikut terhapus.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setKonfirmHapus(null)} className="btn-secondary">Batal</button>
              <button onClick={() => handleHapus(konfirmHapus)} className="btn-danger">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
