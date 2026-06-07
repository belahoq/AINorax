// ============================================================
// ComingSoon.jsx — Placeholder halaman yang belum tersedia
// ============================================================
import { useNavigate } from 'react-router-dom'

/**
 * Props:
 * - label : string (opsional) — nama fitur yang akan hadir
 */
export default function ComingSoon({ label }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">

      {/* Ikon jam */}
      <div className="w-20 h-20 rounded-2xl bg-navy-50 flex items-center justify-center mb-5">
        <svg
          className="w-10 h-10 text-navy-400"
          fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </div>

      {/* Badge fitur */}
      {label && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                         bg-emas-100 text-emas-700 border border-emas-200 mb-3 uppercase tracking-wide">
          {label}
        </span>
      )}

      <h2 className="text-xl font-bold text-gray-800 mb-2">Segera Hadir</h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        Fitur ini sedang dalam pengembangan dan akan tersedia di versi berikutnya.
        Nantikan pembaruan!
      </p>

      {/* Pill info MVP */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-xs
                      text-gray-500 font-medium mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-hijau-400 animate-pulse"/>
        Versi saat ini: <strong className="text-gray-700">MVP</strong>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary"
      >
        Kembali ke Dashboard
      </button>
    </div>
  )
}
