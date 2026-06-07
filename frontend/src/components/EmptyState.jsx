// ============================================================
// EmptyState.jsx — Tampilan saat data kosong
// ============================================================

/**
 * Props:
 * - title    : string  (default: 'Belum ada data')
 * - subtitle : string  (opsional)
 * - action   : ReactNode (opsional) — tombol / link aksi
 * - icon     : ReactNode (opsional) — override ikon default
 * - compact  : boolean  — tampilan lebih kecil (default: false)
 */
export default function EmptyState({
  title    = 'Belum ada data',
  subtitle,
  action,
  icon,
  compact = false,
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center px-6',
        compact ? 'py-10' : 'py-16',
      ].join(' ')}
    >
      {/* Ikon dalam lingkaran */}
      <div
        className={[
          'rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4',
          compact ? 'w-12 h-12' : 'w-16 h-16',
        ].join(' ')}
      >
        {icon || (
          <svg
            className={compact ? 'w-6 h-6' : 'w-8 h-8'}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      {/* Judul */}
      <h3 className={[
        'font-semibold text-gray-700',
        compact ? 'text-sm' : 'text-[15px]',
      ].join(' ')}>
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p className={[
          'text-gray-400 mt-1 max-w-xs leading-relaxed',
          compact ? 'text-xs' : 'text-sm',
        ].join(' ')}>
          {subtitle}
        </p>
      )}

      {/* Aksi */}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
