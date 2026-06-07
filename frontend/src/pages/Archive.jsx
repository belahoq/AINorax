// ============================================================
// Archive.jsx — Halaman Arsip Dokumen
// Data dari API nyata jika backend aktif, fallback ke dummy.
// ============================================================
import { useState, useMemo, useEffect } from 'react'
import { useNavigate }       from 'react-router-dom'
import {
  DUMMY_ARSIP_DOKUMEN,
  JENIS_DOKUMEN,
  STATUS_DOKUMEN,
} from '../lib/constants'
import { listDocuments } from '../lib/api'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { useToast, ToastContainer } from '../components/Toast'

// ============================================================
// Helpers
// ============================================================

function fmtTanggal(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function copyToClipboard(text) {
  if (!text || text === '') return false
  navigator.clipboard?.writeText(text).catch(() => {})
  return true
}

// ============================================================
// Sub-komponen: Badge status
// ============================================================
const STATUS_CFG = {
  berhasil: { label: 'Berhasil', cls: 'bg-hijau-100 text-hijau-700 border-hijau-200',  dot: 'bg-hijau-500' },
  draft:    { label: 'Draft',    cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  gagal:    { label: 'Gagal',    cls: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500'    },
}

function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || STATUS_CFG.draft
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                      text-[11px] font-semibold border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  )
}

// ============================================================
// Sub-komponen: Tombol aksi tabel
// ============================================================
function AksiButtons({ row, onHapus, onSalin, toast }) {
  const punya = row.status === 'berhasil' && row.docsUrl

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Buka Docs */}
      {punya ? (
        <a
          href={row.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Buka Google Docs"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                     bg-navy-50 text-navy-700 hover:bg-navy-100 transition-colors"
        >
          <IcoDoc /> Docs
        </a>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs
                         font-medium bg-gray-50 text-gray-300 cursor-not-allowed">
          <IcoDoc /> Docs
        </span>
      )}

      {/* Buka PDF */}
      {punya ? (
        <a
          href={row.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Unduh PDF"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                     bg-hijau-50 text-hijau-700 hover:bg-hijau-100 transition-colors"
        >
          <IcoPdf /> PDF
        </a>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs
                         font-medium bg-gray-50 text-gray-300 cursor-not-allowed">
          <IcoPdf /> PDF
        </span>
      )}

      {/* Salin link */}
      <button
        onClick={() => {
          const url = row.docsUrl || ''
          if (!url) { toast.warning('Dokumen belum tersedia untuk disalin.'); return }
          copyToClipboard(url)
          toast.success('Link berhasil disalin ke clipboard.')
        }}
        title="Salin link Google Docs"
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                   bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <IcoClip />
      </button>

      {/* Hapus */}
      <button
        onClick={() => onHapus(row.id)}
        title="Hapus dokumen"
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                   bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
      >
        <IcoTrash />
      </button>
    </div>
  )
}


// ============================================================
// Sub-komponen: Card mobile satu dokumen
// ============================================================
function DocCard({ row, onHapus, toast }) {
  const s  = STATUS_CFG[row.status] || STATUS_CFG.draft
  const punya = row.status === 'berhasil' && row.docsUrl

  return (
    <div className="card p-4 space-y-3">
      {/* Baris atas: ID + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-mono text-gray-400">{row.id}</p>
          <p className="text-xs text-gray-500 mt-0.5">{fmtTanggal(row.tanggal)}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>

      {/* Jenis + nomor */}
      <div>
        <span className="badge badge-gray text-[11px] mb-1">{row.jenis}</span>
        <p className="text-xs font-mono text-gray-500">{row.nomorSurat}</p>
      </div>

      {/* Perihal */}
      <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
        {row.perihal}
      </p>

      {/* Dibuat oleh */}
      <p className="text-xs text-gray-400">Dibuat oleh: <span className="text-gray-600">{row.dibuatOleh}</span></p>

      {/* Tombol aksi */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 flex-wrap">
        {punya ? (
          <>
            <a href={row.docsUrl} target="_blank" rel="noopener noreferrer"
               className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              <IcoDoc /> Docs
            </a>
            <a href={row.pdfUrl} target="_blank" rel="noopener noreferrer"
               className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
              <IcoPdf /> PDF
            </a>
            <button
              onClick={() => { copyToClipboard(row.docsUrl); toast.success('Link disalin!') }}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <IcoClip /> Salin
            </button>
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">
            {row.status === 'draft' ? 'Dokumen belum selesai' : 'Dokumen gagal dibuat'}
          </span>
        )}
        <button
          onClick={() => onHapus(row.id)}
          className="ml-auto btn-secondary text-xs px-3 py-1.5 text-red-500
                     hover:bg-red-50 hover:border-red-200 flex items-center gap-1"
        >
          <IcoTrash /> Hapus
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Sub-komponen: Modal konfirmasi hapus
// ============================================================
function ModalHapus({ id, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
           onClick={e => e.stopPropagation()}>

        {/* Ikon peringatan */}
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor"
               strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>

        <h3 className="text-base font-bold text-gray-800 text-center mb-1">Hapus Dokumen?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">
          Dokumen <span className="font-semibold text-gray-700">{id}</span> akan dihapus dari arsip.
        </p>
        <p className="text-xs text-red-500 text-center mb-5">Tindakan ini tidak dapat dibatalkan.</p>

        <div className="flex gap-3">
          <button onClick={onCancel}  className="btn-secondary flex-1 justify-center">Batal</button>
          <button onClick={onConfirm} className="btn-danger    flex-1 justify-center">Ya, Hapus</button>
        </div>
      </div>
    </div>
  )
}


// ============================================================
// Kolom tabel desktop
// ============================================================
function buildColumns(onHapus, onSalin, toast) {
  return [
    {
      key: 'id', label: 'ID',
      width: 'w-28',
      sortable: true,
      hideOnMobile: true,
      render: (v) => <span className="font-mono text-[11px] text-gray-500">{v}</span>,
    },
    {
      key: 'tanggal', label: 'Tanggal',
      width: 'w-28',
      sortable: true,
      hideOnMobile: true,
      render: (v) => <span className="text-xs text-gray-600 whitespace-nowrap">{fmtTanggal(v)}</span>,
    },
    {
      key: 'jenis', label: 'Jenis Dokumen',
      sortable: true,
      render: (v) => <span className="badge badge-gray text-[11px] whitespace-nowrap">{v}</span>,
    },
    {
      key: 'nomorSurat', label: 'Nomor Surat',
      width: 'w-36',
      sortable: true,
      hideOnMobile: true,
      render: (v) => <span className="font-mono text-xs text-gray-600">{v}</span>,
    },
    {
      key: 'perihal', label: 'Perihal / Judul',
      render: (v) => (
        <span className="block max-w-xs truncate text-sm text-gray-800" title={v}>{v}</span>
      ),
    },
    {
      key: 'dibuatOleh', label: 'Dibuat Oleh',
      width: 'w-24',
      sortable: true,
      hideOnMobile: true,
      render: (v) => <span className="text-xs text-gray-500">{v}</span>,
    },
    {
      key: 'status', label: 'Status',
      width: 'w-24',
      sortable: true,
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'aksi', label: 'Aksi',
      width: 'w-48',
      render: (_, row) => (
        <AksiButtons row={row} onHapus={onHapus} onSalin={onSalin} toast={toast} />
      ),
    },
  ]
}

// ============================================================
// Komponen utama Archive
// ============================================================
export default function Archive() {
  const navigate               = useNavigate()
  const { toasts, removeToast, toast } = useToast()

  // Data state — mulai dari dummy, akan diganti fetch API
  const [data, setData]         = useState(DUMMY_ARSIP_DOKUMEN)
  const [dataLoading, setDataLoading] = useState(true)

  // Filter & search state
  const [search,       setSearch]       = useState('')
  const [filterJenis,  setFilterJenis]  = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Modal hapus
  const [hapusId, setHapusId] = useState(null)

  // ── Fetch data arsip saat halaman dibuka ─────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const docs = await listDocuments()
        if (mounted && docs?.length) setData(docs)
      } catch {
        // api.js sudah fallback ke dummy — cukup reset loading
      } finally {
        if (mounted) setDataLoading(false)
      }
    })()
    return () => { mounted = false }
  }, []) // intentionally empty — fetch once on mount

  // ── Filter + search ────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return data.filter(row => {
      if (filterJenis  && row.jenis      !== filterJenis)  return false
      if (filterStatus && row.status     !== filterStatus) return false
      if (q) {
        const haystack = [
          row.id, row.nomorSurat, row.perihal,
          row.jenis, row.dibuatOleh,
        ].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [data, search, filterJenis, filterStatus])

  // ── Hapus ──────────────────────────────────────────────────
  function handleHapus(id) { setHapusId(id) }

  function konfirmHapus() {
    setData(prev => prev.filter(d => d.id !== hapusId))
    toast.success('Dokumen berhasil dihapus dari arsip.')
    setHapusId(null)
  }

  // ── Reset filter ───────────────────────────────────────────
  function resetFilter() {
    setSearch('')
    setFilterJenis('')
    setFilterStatus('')
  }

  const adaFilter = search || filterJenis || filterStatus

  // ── Kolom tabel ────────────────────────────────────────────
  const columns = useMemo(
    () => buildColumns(handleHapus, () => {}, toast),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast]
  )

  // ── Hitung per-status ──────────────────────────────────────
  const jumlahStatus = useMemo(() => ({
    semua:    data.length,
    berhasil: data.filter(d => d.status === 'berhasil').length,
    draft:    data.filter(d => d.status === 'draft').length,
    gagal:    data.filter(d => d.status === 'gagal').length,
  }), [data])


  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-4 pb-6">

        {/* ===================================================
            HEADER: judul + tombol buat dokumen
        =================================================== */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">Arsip Dokumen</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Semua dokumen yang telah dibuat tersimpan di sini.
            </p>
          </div>
          <button
            onClick={() => navigate('/buat-dokumen')}
            className="btn-primary shrink-0"
          >
            <IcoPlus /> Buat Dokumen
          </button>
        </div>

        {/* ===================================================
            PILL RINGKASAN STATUS
        =================================================== */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: '',         label: `Semua (${jumlahStatus.semua})`,         cls: 'bg-gray-100 text-gray-600 hover:bg-gray-200'      },
            { key: 'berhasil', label: `Berhasil (${jumlahStatus.berhasil})`,   cls: 'bg-hijau-50 text-hijau-700 hover:bg-hijau-100'    },
            { key: 'draft',    label: `Draft (${jumlahStatus.draft})`,         cls: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'  },
            { key: 'gagal',    label: `Gagal (${jumlahStatus.gagal})`,         cls: 'bg-red-50 text-red-600 hover:bg-red-100'          },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setFilterStatus(p.key)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
                filterStatus === p.key
                  ? 'border-gray-400 ring-2 ring-gray-200 ' + p.cls
                  : 'border-transparent ' + p.cls,
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ===================================================
            TOOLBAR: SEARCH + FILTER
        =================================================== */}
        <div className="card p-3 flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                 fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Cari ID, nomor surat, perihal, jenis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-600 transition-colors"
              >
                <IcoX />
              </button>
            )}
          </div>

          {/* Filter jenis */}
          <select
            value={filterJenis}
            onChange={e => setFilterJenis(e.target.value)}
            className="form-select sm:w-52 text-sm"
          >
            <option value="">Semua Jenis</option>
            {JENIS_DOKUMEN.map(j => (
              <option key={j.value} value={j.label}>{j.label}</option>
            ))}
          </select>

          {/* Filter status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="form-select sm:w-36 text-sm"
          >
            <option value="">Semua Status</option>
            {STATUS_DOKUMEN.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Tombol reset filter */}
          {adaFilter && (
            <button onClick={resetFilter} className="btn-secondary text-sm shrink-0">
              <IcoX /> Reset
            </button>
          )}
        </div>

        {/* ===================================================
            INFO JUMLAH HASIL
        =================================================== */}
        {adaFilter && (
          <p className="text-xs text-gray-500 px-1">
            Ditemukan <span className="font-semibold text-gray-700">{filtered.length}</span> dari{' '}
            <span className="font-semibold text-gray-700">{data.length}</span> dokumen
          </p>
        )}

        {/* ===================================================
            TABEL — DESKTOP (sm ke atas)
        =================================================== */}
        <div className="hidden sm:block">
          <DataTable
            columns={columns}
            data={filtered}
            loading={dataLoading}
            striped
            emptyTitle={adaFilter ? 'Tidak ada hasil' : 'Belum ada dokumen'}
            emptySubtitle={
              adaFilter
                ? 'Coba ubah kata kunci atau filter.'
                : 'Dokumen yang dibuat akan muncul di sini.'
            }
            emptyAction={
              !adaFilter && (
                <button onClick={() => navigate('/buat-dokumen')} className="btn-primary">
                  Buat Dokumen Pertama
                </button>
              )
            }
            footer={
              filtered.length > 0 && (
                <p className="text-xs text-gray-400 text-right">
                  Menampilkan {filtered.length} dokumen
                </p>
              )
            }
          />
        </div>

        {/* ===================================================
            CARD LIST — MOBILE (di bawah sm)
        =================================================== */}
        <div className="sm:hidden space-y-3">
          {dataLoading ? (
            <div className="card"><LoadingState size="sm" /></div>
          ) : filtered.length === 0 ? (
            <div className="card">
              <EmptyState
                title={adaFilter ? 'Tidak ada hasil' : 'Belum ada dokumen'}
                subtitle={
                  adaFilter
                    ? 'Coba ubah kata kunci atau filter.'
                    : 'Dokumen yang dibuat akan muncul di sini.'
                }
                action={
                  !adaFilter && (
                    <button onClick={() => navigate('/buat-dokumen')} className="btn-primary">
                      Buat Dokumen Pertama
                    </button>
                  )
                }
                compact
              />
            </div>
          ) : (
            filtered.map(row => (
              <DocCard
                key={row.id}
                row={row}
                onHapus={handleHapus}
                toast={toast}
              />
            ))
          )}
          {filtered.length > 0 && (
            <p className="text-xs text-gray-400 text-center pt-1">
              Menampilkan {filtered.length} dokumen
            </p>
          )}
        </div>

      </div>

      {/* ===================================================
          MODAL KONFIRMASI HAPUS
      =================================================== */}
      {hapusId && (
        <ModalHapus
          id={hapusId}
          onConfirm={konfirmHapus}
          onCancel={() => setHapusId(null)}
        />
      )}
    </>
  )
}

// ============================================================
// Ikon SVG inline
// ============================================================
function IcoDoc() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
    </svg>
  )
}
function IcoPdf() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function IcoClip() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )
}
function IcoTrash() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}
function IcoPlus() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function IcoX() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  )
}
