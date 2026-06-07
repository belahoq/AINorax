// ============================================================
// ComingSoon.jsx — Placeholder untuk fitur yang belum tersedia
// ============================================================
import { useNavigate } from 'react-router-dom'

export default function ComingSoon() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Ilustrasi */}
      <div className="w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-navy-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">Segera Hadir</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Fitur ini sedang dalam pengembangan dan akan segera tersedia.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary"
      >
        Kembali ke Dashboard
      </button>
    </div>
  )
}
