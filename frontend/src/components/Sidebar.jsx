// ============================================================
// Sidebar.jsx — Navigasi sidebar kiri SDENTIBAYA AdminKit
// ============================================================
import { NavLink, useNavigate } from 'react-router-dom'
import { MENU_GROUPS_ADMIN, MENU_GROUPS_USER, BRAND, SEKOLAH } from '../lib/constants'
import { removeToken, getUser, getRole } from '../lib/auth'

// ============================================================
// Ikon SVG inline — ringan, tanpa library eksternal
// ============================================================
const ICONS = {
  grid: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  'file-plus': (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  archive: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <polyline points="21,8 21,21 3,21 3,8"/>
      <rect x="1" y="3" width="22" height="5" rx="1"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  'layout-template': (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  ),
  database: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  users: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  'qr-code': (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h1v1h-1z M17 14h3 M14 17h1 M17 17h1v1h-1z M20 17v3 M17 20h3"/>
    </svg>
  ),
  box: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  settings: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  'user-plus': (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  user: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

// ============================================================
// Komponen utama Sidebar
// ============================================================
export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const role     = getRole()
  const user     = getUser()

  // Pilih menu berdasarkan role
  const menuGroups = role === 'admin' ? MENU_GROUPS_ADMIN : MENU_GROUPS_USER

  function handleLogout() {
    removeToken()
    navigate('/login')
  }

  return (
    <>
      {/* === Overlay gelap saat sidebar buka di mobile === */}
      <div
        className={[
          'fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* === Panel Sidebar === */}
      <aside
        className={[
          // Ukuran & posisi
          'fixed top-0 left-0 h-full z-30 w-64 flex flex-col',
          // Warna & teks
          'bg-[#0f1729] text-white',
          // Transisi slide mobile
          'transition-transform duration-250 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: selalu tampil, tidak perlu translate
          'lg:translate-x-0 lg:static lg:z-auto',
        ].join(' ')}
      >
        {/* ================================================
            HEADER BRAND
        ================================================ */}
        <div className="px-5 pt-5 pb-4 border-b border-white/8">
          {/* Logo placeholder */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-hijau-500 to-hijau-700
                            flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-sm font-black text-white tracking-tight">SD</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white leading-none tracking-wide">
                  {BRAND.nama}
                </span>
                {/* Badge MVP */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]
                                 font-bold bg-emas-500/20 text-emas-400 border border-emas-500/30
                                 leading-none tracking-wide uppercase">
                  {BRAND.versi}
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5 leading-none font-medium tracking-wider uppercase">
                {BRAND.produk}
              </p>
            </div>
          </div>

          {/* Slogan */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-hijau-400 shrink-0 animate-pulse" />
            <p className="text-[11px] text-white/60 font-semibold tracking-widest uppercase">
              {BRAND.slogan}
            </p>
          </div>
        </div>

        {/* ================================================
            NAVIGASI MENU (dengan grup)
        ================================================ */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {menuGroups.map((group, gi) => (
            <div key={gi}>
              {/* Label grup (jika ada) */}
              {group.label && (
                <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                  {group.label}
                </p>
              )}

              {/* Item menu dalam grup */}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px]',
                        'font-medium transition-all duration-150',
                        isActive
                          ? 'bg-hijau-600 text-white shadow-sm'
                          : 'text-white/60 hover:bg-white/8 hover:text-white',
                      ].join(' ')
                    }
                  >
                    {/* Ikon */}
                    <span className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {ICONS[item.icon] || ICONS.grid}
                    </span>

                    {/* Label */}
                    <span className="flex-1 leading-none">{item.label}</span>

                    {/* Badge "Coming Soon" */}
                    {item.badge && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px]
                                       font-bold bg-white/10 text-white/40 leading-none uppercase
                                       tracking-wide shrink-0">
                        Segera
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ================================================
            FOOTER: Info sekolah + Logout
        ================================================ */}
        <div className="px-3 py-3 border-t border-white/8 space-y-1">
          {/* Info tahun ajaran */}
          <div className="px-3 py-2 rounded-lg bg-white/5 mb-1">
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
              Tahun Ajaran
            </p>
            <p className="text-[13px] font-semibold text-white/80 mt-0.5">
              {SEKOLAH.tahunAjaran}
            </p>
          </div>

          {/* Link ke halaman profil */}
          <NavLink
            to="/profil"
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium',
                'transition-all duration-150',
                isActive
                  ? 'bg-hijau-600 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white',
              ].join(' ')
            }
          >
            {/* Avatar kecil */}
            <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">
              {ICONS.user}
            </span>
            <span className="flex-1 truncate leading-none">
              {user?.name || user?.nama || 'Profil Saya'}
            </span>
          </NavLink>

          {/* Tombol logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px]
                       font-medium text-white/50 hover:bg-red-500/15 hover:text-red-400
                       transition-all duration-150 group"
          >
            <span className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
              {ICONS.logout}
            </span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
