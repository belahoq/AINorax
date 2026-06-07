// ============================================================
// DataTable.jsx — Tabel data reusable
// ============================================================

/**
 * Props:
 * - columns : Array<{ key, label, render? }>
 *   - key    : nama field di data
 *   - label  : judul kolom
 *   - render : (value, row) => ReactNode (opsional, untuk custom cell)
 * - data    : Array<object>
 * - loading : boolean (opsional)
 * - emptyText: string (opsional) — teks saat data kosong
 */
export default function DataTable({ columns = [], data = [], loading = false, emptyText = 'Tidak ada data.' }) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-8 flex items-center justify-center">
          <Spinner />
          <span className="ml-3 text-sm text-gray-500">Memuat data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-50 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id ?? rowIdx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Spinner kecil
function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-hijau-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
    </svg>
  )
}
