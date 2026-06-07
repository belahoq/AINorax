// ============================================================
// DataTable.jsx — Tabel data reusable
// ============================================================
import { useState } from 'react'
import LoadingState from './LoadingState'
import EmptyState   from './EmptyState'

/**
 * Props kolom (columns[]):
 *   key          — nama field di data
 *   label        — judul kolom header
 *   render       — (value, row) => ReactNode  (opsional)
 *   width        — class Tailwind width, misal 'w-32' (opsional)
 *   sortable     — boolean: kolom bisa diurutkan (opsional)
 *   hideOnMobile — boolean: sembunyikan di layar kecil (opsional)
 *   align        — 'left'|'center'|'right' (default 'left')
 *
 * Props komponen:
 *   data          — Array<object>
 *   loading       — boolean
 *   title         — string (opsional) — judul di header card
 *   headerRight   — ReactNode (opsional) — slot kanan header
 *   emptyTitle    — string
 *   emptySubtitle — string
 *   emptyAction   — ReactNode
 *   emptyIcon     — ReactNode
 *   footer        — ReactNode (opsional)
 *   compact       — boolean — baris lebih tipis
 *   striped       — boolean — baris berganti warna
 *   onRowClick    — (row) => void (opsional)
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
  onRowClick,
}) {
  // ── Sort state ───────────────────────────────────────────
  const [sortKey, setSortKey]   = useState(null)
  const [sortDir, setSortDir]   = useState('asc') // 'asc' | 'desc'

  function handleSort(col) {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
  }

  // ── Sort data ────────────────────────────────────────────
  const sortedData = (() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      const cmp = String(va).localeCompare(String(vb), 'id', { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  })()

  const rowPad = compact ? 'px-4 py-2.5' : 'px-4 py-3.5'

  // ── Align class ──────────────────────────────────────────
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

  return (
    <div className="card overflow-hidden flex flex-col">

      {/* ── Header opsional ── */}
      {(title || headerRight) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          {title && (
            <h3 className="text-sm font-semibold text-gray-700 leading-none">{title}</h3>
          )}
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}

      {/* ── Body ── */}
      {loading ? (
        <LoadingState size="sm" />
      ) : sortedData.length === 0 ? (
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
                    onClick={() => handleSort(col)}
                    className={[
                      'px-4 py-2.5 text-[11px] font-semibold text-gray-500',
                      'uppercase tracking-wide whitespace-nowrap select-none',
                      alignClass[col.align] ?? 'text-left',
                      col.width ?? '',
                      col.sortable ? 'cursor-pointer hover:text-gray-700 hover:bg-gray-100 transition-colors' : '',
                      col.hideOnMobile ? 'hidden sm:table-cell' : '',
                    ].join(' ')}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <SortIcon
                          active={sortKey === col.key}
                          dir={sortKey === col.key ? sortDir : 'asc'}
                        />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Baris data */}
            <tbody className="divide-y divide-gray-50 bg-white">
              {sortedData.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    'transition-colors duration-100',
                    striped && idx % 2 === 1 ? 'bg-gray-50/50' : '',
                    onRowClick ? 'cursor-pointer hover:bg-hijau-50/50' : 'hover:bg-gray-50/60',
                  ].join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        `${rowPad} text-sm text-gray-700`,
                        alignClass[col.align] ?? 'text-left',
                        col.hideOnMobile ? 'hidden sm:table-cell' : '',
                      ].join(' ')}
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

      {/* ── Footer opsional ── */}
      {footer && !loading && sortedData.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          {footer}
        </div>
      )}
    </div>
  )
}

// ── Ikon sort ────────────────────────────────────────────────
function SortIcon({ active, dir }) {
  return (
    <svg
      className={`w-3 h-3 transition-colors ${active ? 'text-hijau-600' : 'text-gray-300'}`}
      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
    >
      {dir === 'asc' || !active ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      )}
    </svg>
  )
}
