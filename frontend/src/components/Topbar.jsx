// ============================================================
// Topbar.jsx — Header atas halaman
// ============================================================
import { useLocation, useNavigate } from 'react-router-dom'
import { BRAND, SEKOLAH } from '../lib/constants'
import { getProfile, isAdmin } from '../lib/auth'

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/buat-dokumen':'Buat Dokumen',
  '/arsip':       'Arsip Dokumen',
  '/template':    'Template Dokumen',
  '/master-data': 'Master Data Sekolah',
  '/spmb':        'SPMB',
  '/absensi-qr':  'Absensi QR',
  '/inventaris':  'Inventaris',
  '/pengaturan':  'Pengaturan',
  '/add-user':    'Tambah Pengguna',
  '/profil':      'Profil Saya',
}

// --- Ikon ---
const HamburgerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const BellIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const pageTitle    = PAGE_TITLES[pathname] ?? 'SDENTIBAYA AdminKit'
  const profile      = getProfile() || {}
  const nama         = profile.name || profile.nama || 'Admin'
  const foto         = profile.foto || ''
  const initials     = nama.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  const adminUser    = isAdmin()

  return (
    <header className="sticky top-0 z-10 h-14 bg-white border-b border-gray-100 flex items-center
                       px-4 lg:px-6 gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

      {/* === Kiri: hamburger (mobile) + judul halaman === */}
      <div className="flex items-center gap-3 flex-1 min-w-0">

        {/* Hamburger — hanya tampil di mobile */}
        <button
          onClick={onMenuClick}
          className="p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100
                     active:bg-gray-200 transition-colors lg:hidden shrink-0"
          aria-label="Buka menu navigasi"
        >
          <HamburgerIcon />
        </button>

        {/* Judul halaman */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-gray-800 leading-none truncate">
              {pageTitle}
            </h2>
          </div>
          {/* Sub-judul: nama sekolah — hanya di sm ke atas */}
          <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5 leading-none truncate">
            {SEKOLAH.nama}
          </p>
        </div>
      </div>

      {/* === Kanan: branding + notif + avatar === */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Nama app + badge — hanya tampil di lg */}
        <div className="hidden lg:flex items-center gap-2 mr-3">
          <span className="text-[13px] font-bold text-gray-700 tracking-wide">
            {BRAND.nama} <span className="text-gray-400 font-medium">{BRAND.produk}</span>
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold
                           bg-emas-500/15 text-emas-600 border border-emas-500/25
                           uppercase tracking-wide leading-none">
            {BRAND.versi}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-5 bg-gray-200 mr-1" />

        {/* Tombol notifikasi */}
        <button
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600
                     transition-colors"
          aria-label="Notifikasi"
        >
          <BellIcon />
        </button>

        {/* Avatar + nama — klik ke profil */}
        <div
          className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-100 cursor-pointer
                     hover:opacity-80 transition-opacity"
          onClick={() => navigate('/profil')}
          title="Lihat profil saya"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hijau-500 to-hijau-700
                          flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
            {foto ? (
              <img src={foto} alt={nama} className="w-full h-full object-cover"
                   onError={e => { e.target.style.display='none' }} />
            ) : (
              <span className="text-[11px] font-bold text-white">{initials}</span>
            )}
          </div>
          <div className="hidden sm:block leading-none">
            <p className="text-[13px] font-semibold text-gray-700 truncate max-w-[100px]">{nama}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {adminUser ? 'Administrator' : 'Operator'}
            </p>
          </div>
        </div>
      </div>

    </header>
  )
}
