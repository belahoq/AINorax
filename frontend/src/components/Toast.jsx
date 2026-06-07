// ============================================================
// Toast.jsx — Notifikasi toast + hook useToast
// ============================================================
import { useState, useCallback, useEffect, useRef } from 'react'

// --- Ikon per tipe ---
const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
}

// Warna per tipe
const STYLES = {
  success: {
    wrap:  'bg-white border-l-4 border-hijau-500 shadow-md',
    icon:  'text-hijau-500 bg-hijau-50',
    title: 'text-hijau-800',
    msg:   'text-gray-600',
  },
  error: {
    wrap:  'bg-white border-l-4 border-red-500 shadow-md',
    icon:  'text-red-500 bg-red-50',
    title: 'text-red-800',
    msg:   'text-gray-600',
  },
  warning: {
    wrap:  'bg-white border-l-4 border-emas-500 shadow-md',
    icon:  'text-emas-600 bg-emas-50',
    title: 'text-emas-800',
    msg:   'text-gray-600',
  },
  info: {
    wrap:  'bg-white border-l-4 border-navy-500 shadow-md',
    icon:  'text-navy-600 bg-navy-50',
    title: 'text-navy-800',
    msg:   'text-gray-600',
  },
}

const TITLES = {
  success: 'Berhasil',
  error:   'Gagal',
  warning: 'Perhatian',
  info:    'Informasi',
}

// --- Satu item toast ---
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  // Animasi masuk
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Auto dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => dismiss(), toast.duration ?? 3500)
    return () => clearTimeout(timerRef.current)
  }, [])

  function dismiss() {
    setVisible(false)
    // Tunggu animasi keluar sebelum hapus dari DOM
    setTimeout(() => onRemove(toast.id), 300)
  }

  const s = STYLES[toast.type] || STYLES.info

  return (
    <div
      className={[
        'flex items-start gap-3 p-3 pr-4 rounded-xl min-w-[280px] max-w-xs',
        s.wrap,
        // Animasi slide-in dari kanan + fade
        'transition-all duration-300 ease-out',
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-8',
      ].join(' ')}
      role="alert"
    >
      {/* Ikon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${s.icon}`}>
        {ICONS[toast.type] || ICONS.info}
      </div>

      {/* Teks */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold leading-none mb-1 ${s.title}`}>
          {toast.title || TITLES[toast.type] || 'Notifikasi'}
        </p>
        <p className={`text-xs leading-snug ${s.msg}`}>
          {toast.message}
        </p>
      </div>

      {/* Tutup */}
      <button
        onClick={dismiss}
        className="shrink-0 p-0.5 rounded text-gray-300 hover:text-gray-500
                   transition-colors mt-0.5"
        aria-label="Tutup notifikasi"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

// --- Container toast — letakkan di root Layout atau App ---
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

// --- Hook useToast ---
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [
      ...prev,
      { id, message, type, duration: options.duration ?? 3500, title: options.title },
    ])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg, opts) => addToast(msg, 'success', opts ?? {}),
    error:   (msg, opts) => addToast(msg, 'error',   opts ?? {}),
    warning: (msg, opts) => addToast(msg, 'warning', opts ?? {}),
    info:    (msg, opts) => addToast(msg, 'info',    opts ?? {}),
  }

  return { toasts, removeToast, toast }
}
