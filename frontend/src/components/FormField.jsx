// ============================================================
// FormField.jsx — Input form reusable (input, select, textarea)
// ============================================================

/**
 * Props:
 * - label      : string
 * - type       : 'text' | 'select' | 'textarea' | 'date' | 'number' | 'email' (default: 'text')
 * - name       : string
 * - value      : string
 * - onChange   : function
 * - placeholder: string (opsional)
 * - options    : Array<{value, label}> — hanya untuk type='select'
 * - rows       : number — hanya untuk type='textarea' (default: 3)
 * - required   : boolean
 * - disabled   : boolean
 * - hint       : string (opsional) — teks bantuan di bawah field
 * - error      : string (opsional) — pesan error
 */
export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  options = [],
  rows = 3,
  required = false,
  disabled = false,
  hint,
  error,
}) {
  const id = `field-${name}`

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input sesuai type */}
      {type === 'select' ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`form-select ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        >
          <option value="">-- Pilih --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          required={required}
          className={`form-textarea ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-input ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
      )}

      {/* Teks bantuan */}
      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}

      {/* Pesan error */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
