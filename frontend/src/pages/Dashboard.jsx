// ============================================================
// Dashboard.jsx — Halaman utama SDENTIBAYA AdminKit
// Data dari API nyata jika backend aktif, fallback ke dummy.
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate }        from 'react-router-dom'
import { getDashboardStats }  from '../lib/api'
import { SEKOLAH, BRAND, DUMMY_STATS, DUMMY_DOKUMEN_TERBARU, DUMMY_STATUS_SISTEM } from '../lib/constants'
import StatCard     from '../components/StatCard'
import DataTable    from '../components/DataTable'
import LoadingState from '../components/LoadingState'

// ── Helpers ─────────────────────────────────────────────────
function fmtTanggal(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
function getSapaan() {
  const jam = new Date().getHours()
  if (jam < 11) return 'Selamat Pagi'
  if (jam < 15) return 'Selamat Siang'
  if (jam < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

// ── Ikon SVG ─────────────────────────────────────────────────
const Icon = {
  doc:       <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  mail:      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  badge:     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  bell:      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  clipboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  archive:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  list:      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
}

// ── Badge status sistem ──────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    online:               { dot: 'bg-hijau-500 animate-pulse', text: 'text-hijau-700', bg: 'bg-hijau-50',  label: 'Online' },
    offline:              { dot: 'bg-red-500',                 text: 'text-red-700',   bg: 'bg-red-50',    label: 'Offline' },
    unknown:              { dot: 'bg-gray-300',                text: 'text-gray-500',  bg: 'bg-gray-100',  label: 'Belum dicek' },
    TIDAK_DIKONFIGURASI:  { dot: 'bg-emas-400',                text: 'text-emas-700',  bg: 'bg-emas-50',   label: 'Belum diset' },
    ERROR:                { dot: 'bg-red-500',                 text: 'text-red-700',   bg: 'bg-red-50',    label: 'Error' },
    OK:                   { dot: 'bg-hijau-500 animate-pulse', text: 'text-hijau-700', bg: 'bg-hijau-50',  label: 'Terhubung' },
  }
  const s = map[status] || map.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  )
}

// ── Badge jenis dokumen ──────────────────────────────────────
const JENIS_COLOR = {
  'Surat Undangan Rapat':          'badge-blue',
  'Berita Acara':                  'badge-green',
  'SK Panitia':                    'badge-navy',
  'Proposal Kegiatan':             'badge-yellow',
}
function JenisBadge({ jenis }) {
  const cls = JENIS_COLOR[jenis] || 'badge-gray'
  return <span className={`badge ${cls} whitespace-nowrap text-[11px]`}>{jenis}</span>
}

// ── Aksi cepat ───────────────────────────────────────────────
const AKSI_CEPAT = [
  { label: 'Buat Surat Undangan', path: '/buat-dokumen', icon: Icon.bell,      color: 'from-hijau-500 to-hijau-600', desc: 'Undangan rapat & kegiatan' },
  { label: 'Buat SK Panitia',     path: '/buat-dokumen', icon: Icon.badge,     color: 'from-navy-600 to-navy-700',   desc: 'Surat keputusan panitia'   },
  { label: 'Buat Berita Acara',   path: '/buat-dokumen', icon: Icon.clipboard, color: 'from-emas-500 to-emas-600',   desc: 'Dokumentasi kegiatan'      },
  { label: 'Lihat Arsip',         path: '/arsip',        icon: Icon.archive,   color: 'from-gray-600 to-gray-700',   desc: 'Semua dokumen tersimpan'   },
]

// ── Kolom tabel dokumen terbaru ──────────────────────────────
const KOLOM_TERBARU = [
  { key: 'nomorSurat',  label: 'Nomor Surat', width: 'w-36', hideOnMobile: true,
    render: v => <span className="font-mono text-[12px] text-gray-600">{v}</span> },
  { key: 'jenisDokumen', label: 'Jenis',
    render: v => <JenisBadge jenis={v} /> },
  { key: 'perihal', label: 'Perihal',
    render: v => <span className="block max-w-xs truncate text-gray-700" title={v}>{v}</span> },
  { key: 'tanggalBuat', label: 'Tanggal', width: 'w-28', hideOnMobile: true,
    render: v => <span className="text-xs text-gray-500 whitespace-nowrap">{fmtTanggal(v)}</span> },
]

// ── Ikon sistem ──────────────────────────────────────────────
function SistemIcon({ id }) {
  if (id === 'frontend') return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  if (id === 'worker')   return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>
  if (id === 'gas')      return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  return null
}

// ============================================================
// Komponen utama
// ============================================================
export default function Dashboard() {
  const navigate = useNavigate()

  const [stats,          setStats]         = useState(null)
  const [dokumenTerbaru, setDokumenTerbaru] = useState(DUMMY_DOKUMEN_TERBARU)
  const [statusSistem,   setStatusSistem]  = useState(DUMMY_STATUS_SISTEM)
  const [loading,        setLoading]       = useState(true)
  const [isLive,         setIsLive]        = useState(false) // apakah data dari API

  const hari = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getDashboardStats()
        if (!mounted) return
        setStats(data)
        if (data.dokumenTerbaru?.length) setDokumenTerbaru(data.dokumenTerbaru)
        if (data.statusSistem?.length)   setStatusSistem(data.statusSistem)
        setIsLive(!!import.meta.env.VITE_API_URL)
      } catch {
        // fallback ke DUMMY_STATS sudah dilakukan di api.js
        if (!mounted) return
        setStats(DUMMY_STATS)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const s = stats || DUMMY_STATS

  return (
    <div className="space-y-6 pb-4">

      {/* 1. BANNER SAMBUTAN */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f1729] via-navy-800 to-hijau-700 text-white p-5 sm:p-6">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-6 w-36 h-36 rounded-full bg-hijau-500/10 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-1">
              {getSapaan()}, Admin 👋
            </p>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              {BRAND.nama} <span className="font-light text-hijau-300">{BRAND.produk}</span>
            </h2>
            <p className="text-sm text-white/60 mt-1">{SEKOLAH.nama}</p>
            <p className="text-xs text-white/40 mt-0.5">
              Kepala Sekolah: {SEKOLAH.namaKepsek} &nbsp;·&nbsp; TA {SEKOLAH.tahunAjaran}
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <p className="text-xs text-white/40 capitalize">{hari}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-hijau-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-widest text-white/70 uppercase">{BRAND.slogan}</span>
            </div>
            {/* Badge mode data */}
            {!loading && (
              <div className="mt-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${isLive ? 'bg-hijau-500/20 text-hijau-300' : 'bg-white/10 text-white/40'}`}>
                  {isLive ? '● Data Live' : '○ Mode Demo'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATISTIK */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Ringkasan Dokumen</h3>
        {loading ? <LoadingState size="sm" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Total Dokumen"  value={s.totalDokumen}   icon={Icon.doc}       color="hijau" subtitle="semua jenis"        trend={s.trend?.totalDokumen}   compact />
            <StatCard title="Surat Keluar"   value={s.suratKeluar}    icon={Icon.mail}      color="navy"  subtitle="surat resmi"         trend={s.trend?.suratKeluar}    compact />
            <StatCard title="SK Panitia"     value={s.skPanitia}      icon={Icon.badge}     color="emas"  subtitle="surat keputusan"     trend={s.trend?.skPanitia}      compact />
            <StatCard title="Undangan Rapat" value={s.undanganRapat}  icon={Icon.bell}      color="cyan"  subtitle="undangan diterbit"   trend={s.trend?.undanganRapat}  compact />
            <StatCard title="Berita Acara"   value={s.beritaAcara}    icon={Icon.clipboard} color="ungu"  subtitle="berita acara"        trend={s.trend?.beritaAcara}    compact />
            <StatCard title="Proposal"       value={s.proposal}       icon={Icon.list}      color="merah" subtitle="proposal kegiatan"  trend={s.trend?.proposal}       compact />
          </div>
        )}
      </section>

      {/* 3. AKSI CEPAT */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Aksi Cepat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AKSI_CEPAT.map(aksi => (
            <button
              key={aksi.label}
              onClick={() => navigate(aksi.path)}
              className={`group relative overflow-hidden rounded-xl p-4 text-left text-white
                bg-gradient-to-br ${aksi.color} hover:shadow-lg hover:-translate-y-0.5
                active:translate-y-0 transition-all duration-150`}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3
                              group-hover:bg-white/30 transition-colors">{aksi.icon}</div>
              <p className="text-[13px] font-semibold leading-tight">{aksi.label}</p>
              <p className="text-[11px] text-white/60 mt-0.5 leading-tight">{aksi.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. DOKUMEN TERBARU */}
      <section>
        <DataTable
          title="Dokumen Terbaru"
          columns={KOLOM_TERBARU}
          data={loading ? [] : dokumenTerbaru}
          loading={loading}
          emptyTitle="Belum ada dokumen"
          emptySubtitle="Mulai buat dokumen pertama Anda."
          emptyAction={<button onClick={() => navigate('/buat-dokumen')} className="btn-primary">Buat Dokumen</button>}
          headerRight={<button onClick={() => navigate('/arsip')} className="btn-secondary text-xs px-3 py-1.5">Lihat Semua →</button>}
          footer={
            <p className="text-xs text-gray-400 text-center">
              Menampilkan {dokumenTerbaru.length} dokumen terbaru &nbsp;·&nbsp;
              <button onClick={() => navigate('/arsip')} className="text-hijau-600 hover:underline font-medium">
                Lihat arsip lengkap
              </button>
            </p>
          }
          striped
        />
      </section>

      {/* 5. STATUS SISTEM */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Status Sistem</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statusSistem.map(sys => (
            <div key={sys.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                  <SistemIcon id={sys.id} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-none">{sys.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{sys.detail}</p>
                </div>
              </div>
              <StatusBadge status={sys.status} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">
          {isLive
            ? '● Data diambil dari server secara langsung.'
            : '○ Konfigurasi VITE_API_URL untuk menghubungkan backend.'}
        </p>
      </section>

    </div>
  )
}
