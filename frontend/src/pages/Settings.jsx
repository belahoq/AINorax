// ============================================================
// Settings.jsx — Halaman Pengaturan & Status Koneksi
// ============================================================
import { useState } from 'react'
import { pingWorker }   from '../lib/api'
import { API_BASE_URL } from '../lib/constants'
import { useToast, ToastContainer } from '../components/Toast'

// ── Badge status ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    null:                  { cls: 'badge-gray',  label: 'Belum dicek'    },
    OK:                    { cls: 'badge-green', label: '● Terhubung'    },
    ERROR:                 { cls: 'badge-red',   label: '✕ Gagal'        },
    UNKNOWN:               { cls: 'badge-gray',  label: 'Tidak diketahui' },
    TIDAK_DIKONFIGURASI:   { cls: 'badge-yellow',label: '⚠ Belum diset'  },
  }
  const s = map[status ?? 'null'] || map.null
  return <span className={`badge ${s.cls} text-xs`}>{s.label}</span>
}

export default function Settings() {
  const { toasts, removeToast, toast } = useToast()

  const [testing,     setTesting]     = useState(false)
  const [workerStatus, setWorkerStatus] = useState(null)
  const [gasStatus,    setGasStatus]    = useState(null)
  const [pesanHasil,   setPesanHasil]   = useState('')
  const [detailKoneksi, setDetailKoneksi] = useState(null)

  const backendDikonfigurasi = !!import.meta.env.VITE_API_URL

  async function handleTest() {
    setTesting(true)
    setWorkerStatus(null)
    setGasStatus(null)
    setPesanHasil('')
    setDetailKoneksi(null)

    try {
      const res = await pingWorker()
      setWorkerStatus(res.worker)
      setGasStatus(res.gas)
      setPesanHasil(res.message)
      setDetailKoneksi(res.detail)

      if (res.worker === 'OK' && res.gas === 'OK') {
        toast.success('Koneksi Worker dan GAS berhasil!')
      } else if (res.worker === 'OK') {
        toast.warning('Worker aktif, tetapi GAS belum terhubung.')
      } else if (res.worker === 'TIDAK_DIKONFIGURASI') {
        toast.info('VITE_API_URL belum diset. Aplikasi berjalan dalam mode demo.')
      } else {
        toast.error(res.message || 'Koneksi gagal.')
      }
    } catch (err) {
      setWorkerStatus('ERROR')
      setGasStatus('ERROR')
      const msg = err.message || 'Koneksi gagal. Periksa konfigurasi Worker.'
      setPesanHasil(msg)
      toast.error(msg)
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-2xl space-y-5 pb-6">

        {/* ── Info mode saat ini ── */}
        {!backendDikonfigurasi && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emas-50 border border-emas-200">
            <svg className="w-5 h-5 text-emas-600 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                 strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="text-sm text-emas-800">
              <p className="font-semibold">Aplikasi berjalan dalam Mode Demo</p>
              <p className="text-xs mt-0.5 text-emas-700">
                Variabel <code className="bg-emas-100 px-1 rounded font-mono">VITE_API_URL</code> belum
                dikonfigurasi. Semua data menggunakan dummy lokal.
                Lihat panduan di bawah untuk menghubungkan backend.
              </p>
            </div>
          </div>
        )}

        {/* ── Status Koneksi ── */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Status Koneksi</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs font-medium text-gray-500">Cloudflare Worker</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all text-xs">
                  {backendDikonfigurasi ? API_BASE_URL : 'Belum dikonfigurasi'}
                </p>
              </div>
              <StatusBadge status={workerStatus} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs font-medium text-gray-500">Google Apps Script</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 text-xs">
                  (URL disembunyikan)
                </p>
              </div>
              <StatusBadge status={gasStatus} />
            </div>
          </div>

          {/* Pesan hasil tes */}
          {pesanHasil && (
            <div className={`flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg border
              ${workerStatus === 'OK' && gasStatus === 'OK'
                ? 'bg-hijau-50 text-hijau-700 border-hijau-200'
                : workerStatus === 'TIDAK_DIKONFIGURASI'
                ? 'bg-emas-50 text-emas-700 border-emas-200'
                : 'bg-red-50 text-red-700 border-red-200'}`}>
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                   strokeWidth={2} viewBox="0 0 24 24">
                {workerStatus === 'OK'
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                }
              </svg>
              <span>{pesanHasil}</span>
            </div>
          )}

          {/* Detail koneksi dari server */}
          {detailKoneksi && (
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700 font-medium">
                Detail teknis koneksi
              </summary>
              <pre className="mt-2 bg-gray-100 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(detailKoneksi, null, 2)}
              </pre>
            </details>
          )}

          <button
            onClick={handleTest}
            disabled={testing}
            className="btn-primary"
          >
            {testing ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/></svg> Menguji Koneksi...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Test Koneksi</>
            )}
          </button>
        </div>

        {/* ── Panduan setup ── */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Panduan Konfigurasi</h3>
          <div className="space-y-4">
            {[
              {
                n: 1,
                judul: 'Deploy Google Apps Script',
                isi: 'Ikuti panduan di gas/README_GAS.md. Salin Web App URL setelah deploy.',
              },
              {
                n: 2,
                judul: 'Set Environment Variables di Cloudflare Worker',
                isi: 'Buka Cloudflare Dashboard → Workers → Settings → Variables:',
                kode: 'GAS_URL     = https://script.google.com/...\nGAS_SECRET  = (token rahasia)\nADMIN_PIN   = (PIN login)',
              },
              {
                n: 3,
                judul: 'Set VITE_API_URL di Cloudflare Pages',
                isi: 'Buka Cloudflare Pages → Settings → Environment variables:',
                kode: 'VITE_API_URL = https://nama-worker.workers.dev',
              },
              {
                n: 4,
                judul: 'Atau untuk development lokal',
                isi: 'Buat file .env.local di folder frontend/:',
                kode: 'VITE_API_URL=http://localhost:8787',
              },
            ].map(step => (
              <div key={step.n} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 flex items-center
                                 justify-center text-xs font-bold shrink-0 mt-0.5">{step.n}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{step.judul}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.isi}</p>
                  {step.kode && (
                    <pre className="mt-2 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono
                                   overflow-x-auto whitespace-pre leading-relaxed">
                      {step.kode}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Catatan keamanan ── */}
        <div className="card p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                 strokeWidth={2} viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div className="text-xs text-yellow-800 space-y-1">
              <p className="font-semibold">Catatan Keamanan</p>
              <p>GAS_URL dan GAS_SECRET <strong>tidak pernah</strong> dikirim ke browser.
                 Semua request melalui Cloudflare Worker sebagai proxy yang aman.</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
