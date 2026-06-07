// ============================================================
// Archive.jsx — Halaman Arsip Dokumen
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import { getArsipDokumen, hapusDokumen } from '../lib/api'
import { JENIS_DOKUMEN } from '../lib/constants'
import DataTable    from '../components/DataTable'
import EmptyState   from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { useToast, ToastContainer } from '../components/Toast'

// Format tanggal
function formatTanggal(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export default function Archive() {
  const { toasts, removeToast, toast } = useToast()

  const [data,        setData]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [konfirmHapus, setKonfirmHapus] = useState(null) // id dokumen yang mau dihapus

  // Ambil data arsip
  useEffect(() => {
    getArsipDokumen()
      .then((res) => setData(res.data || []))
      .catch(() => toast.error('Gagal memuat arsip dokumen.'))
      .finally(() => setLoading(false))
  }, [])

  // Filter + search
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const cocokJenis = filterJenis ? row.jenisDokumen === filterJenis : true
      const cocokCari  = search
        ? row.nomorSurat?.toLowerCase().includes(search.toLowerCase()) ||
          row.perihal?.toLowerCase().includes(search.toLowerCase())
        : true
      return cocokJenis && cocokCari
    })
  }, [data, search, filterJenis])

  // Hapus dokumen
  async function handleHapus(id) {
    try {
      await hapusDokumen(id)
      setData((prev) => prev.filter((d) => d.id !== id))
      toast.success('Dokumen berhasil dihapus.')
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus dokumen.')
    } finally {
      setKonfirmHapus(null)
    }
  }

  // Definisi kolom tabel
  const columns = [
    { key: 'no',          label: 'No',
      render: (_, row) => <span className="text-gray-400">{filteredData.indexOf(row) + 1}</span> },
    { key: 'jenisDokumen', label: 'Jenis Dokumen' },
    { key: 'nomorSurat',   label: 'Nomor Surat' },
    { key: 'perihal',      label: 'Perihal',
      render: (v) => <span className="max-w-xs truncate block" title={v}>{v}</span> },
    { key: 'tanggalBuat',  label: 'Tanggal',
      render: (v) => formatTanggal(v) },
    { key: 'aksi',         label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {/* Lihat Docs */}
          <a href={row.docsUrl} target="_blank" rel="noopener noreferrer"
             className="text-xs text-navy-700 hover:underline font-medium">
            Lihat
          </a>
          {/* Download PDF */}
          <a href={row.pdfUrl} target="_blank" rel="noopener noreferrer"
             className="text-xs text-hijau-600 hover:underline font-medium">
            PDF
          </a>
          {/* Hapus */}
          <button
            onClick={() => setKonfirmHapus(row.id)}
            className="text-xs text-red-500 hover:underline font-medium"
          >
            Hapus
          </button>
        </div>
      )
    },
  ]

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-4">

        {/* === Filter & Pencarian === */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          {/* Cari */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                 fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Cari nomor surat atau perihal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-sm"
            />
          </div>
          {/* Filter jenis */}
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="form-select sm:w-56 text-sm"
          >
            <option value="">Semua Jenis</option>
            {JENIS_DOKUMEN.map((j) => (
              <option key={j.value} value={j.label}>{j.label}</option>
            ))}
          </select>
        </div>

        {/* === Tabel === */}
        {loading ? (
          <LoadingState />
        ) : filteredData.length === 0 ? (
          <div className="card">
            <EmptyState
              title="Tidak ada dokumen"
              subtitle={search || filterJenis
                ? 'Tidak ada dokumen yang cocok dengan filter.'
                : 'Belum ada dokumen yang diarsipkan.'}
            />
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 px-1">
              Menampilkan {filteredData.length} dari {data.length} dokumen
            </p>
            <DataTable columns={columns} data={filteredData} />
          </>
        )}
      </div>

      {/* === Modal Konfirmasi Hapus === */}
      {konfirmHapus && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Hapus Dokumen?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Dokumen akan dihapus dari arsip dan Google Drive. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setKonfirmHapus(null)}
                className="btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={() => handleHapus(konfirmHapus)}
                className="btn-danger"
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
