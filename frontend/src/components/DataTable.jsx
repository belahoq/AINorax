// ============================================================
// DataTable.jsx — Tabel data reusable dengan slot tambahan
// ============================================================
import LoadingState from './LoadingState'
import EmptyState   from './EmptyState'

/**
 * Props:
 * - columns      : Array<{ key, label, render?, width? }>
 *     key    — nama field di data
 *     label  — judul kolom
 *     render — (value, row) => ReactNode  (opsional)
 *     width  — string class Tailwind width (opsional, misal 'w-32')
 * - data          : Array<object>
 * - loading       : boolean            (opsional, default false)
 * - title         : string             (opsional) — judul di atas tabel
 * - headerRight   : ReactNode          (opsional) — slot kanan header (tombol, filter)
 * - emptyTitle    : string             (opsional)
 * - emptySubtitle : string             (opsional)
 * - emptyAction   : ReactNode          (opsional) — tombol di empty state
 * - emptyIcon     : ReactNode          (opsional) — ikon di empty state
 * - footer        : ReactNode          (opsional) — slot footer (pagination, dll.)
 * - compact       : boolean            (opsional) — baris lebih tipis
 * - striped       : boolean            (opsional) — baris berganti warna
 */
export default function DataTable({
  columns       = [],
  data          = [],
  loading       = false,
  title,
  headerRight,
  emptyTitle    = 'Belum ada data',
  emptySubtitle,
  emptyAction,
  emptyIcon,
  footer,
  compact       = false,
  striped       = false,
}) {
  const rowPad = compact ? 'px-4 py-2.5' : 'px-4 py-3.5'

  return (
    <div className="card overflow-hidden flex flex-col">

      {/* ── Header opsional ─────────────────────────────── */}
      {(title || headerRight) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3
                        border-b border-gray-100">
          {title && (
            <h3 className="text-sm font-semibold text-gray-700 leading-none">{title}</h3>
          )}
          {headerRight && (
            <div className="shrink-0">{headerRight}</div>
          )}
        </div>
      )}

      {/* ── Body ────────────────────────────────────────── */}
      {loading ? (
        <LoadingState size="sm" />
      ) : data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          subtitle={emptySubtitle}
          action={emptyAction}
          icon={emptyIcon}
          compact
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            {/* Kepala tabel */}
            <thead className="bg-gray-50/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={[
                      'px-4 py-2.5 text-left text-[11px] font-semibold',
                      'text-gray-500 uppercase tracking-wide whitespace-nowrap',
                      col.width ?? '',
                    ].join(' ')}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Baris data */}
            <tbody className="divide-y divide-gray-50 bg-white">
              {data.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  className={[
                    'transition-colors',
                    striped && rowIdx % 2 === 1 ? 'bg-gray-50/50' : '',
                    'hover:bg-hijau-50/40',
                  ].join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${rowPad} text-sm text-gray-700`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer opsional ─────────────────────────────── */}
      {footer && !loading && data.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          {footer}
        </div>
      )}
    </div>
  )
}
