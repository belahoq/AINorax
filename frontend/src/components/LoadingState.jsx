// ============================================================
// LoadingState.jsx — Tampilan loading halaman / section
// ============================================================

/**
 * Props:
 * - text  : string (opsional) — teks loading (default: 'Memuat data...')
 * - full  : boolean — true = full page height, false = inline (default: false)
 */
export default function LoadingState({ text = 'Memuat data...', full = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-gray-400
        ${full ? 'min-h-[60vh]' : 'py-16'}`}
    >
      {/* Spinner */}
      <svg
        className="animate-spin w-8 h-8 text-hijau-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
        />
      </svg>

      {/* Teks */}
      <p className="text-sm">{text}</p>
    </div>
  )
}
