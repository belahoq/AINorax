// ============================================================
// MasterData.jsx — Halaman Master Data Sekolah
// ============================================================
import { useState, useEffect } from 'react'
import { getMasterData, updateMasterData } from '../lib/api'
import FormField    from '../components/FormField'
import LoadingState from '../components/LoadingState'
import { useToast, ToastContainer } from '../components/Toast'

// Definisi field per seksi
const SEKSI = [
  {
    judul: 'Profil Sekolah',
    fields: [
      { name: 'namaSekolah', label: 'Nama Sekolah',    type: 'text', required: true },
      { name: 'npsn',        label: 'NPSN',            type: 'text' },
      { name: 'alamat',      label: 'Alamat Lengkap',  type: 'textarea', rows: 2 },
      { name: 'telepon',     label: 'Nomor Telepon',   type: 'text' },
      { name: 'website',     label: 'Website',         type: 'text' },
      { name: 'email',       label: 'Email Sekolah',   type: 'email' },
    ],
  },
  {
    judul: 'Kepala Sekolah',
    fields: [
      { name: 'namaKepsek', label: 'Nama Kepala Sekolah', type: 'text', required: true },
      { name: 'nipKepsek',  label: 'NIP',                 type: 'text' },
    ],
  },
  {
    judul: 'Tahun Ajaran',
    fields: [
      { name: 'tahunAjaran', label: 'Tahun Ajaran Aktif', type: 'text',
        placeholder: '2025/2026', required: true },
    ],
  },
]

export default function MasterData() {
  const { toasts, removeToast, toast } = useToast()

  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  // Muat data awal
  useEffect(() => {
    getMasterData()
      .then((data) => setForm(data || {}))
      .catch(() => toast.error('Gagal memuat data master.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSimpan(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateMasterData(form)
      toast.success('Data master berhasil disimpan.')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState full />

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <form onSubmit={handleSimpan} className="max-w-2xl space-y-5">

        {SEKSI.map((seksi) => (
          <div key={seksi.judul} className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
              {seksi.judul}
            </h3>
            {seksi.fields.map((field) => (
              <FormField
                key={field.name}
                {...field}
                value={form[field.name] || ''}
                onChange={handleChange}
              />
            ))}
          </div>
        ))}

        {/* Tombol simpan */}
        <div className="flex gap-3 pb-6">
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
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17,21 17,13 7,13 7,21"/>
                  <polyline points="7,3 7,8 15,8"/>
                </svg>
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

      </form>
    </>
  )
}
