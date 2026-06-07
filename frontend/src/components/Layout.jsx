// ============================================================
// Layout.jsx — Wrapper utama: Sidebar + Topbar + konten halaman
// ============================================================
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function Layout() {
  // State buka/tutup sidebar — khusus mobile
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const location = useLocation()

  // Tutup sidebar otomatis saat navigasi (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Cegah scroll body saat sidebar mobile terbuka
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ================================================
          SIDEBAR — fixed di mobile, static di desktop
      ================================================ */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ================================================
          AREA KANAN: Topbar + konten halaman
      ================================================ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar sticky */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Konten halaman — scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1400px]">
            {/* Outlet me-render komponen halaman aktif */}
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  )
}
