// ============================================================
// Layout.jsx — Wrapper utama: Sidebar + Topbar + konten halaman
// ============================================================
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function Layout() {
  // State untuk buka/tutup sidebar di mobile
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar — fixed di mobile, static di desktop */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Area kanan: topbar + konten */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar sticky */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Konten halaman */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Outlet me-render halaman aktif dari react-router */}
          <Outlet />
        </main>

      </div>
    </div>
  )
}
