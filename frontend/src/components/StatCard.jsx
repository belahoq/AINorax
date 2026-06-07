// ============================================================
// StatCard.jsx — Kartu statistik untuk dashboard
// ============================================================

/**
 * Props:
 * - title    : string         — label statistik
 * - value    : string|number  — nilai utama
 * - icon     : ReactNode      — ikon SVG
 * - color    : 'hijau' | 'navy' | 'emas' | 'merah' | 'ungu' | 'cyan' (default: 'hijau')
 * - subtitle : string         (opsional) — teks kecil di bawah nilai
 * - trend    : string         (opsional) — misal '+5', '-2', '0' → tampil label tren
 * - compact  : boolean        (opsional) — ukuran lebih kecil untuk grid padat
 * - onClick  : function       (opsional) — jadikan kartu klikable
 */
export default function StatCard({
  title,
  value,
  icon,
  color    = 'hijau',
  subtitle,
  trend,
  compact  = false,
  onClick,
}) {
  // ── Palet warna per tema ─────────────────────────────────
  const palette = {
    hijau: {
      wrap:  'bg-white',
      strip: 'bg-hijau-500',
      icon:  'bg-hijau-50 text-hijau-600',
      value: 'text-gray-800',
      trend: { pos: 'text-hijau-600 bg-hijau-50', neg: 'text-red-500 bg-red-50', zero: 'text-gray-400 bg-gray-100' },
    },
    navy: {
      wrap:  'bg-white',
      strip: 'bg-navy-600',
      icon:  'bg-navy-50 text-navy-700',
      value: 'text-gray-800',
      trend: { pos: 'text-hijau-600 bg-hijau-50', neg: 'text-red-500 bg-red-50', zero: 'text-gray-400 bg-gray-100' },
    },
    emas: {
      wrap:  'bg-white',
      strip: 'bg-emas-500',
      icon:  'bg-emas-50 text-emas-600',
      value: 'text-gray-800',
      trend: { pos: 'text-hijau-600 bg-hijau-50', neg: 'text-red-500 bg-red-50', zero: 'text-gray-400 bg-gray-100' },
    },
    merah: {
      wrap:  'bg-white',
      strip: 'bg-red-500',
      icon:  'bg-red-50 text-red-600',
      value: 'text-gray-800',
      trend: { pos: 'text-hijau-600 bg-hijau-50', neg: 'text-red-500 bg-red-50', zero: 'text-gray-400 bg-gray-100' },
    },
    ungu: {
      wrap:  'bg-white',
      strip: 'bg-purple-500',
      icon:  'bg-purple-50 text-purple-600',
      value: 'text-gray-800',
      trend: { pos: 'text-hijau-600 bg-hijau-50', neg: 'text-red-500 bg-red-50', zero: 'text-gray-400 bg-gray-100' },
    },
    cyan: {
      wrap:  'bg-white',
      strip: 'bg-cyan-500',
      icon:  'bg-cyan-50 text-cyan-600',
      value: 'text-gray-800',
      trend: { pos: 'text-hijau-600 bg-hijau-50', neg: 'text-red-500 bg-red-50', zero: 'text-gray-400 bg-gray-100' },
    },
  }
  const c = palette[color] || palette.hijau

  // ── Hitung tren ──────────────────────────────────────────
  let trendClass  = ''
  let trendLabel  = ''
  let trendArrow  = ''
  if (trend !== undefined && trend !== null) {
    const num = parseInt(trend, 10)
    if (num > 0) {
      trendClass = c.trend.pos
      trendArrow = '↑'
      trendLabel = `+${num} bulan ini`
    } else if (num < 0) {
      trendClass = c.trend.neg
      trendArrow = '↓'
      trendLabel = `${num} bulan ini`
    } else {
      trendClass = c.trend.zero
      trendArrow = '–'
      trendLabel = 'Tidak ada perubahan'
    }
  }

  // ── Ukuran icon & value berdasar prop compact ────────────
  const iconSize  = compact ? 'w-9 h-9'    : 'w-11 h-11'
  const valueSize = compact ? 'text-xl'    : 'text-2xl'
  const padSize   = compact ? 'p-4'        : 'p-5'

  return (
    <div
      onClick={onClick}
      className={[
        'card overflow-hidden flex flex-col',
        c.wrap,
        onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow duration-150' : '',
      ].join(' ')}
    >
      {/* Strip warna atas */}
      <div className={`h-1 w-full ${c.strip}`} />

      <div className={`flex items-start gap-3 ${padSize} flex-1`}>
        {/* Ikon */}
        {icon && (
          <div className={`shrink-0 ${iconSize} rounded-xl flex items-center justify-center ${c.icon}`}>
            {icon}
          </div>
        )}

        {/* Konten */}
        <div className="flex-1 min-w-0">
          {/* Judul */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-none truncate">
            {title}
          </p>

          {/* Nilai utama */}
          <p className={`${valueSize} font-bold ${c.value} mt-1.5 leading-none`}>
            {value ?? '—'}
          </p>

          {/* Baris bawah: subtitle + trend */}
          <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
            {subtitle && (
              <p className="text-xs text-gray-400 truncate">{subtitle}</p>
            )}
            {trend !== undefined && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold
                               px-1.5 py-0.5 rounded-full leading-none shrink-0 ${trendClass}`}>
                {trendArrow} {trendLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
