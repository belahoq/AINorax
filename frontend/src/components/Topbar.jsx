// ============================================================
// Topbar.jsx — Header atas halaman (judul + tombol menu mobile)
// ============================================================
import { useLocation } from 'react-router-dom'
import { MENU_ITEMS, SEKOLAH } from '../lib/constants'

// Peta path → judul halaman
const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/buat-dokumen': 'Buat Dokumen',
  '/arsip':        'Arsip Dokumen',
  '/master-data':  'Master Data Sekolah',
  '/template':     'Template Dokumen',
  '/pengaturan':   'Pengaturan',
}

// Ikon hamburger
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <line x1="3" y1="6"  x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

// Ikon bell notifikasi
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const pageTitle = PAGE_TITLES[pathname] || 'SDENTIBAYA AdminKit'

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">

        {/* Kiri: tombol hamburger (mobile) + judul halaman */}
        <div className="flex items-center gap-3">
          {/* Tombol menu hanya muncul di mobile */}
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Buka menu"
          >
            <MenuIcon />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-800 leading-tight">
              {pageTitle}
            </h2>
            {/* Nama sekolah hanya tampil di layar sedang ke atas */}
            <p className="hidden sm:block text-xs text-gray-400 leading-tight">
              {SEKOLAH.nama}
            </p>
          </div>
        </div>

        {/* Kanan: info + avatar admin */}
        <div className="flex items-center gap-2">
          {/* Tombol notifikasi (placeholder) */}
          <button
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Notifikasi"
          >
            <BellIcon />
          </button>

          {/* Avatar admin */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
            <div className="w-8 h-8 rounded-full bg-hijau-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>

      </div>
    </header>
  )
}
