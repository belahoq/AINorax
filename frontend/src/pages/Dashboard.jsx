// ============================================================
// Dashboard.jsx — Halaman utama setelah login
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats } from '../lib/api'
import { SEKOLAH } from '../lib/constants'
import StatCard     from '../components/StatCard'
import LoadingState from '../components/LoadingState'

// --- Ikon SVG ---
const DocIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
)
const ArchiveIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5" rx="1"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
)
const TemplateIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
)

// Shortcut aksi cepat
const SHORTCUTS = [
  { label: 'Buat Dokumen Baru',  path: '/buat-dokumen', color: 'bg-hijau-600 hover:bg-hijau-700' },
  { label: 'Lihat Arsip',        path: '/arsip',         color: 'bg-navy-700  hover:bg-navy-800'  },
  { label: 'Kelola Template',    path: '/template',      color: 'bg-emas-500  hover:bg-emas-600'  },
  { label: 'Data Master Sekolah',path: '/master-data',   color: 'bg-gray-600  hover:bg-gray-700'  },
]

// Format tanggal Indonesia
function formatTanggal(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState full />

  return (
    <div className="space-y-6">

      {/* === Sambutan === */}
      <div className="card p-5 bg-gradient-to-r from-hijau-600 to-hijau-500 text-white border-0">
        <p className="text-xs font-semibold tracking-widest uppercase text-hijau-100 mb-1">
          Selamat datang di
        </p>
        <h2 className="text-lg font-bold">SDENTIBAYA AdminKit</h2>
        <p className="text-sm text-hijau-100 mt-0.5">{SEKOLAH.nama}</p>
        <p className="text-xs text-hijau-200 mt-1">
          Kepala Sekolah: {SEKOLAH.namaKepsek} &nbsp;·&nbsp; TA {SEKOLAH.tahunAjaran}
        </p>
      </div>

      {/* === Kartu Statistik === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Dokumen Bulan Ini"
          value={stats?.dokumenBulanIni ?? 0}
          icon={<DocIcon />}
          color="hijau"
          subtitle="dokumen dibuat"
        />
        <StatCard
          title="Total Arsip"
          value={stats?.totalArsip ?? 0}
          icon={<ArchiveIcon />}
          color="navy"
          subtitle="dokumen tersimpan"
        />
        <StatCard
          title="Template Tersedia"
          value={stats?.totalTemplate ?? 0}
          icon={<TemplateIcon />}
          color="emas"
          subtitle="template aktif"
        />
      </div>

      {/* === Aksi Cepat === */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Aksi Cepat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SHORTCUTS.map((s) => (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className={`${s.color} text-white text-sm font-medium py-3 px-4 rounded-xl
                          transition-colors duration-150 text-left`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* === Aktivitas Terbaru === */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Dokumen Terbaru</h3>
        <div className="card overflow-hidden">
          {(!stats?.dokumenTerakhir || stats.dokumenTerakhir.length === 0) ? (
            <p className="p-6 text-sm text-center text-gray-400">Belum ada dokumen dibuat.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {stats.dokumenTerakhir.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* Dot hijau */}
                  <span className="w-2 h-2 rounded-full bg-hijau-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.perihal}</p>
                    <p className="text-xs text-gray-400 truncate">{doc.jenis}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                    {formatTanggal(doc.tanggal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  )
}
