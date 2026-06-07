// ============================================================
// FormField.jsx — Input form reusable
// type: 'text' | 'date' | 'time' | 'number' | 'email'
//       'textarea' | 'select' | 'checkbox' | 'radio-group'
// ============================================================

/**
 * Props umum:
 * - label       : string
 * - name        : string
 * - value       : string | boolean
 * - onChange    : (e) => void
 * - type        : lihat di atas (default: 'text')
 * - placeholder : string
 * - required    : boolean
 * - optional    : boolean  — tampilkan "(opsional)" di samping label
 * - disabled    : boolean
 * - hint        : string   — teks bantuan kecil di bawah field
 * - error       : string   — pesan error merah
 *
 * Props khusus select:
 * - options : Array<{ value, label }>
 * - placeholder (digunakan sebagai teks "--Pilih--")
 *
 * Props khusus textarea:
 * - rows : number (default 3)
 *
 * Props khusus radio-group:
 * - options  : Array<{ value, label, desc? }>
 * - value    : string (value yang terpilih)
 * - onChange : ({ target: { name, value } }) => void
 */
export default function FormField({
  label,
  name,
  value       = '',
  onChange,
  type        = 'text',
  placeholder = '',
  required    = false,
  optional    = false,
  disabled    = false,
  hint,
  error,
  options     = [],
  rows        = 3,
}) {
  const id      = `field-${name}`
  const errCls  = error ? 'border-red-400 focus:ring-red-400' : ''

  // ── render input berdasar type ───────────────────────────
  function renderInput() {
    switch (type) {

      case 'select':
        return (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`form-select ${errCls}`}
          >
            <option value="">
              {placeholder || '-- Pilih --'}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            required={required}
            className={`form-textarea ${errCls}`}
          />
        )

      case 'checkbox':
        return (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              id={id}
              type="checkbox"
              name={name}
              checked={!!value}
              onChange={onChange}
              disabled={disabled}
              className="w-4 h-4 rounded border-gray-300 text-hijau-600
                         focus:ring-hijau-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        )

      // Radio group: daftar opsi dengan bullet bundar
      case 'radio-group':
        return (
          <div className="space-y-2">
            {options.map((opt) => (
              <label
                key={opt.value}
                className={[
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer',
                  'transition-colors duration-100 select-none',
                  value === opt.value
                    ? 'border-hijau-400 bg-hijau-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange({ target: { name, value: opt.value } })}
                  disabled={disabled}
                  className="mt-0.5 w-4 h-4 text-hijau-600 border-gray-300
                             focus:ring-hijau-500 focus:ring-offset-0 cursor-pointer shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug">
                    {opt.label}
                  </p>
                  {opt.desc && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{opt.desc}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )

      // Semua tipe input standar HTML
      default:
        return (
          <input
            id={id}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`form-input ${errCls}`}
          />
        )
    }
  }

  // Checkbox tidak perlu wrapper label biasa
  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {hint  && !error && <p className="text-xs text-gray-400 ml-6">{hint}</p>}
        {error &&           <p className="text-xs text-red-500  ml-6">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {/* Label */}
      {label && type !== 'checkbox' && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && (
            <span className="text-red-500 ml-0.5" title="Wajib diisi">*</span>
          )}
          {optional && !required && (
            <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
          )}
        </label>
      )}

      {/* Input */}
      {renderInput()}

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-gray-400 leading-snug">{hint}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 leading-snug">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
