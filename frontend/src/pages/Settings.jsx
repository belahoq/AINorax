// ============================================================
// Settings.jsx — Halaman Pengaturan Koneksi Backend
// ============================================================
import { useState } from 'react'
import { pingKoneksi } from '../lib/api'
import { API_BASE_URL } from '../lib/constants'
import { useToast, ToastContainer } from '../components/Toast'

// Badge status koneksi
function StatusBadge({ status }) {
  if (status === null) return <span className="badge-gray">Belum dicek</span>
  if (status === 'OK') return <span className="badge-green">● Terhubung</span>
  return <span className="badge-red">✕ Gagal</span>
}

export default function Settings() {
  const { toasts, removeToast, toast } = useToast()

  const [testing,       setTesting]       = useState(false)
  const [workerStatus,  setWorkerStatus]  = useState(null)
  const [gasStatus,     setGasStatus]     = useState(null)
  const [pesanHasil,    setPesanHasil]    = useState('')

  async function handleTest() {
    setTesting(true)
    setWorkerStatus(null)
    setGasStatus(null)
    setPesanHasil('')
    try {
      const res = await pingKoneksi()
      setWorkerStatus(res.worker)
      setGasStatus(res.gas)
      setPesanHasil(res.pesan || 'Koneksi berhasil.')
      toast.success('Koneksi berhasil!')
    } catch (err) {
      setWorkerStatus('ERROR')
      setGasStatus('ERROR')
      setPesanHasil(err.message || 'Koneksi gagal.')
      toast.error('Koneksi gagal. Periksa konfigurasi Worker.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-2xl space-y-5">

        {/* === Status Koneksi === */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Status Koneksi</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Worker */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs font-medium text-gray-500">Cloudflare Worker</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all">
                  {API_BASE_URL}
                </p>
              </div>
              <StatusBadge status={workerStatus} />
            </div>

            {/* GAS */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs font-medium text-gray-500">Google Apps Script</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  (disembunyikan)
                </p>
              </div>
              <StatusBadge status={gasStatus} />
            </div>
          </div>

          {/* Pesan hasil */}
          {pesanHasil && (
            <p className={`text-sm px-3 py-2 rounded-lg ${
              workerStatus === 'OK' ? 'bg-hijau-50 text-hijau-700' : 'bg-red-50 text-red-700'
            }`}>
              {pesanHasil}
            </p>
          )}

          {/* Tombol test */}
          <button
            onClick={handleTest}
            disabled={testing}
            className="btn-primary"
          >
            {testing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                </svg>
                Menguji Koneksi...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Test Koneksi
              </>
            )}
          </button>
        </div>

        {/* === Panduan Setup === */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Panduan Konfigurasi</h3>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center
                               text-xs font-bold shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-medium text-gray-800">Deploy Google Apps Script</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Deploy GAS sebagai Web App. Salin URL deployment-nya.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center
                               text-xs font-bold shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-medium text-gray-800">Set Environment Variables di Cloudflare Worker</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Buka Cloudflare Dashboard → Workers → Settings → Variables:
                </p>
                <div className="mt-2 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono space-y-1">
                  <p><span className="text-emas-400">GAS_URL</span>     = https://script.google.com/...</p>
                  <p><span className="text-emas-400">GAS_SECRET</span>  = (token rahasia buatan sendiri)</p>
                  <p><span className="text-emas-400">ADMIN_PIN</span>   = (PIN login admin)</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center
                               text-xs font-bold shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-medium text-gray-800">Set VITE_API_URL di Cloudflare Pages</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Buka Cloudflare Pages → Settings → Environment variables:
                </p>
                <div className="mt-2 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono">
                  <p><span className="text-emas-400">VITE_API_URL</span> = https://worker-nama.workers.dev</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-hijau-100 text-hijau-700 flex items-center justify-center
                               text-xs font-bold shrink-0 mt-0.5">✓</span>
              <div>
                <p className="font-medium text-gray-800">Klik "Test Koneksi" di atas</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pastikan kedua status menunjukkan "Terhubung".
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === Info Keamanan === */}
        <div className="card p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div className="text-xs text-yellow-800 space-y-1">
              <p className="font-semibold">Catatan Keamanan</p>
              <p>GAS_URL dan GAS_SECRET <strong>tidak pernah</strong> dikirim ke browser.
                 Semua request melalui Cloudflare Worker sebagai proxy.</p>
              <p>Jangan pernah menyimpan credential di kode frontend.</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
