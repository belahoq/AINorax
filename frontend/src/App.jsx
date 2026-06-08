import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken, isAdmin } from './lib/auth'

// Layout
import Layout from './components/Layout'

// Halaman publik
import Login      from './pages/Login'

// Halaman semua user (admin + operator)
import Dashboard      from './pages/Dashboard'
import CreateDocument from './pages/CreateDocument'
import Archive        from './pages/Archive'
import Templates      from './pages/Templates'
import UserProfile    from './pages/UserProfile'
import ComingSoon     from './pages/ComingSoon'

// Halaman admin only
import MasterData from './pages/MasterData'
import AddUser    from './pages/AddUser'
import Settings   from './pages/Settings'

// ── ProtectedRoute: redirect ke /login jika belum login ──────
function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

// ── AdminRoute: redirect ke /dashboard jika bukan admin ──────
function AdminRoute({ children }) {
  if (!getToken()) return <Navigate to="/login"    replace />
  if (!isAdmin())  return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman publik */}
        <Route path="/login" element={<Login />} />

        {/* Semua halaman terproteksi — dalam Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* === Semua user === */}
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="buat-dokumen" element={<CreateDocument />} />
          <Route path="arsip"        element={<Archive />} />
          <Route path="template"     element={<Templates />} />
          <Route path="profil"       element={<UserProfile />} />

          {/* === Coming Soon === */}
          <Route path="spmb"       element={<ComingSoon label="SPMB" />} />
          <Route path="absensi-qr" element={<ComingSoon label="Absensi QR" />} />
          <Route path="inventaris" element={<ComingSoon label="Inventaris" />} />

          {/* === Admin only === */}
          <Route path="master-data" element={
            <AdminRoute><MasterData /></AdminRoute>
          } />
          <Route path="add-user" element={
            <AdminRoute><AddUser /></AdminRoute>
          } />
          <Route path="pengaturan" element={
            <AdminRoute><Settings /></AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
