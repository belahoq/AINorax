// ============================================================
// CreateDocument.jsx — Halaman Buat Dokumen
// ============================================================
import { useState } from 'react'
import { buatDokumen } from '../lib/api'
import { JENIS_DOKUMEN, SEKOLAH } from '../lib/constants'
import FormField from '../components/FormField'
import { useToast, ToastContainer } from '../components/Toast'

// ============================================================
// Definisi field per jenis dokumen
// ============================================================
const FORM_FIELDS = {
  undangan_rapat: [
    { name: 'nomorSurat',  label: 'Nomor Surat',       type: 'text',     placeholder: '001/UN/VI/2026', required: true },
    { name: 'perihal',     label: 'Perihal',            type: 'text',     placeholder: 'Rapat Komite Sekolah', required: true },
    { name: 'hari',        label: 'Hari',               type: 'text',     placeholder: 'Senin', required: true },
    { name: 'tanggal',     label: 'Tanggal',            type: 'date',     required: true },
    { name: 'waktu',       label: 'Waktu',              type: 'text',     placeholder: '09.00 WITA - selesai', required: true },
    { name: 'tempat',      label: 'Tempat',             type: 'text',     placeholder: 'Ruang Kepala Sekolah', required: true },
    { name: 'peserta',     label: 'Peserta Rapat',      type: 'textarea', placeholder: 'Daftar peserta...', rows: 3 },
  ],
  pemberitahuan_ortu: [
    { name: 'nomorSurat',       label: 'Nomor Surat',         type: 'text',     required: true },
    { name: 'perihal',          label: 'Perihal',             type: 'text',     required: true },
    { name: 'namaSiswa',        label: 'Nama Siswa',          type: 'text',     required: true },
    { name: 'kelas',            label: 'Kelas',               type: 'text',     placeholder: 'VI-A' },
    { name: 'isiPemberitahuan', label: 'Isi Pemberitahuan',   type: 'textarea', rows: 4, required: true },
  ],
  persetujuan_wali: [
    { name: 'nomorSurat',         label: 'Nomor Surat',          type: 'text', required: true },
    { name: 'namaSiswa',          label: 'Nama Siswa',           type: 'text', required: true },
    { name: 'kelas',              label: 'Kelas',                type: 'text' },
    { name: 'namaWali',           label: 'Nama Wali Murid',      type: 'text', required: true },
    { name: 'perihalPersetujuan', label: 'Perihal Persetujuan',  type: 'textarea', rows: 3, required: true },
  ],
  surat_keterangan: [
    { name: 'nomorSurat',  label: 'Nomor Surat',           type: 'text', required: true },
    { name: 'namaPihak',   label: 'Nama Yang Diterangkan', type: 'text', required: true },
    { name: 'keperluan',   label: 'Keperluan',             type: 'text', required: true },
    { name: 'keterangan',  label: 'Isi Keterangan',        type: 'textarea', rows: 4 },
  ],
  sk_panitia: [
    { name: 'nomorSK',        label: 'Nomor SK',            type: 'text',     required: true },
    { name: 'namaKegiatan',   label: 'Nama Kegiatan',       type: 'text',     required: true },
    { name: 'tanggal',        label: 'Tanggal',             type: 'date',     required: true },
    { name: 'daftarPanitia',  label: 'Daftar Panitia',      type: 'textarea', rows: 5,
      placeholder: 'Contoh:\nKetua: Budi Santoso\nSekretaris: Ani Rahayu', required: true },
  ],
  berita_acara: [
    { name: 'nomorBA',    label: 'Nomor Berita Acara', type: 'text',     required: true },
    { name: 'kegiatan',   label: 'Kegiatan',           type: 'text',     required: true },
    { name: 'tanggal',    label: 'Tanggal',            type: 'date',     required: true },
    { name: 'tempat',     label: 'Tempat',             type: 'text',     required: true },
    { name: 'peserta',    label: 'Peserta',            type: 'textarea', rows: 3 },
    { name: 'isi',        label: 'Isi Berita Acara',   type: 'textarea', rows: 5, required: true },
  ],
  proposal_kegiatan: [
    { name: 'namaKegiatan',    label: 'Nama Kegiatan',    type: 'text',     required: true },
    { name: 'latarBelakang',   label: 'Latar Belakang',   type: 'textarea', rows: 4, required: true },
    { name: 'tujuan',          label: 'Tujuan',           type: 'textarea', rows: 3, required: true },
    { name: 'waktuPelaksanaan',label: 'Waktu Pelaksanaan',type: 'text' },
    { name: 'anggaran',        label: 'Perkiraan Anggaran', type: 'text', placeholder: 'Rp 1.000.000' },
  ],
  notulen_rapat: [
    { name: 'tanggalRapat', label: 'Tanggal Rapat',    type: 'date',     required: true },
    { name: 'agenda',       label: 'Agenda Rapat',     type: 'text',     required: true },
    { name: 'peserta',      label: 'Peserta Rapat',    type: 'textarea', rows: 3, required: true },
    { name: 'hasilRapat',   label: 'Hasil Keputusan',  type: 'textarea', rows: 5, required: true },
    { name: 'notulis',      label: 'Notulis',          type: 'text',     required: true },
  ],
}

export default function CreateDocument() {
  const { toasts, removeToast, toast } = useToast()

  const [jenis,   setJenis]   = useState('')
  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(false)
  const [hasil,   setHasil]   = useState(null) // { docsUrl, pdfUrl }

  // Saat ganti jenis dokumen, reset form
  function handleJenisChange(e) {
    setJenis(e.target.value)
    setForm({})
    setHasil(null)
  }

  // Handle perubahan field form
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Submit generate dokumen
  async function handleSubmit(e) {
    e.preventDefault()
    if (!jenis) {
      toast.error('Pilih jenis dokumen terlebih dahulu.')
      return
    }
    setLoading(true)
    setHasil(null)
    try {
      const res = await buatDokumen({
        jenis,
        namaSekolah: SEKOLAH.nama,
        namaKepsek:  SEKOLAH.namaKepsek,
        nipKepsek:   SEKOLAH.nipKepsek,
        tahunAjaran: SEKOLAH.tahunAjaran,
        ...form,
      })
      setHasil(res)
      toast.success('Dokumen berhasil dibuat!')
    } catch (err) {
      toast.error(err.message || 'Gagal membuat dokumen.')
    } finally {
      setLoading(false)
    }
  }

  const fields = jenis ? (FORM_FIELDS[jenis] || []) : []
  const labelJenis = JENIS_DOKUMEN.find((j) => j.value === jenis)?.label || ''

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-2xl space-y-5">

        {/* === Pilih Jenis Dokumen === */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pilih Jenis Dokumen</h3>
          <FormField
            label="Jenis Dokumen"
            type="select"
            name="jenis"
            value={jenis}
            onChange={handleJenisChange}
            options={JENIS_DOKUMEN}
            required
          />
        </div>

        {/* === Form Data Dokumen === */}
        {jenis && (
          <form onSubmit={handleSubmit}>
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Data {labelJenis}
              </h3>

              {/* Field dinamis sesuai jenis */}
              {fields.map((field) => (
                <FormField
                  key={field.name}
                  {...field}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                />
              ))}

              {/* Tombol submit */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                      </svg>
                      Membuat Dokumen...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                      Buat Dokumen
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm({}); setHasil(null) }}
                  className="btn-secondary"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        )}

        {/* === Hasil Generate === */}
        {hasil && (
          <div className="card p-5 border-l-4 border-hijau-500 bg-hijau-50">
            <p className="text-sm font-semibold text-hijau-700 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Dokumen berhasil dibuat!
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={hasil.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Buka Google Docs
              </a>
              <a
                href={hasil.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
