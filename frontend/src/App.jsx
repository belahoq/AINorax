import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './lib/auth'

// Layout
import Layout from './components/Layout'

// Halaman
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import CreateDocument from './pages/CreateDocument'
import Archive        from './pages/Archive'
import MasterData     from './pages/MasterData'
import Templates      from './pages/Templates'
import Settings       from './pages/Settings'
import ComingSoon     from './pages/ComingSoon'

// ProtectedRoute: redirect ke /login jika belum punya token
function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman publik */}
        <Route path="/login" element={<Login />} />

        {/* Semua halaman terproteksi — dibungkus Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* === Fitur Utama === */}
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="buat-dokumen" element={<CreateDocument />} />
          <Route path="arsip"        element={<Archive />} />
          <Route path="template"     element={<Templates />} />

          {/* === Administrasi === */}
          <Route path="master-data"  element={<MasterData />} />
          {/* Fitur berikut belum tersedia — tampilkan ComingSoon */}
          <Route path="spmb"         element={<ComingSoon label="SPMB" />} />
          <Route path="absensi-qr"   element={<ComingSoon label="Absensi QR" />} />
          <Route path="inventaris"   element={<ComingSoon label="Inventaris" />} />

          {/* === Sistem === */}
          <Route path="pengaturan"   element={<Settings />} />

          {/* Fallback — redirect ke dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
