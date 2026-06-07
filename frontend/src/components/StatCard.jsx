// ============================================================
// StatCard.jsx — Kartu statistik untuk dashboard
// ============================================================

/**
 * Props:
 * - title   : string  — label statistik
 * - value   : string|number — nilai utama
 * - icon    : ReactNode — ikon SVG
 * - color   : 'hijau' | 'navy' | 'emas' | 'merah' (default: 'hijau')
 * - subtitle: string (opsional) — teks kecil di bawah nilai
 */
export default function StatCard({ title, value, icon, color = 'hijau', subtitle }) {
  const colorMap = {
    hijau: { bg: 'bg-hijau-50',  icon: 'bg-hijau-100 text-hijau-600', text: 'text-hijau-700' },
    navy:  { bg: 'bg-navy-50',   icon: 'bg-navy-100  text-navy-700',  text: 'text-navy-800'  },
    emas:  { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600', text: 'text-yellow-700' },
    merah: { bg: 'bg-red-50',    icon: 'bg-red-100   text-red-600',   text: 'text-red-700'   },
  }

  const c = colorMap[color] || colorMap.hijau

  return (
    <div className={`card p-5 flex items-start gap-4 ${c.bg}`}>
      {/* Ikon */}
      {icon && (
        <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
      )}
      {/* Teks */}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
          {title}
        </p>
        <p className={`text-2xl font-bold leading-tight mt-0.5 ${c.text}`}>
          {value ?? '—'}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
