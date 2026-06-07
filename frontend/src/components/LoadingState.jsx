// ============================================================
// LoadingState.jsx — Tampilan loading halaman / section
// ============================================================

/**
 * Props:
 * - text  : string (opsional) — teks loading
 * - full  : boolean — true = full-page height
 * - size  : 'sm' | 'md' | 'lg' (default: 'md')
 */
export default function LoadingState({
  text = 'Memuat data...',
  full = false,
  size = 'md',
}) {
  const sizeMap = {
    sm: { spinner: 'w-5 h-5', text: 'text-xs', gap: 'gap-2', pad: 'py-8' },
    md: { spinner: 'w-7 h-7', text: 'text-sm', gap: 'gap-3', pad: 'py-14' },
    lg: { spinner: 'w-9 h-9', text: 'text-base', gap: 'gap-3', pad: 'py-20' },
  }
  const s = sizeMap[size] || sizeMap.md

  return (
    <div
      className={[
        `flex flex-col items-center justify-center ${s.gap} ${s.pad}`,
        full ? 'min-h-[60vh]' : '',
      ].join(' ')}
    >
      {/* Spinner cincin */}
      <div className="relative">
        {/* Track luar (abu) */}
        <svg
          className={`${s.spinner} text-gray-200`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        </svg>
        {/* Arc berputar (hijau) */}
        <svg
          className={`${s.spinner} text-hijau-500 animate-spin absolute inset-0`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Teks */}
      {text && (
        <p className={`${s.text} text-gray-400 font-medium`}>{text}</p>
      )}
    </div>
  )
}
