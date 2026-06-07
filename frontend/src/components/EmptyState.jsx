// ============================================================
// EmptyState.jsx — Tampilan saat data kosong
// ============================================================

/**
 * Props:
 * - title    : string (default: 'Belum ada data')
 * - subtitle : string (opsional)
 * - action   : ReactNode (opsional) — tombol aksi
 * - icon     : ReactNode (opsional) — override ikon default
 */
export default function EmptyState({
  title = 'Belum ada data',
  subtitle,
  action,
  icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Ikon */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon || (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
        )}
      </div>

      {/* Teks */}
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-400 max-w-xs mb-4">{subtitle}</p>
      )}

      {/* Aksi */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
