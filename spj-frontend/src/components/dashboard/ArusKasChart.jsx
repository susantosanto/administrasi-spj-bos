/**
 * ArusKasChart — Arus kas BKU per bulan (SVG mandiri, tanpa deps chart).
 * Sumber: `bku_data.summary.monthlySummaries` (penerimaan vs pengeluaran).
 * Baru: 3 seri — Penerimaan, Pengeluaran Tahap 1 (Bln 1–6), Pengeluaran Tahap 2 (Bln 7–12).
 * Lebar SVG mengikuti lebar kartu (ResizeObserver) agar teks tetap 11 px.
 * Kosong → kerangka grafik tanpa angka + tautan upload.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'

const H = 232
const PAD = { l: 60, r: 16, t: 16, b: 34 }
const LEVEL = [0.25, 0.5, 0.75, 1]

const fmtSingkat = (n) => {
  const v = Number(n) || 0
  const f = (x, s) => `Rp ${x.toLocaleString('id-ID', { maximumFractionDigits: 1 })} ${s}`
  if (Math.abs(v) >= 1e9) return f(v / 1e9, 'M')
  if (Math.abs(v) >= 1e6) return f(v / 1e6, 'jt')
  if (Math.abs(v) >= 1e3) return f(v / 1e3, 'rb')
  return `Rp ${v.toLocaleString('id-ID')}`
}

function titik(data, max, w) {
  const iw = w - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const n = data.length
  return data.map((d, i) => ({
    x: PAD.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1)),
    y: PAD.t + ih - (max > 0 ? (d / max) * ih : 0),
  }))
}

const kePath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

const HEADER_CLASS =
  'px-5 py-4 border-b border-slate-100 dark:border-white/10'

function Header({ title, subtitle }) {
  return (
    <div className={HEADER_CLASS}>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  )
}

export default function ArusKasChart() {
  const [monthly, setMonthly] = useState(() => storageHelper.get('bku_data', null)?.summary?.monthlySummaries || [])
  const [lebar, setLebar] = useState(0)
  const wrapRef = useRef(null)

  useEffect(() => {
    const muat = () => setMonthly(storageHelper.get('bku_data', null)?.summary?.monthlySummaries || [])
    muat()
    window.addEventListener('focus', muat)
    return () => window.removeEventListener('focus', muat)
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const ukur = () => setLebar(el.clientWidth)
    ukur()
    const ro = new ResizeObserver(ukur)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const w = lebar > 0 ? lebar - 24 : 600

  const masuk = monthly.map((m) => Number(m.totalPenerimaan) || 0)
  const keluar = monthly.map((m) => Number(m.totalPengeluaran) || 0)
  const tahap1 = monthly.map((m) => (Number(m.bulan) >= 1 && Number(m.bulan) <= 6 ? Number(m.totalPengeluaran) || 0 : 0))
  const tahap2 = monthly.map((m) => (Number(m.bulan) >= 7 && Number(m.bulan) <= 12 ? Number(m.totalPengeluaran) || 0 : 0))
  const max = Math.max(...masuk, ...keluar, ...tahap1, ...tahap2, 1)

  const pMasuk = titik(masuk, max, w)
  const pTahap1 = titik(tahap1, max, w)
  const pTahap2 = titik(tahap2, max, w)
  const areaMasuk = `${kePath(pMasuk)} L${pMasuk[pMasuk.length - 1].x.toFixed(1)},${(H - PAD.b).toFixed(1)} L${pMasuk[0].x.toFixed(1)},${(H - PAD.b).toFixed(1)} Z`
  const areaTahap1 = `${kePath(pTahap1)} L${pTahap1[pTahap1.length - 1].x.toFixed(1)},${(H - PAD.b).toFixed(1)} L${pTahap1[0].x.toFixed(1)},${(H - PAD.b).toFixed(1)} Z`
  const ticks = LEVEL.map((f) => ({ v: max * f, y: PAD.t + (H - PAD.t - PAD.b) * (1 - f) }))

  const [view, setView] = useState('semua') // semua | tahap1 | tahap2

  const showTahap1 = view === 'semua' || view === 'tahap1'
  const showTahap2 = view === 'semua' || view === 'tahap2'

  const segments = [
    { id: 'semua', label: 'Semua' },
    { id: 'tahap1', label: 'Tahap 1' },
    { id: 'tahap2', label: 'Tahap 2' },
  ]

  if (monthly.length === 0) {
    return (
      <div ref={wrapRef} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
        <Header title="Arus Kas" subtitle="Penerimaan vs pengeluaran per bulan (BKU)" />
        <div className="relative px-3 py-3">
          <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} className="block" aria-hidden="true">
            {LEVEL.map((f) => {
              const y = PAD.t + (H - PAD.t - PAD.b) * (1 - f)
              return <line key={f} x1={PAD.l} y1={y} x2={w - PAD.r} y2={y} className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="3 4" />
            })}
            <line x1={PAD.l} y1={H - PAD.b} x2={w - PAD.r} y2={H - PAD.b} className="stroke-slate-300 dark:stroke-slate-600" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="flex flex-col items-center text-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1e293b] px-5 py-4 shadow-sm">
              <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-slate-500">bar_chart</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Belum ada data arus kas</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload BKU agar grafik penerimaan vs pengeluaran muncul.</p>
              <Link to="/dashboard/bku" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Upload di Kas & Dokumen <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
      <Header title="Arus Kas" subtitle="Penerimaan vs pengeluaran per bulan (BKU)" />
      <div className="px-3 py-3">
        <div className="flex items-center justify-between gap-3 pt-2">
          {segments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setView(seg.id)}
              aria-selected={view === seg.id}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${view === seg.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300'
                }
              `}
            >
              {seg.label}
            </button>
          ))}
        </div>
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} className="block" role="img" aria-label="Grafik arus kas per bulan">
          <defs>
            <linearGradient id="akMasuk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2457A7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2457A7" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="akTahap1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t.y}>
              <line x1={PAD.l} y1={t.y} x2={w - PAD.r} y2={t.y} className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="3 4" />
              <text x={PAD.l - 8} y={t.y + 4} textAnchor="end" fontSize="11" className="fill-slate-500 dark:fill-slate-400">{fmtSingkat(t.v)}</text>
            </g>
          ))}
          {/* Penerimaan */}
          <path d={areaMasuk} fill="url(#akMasuk)" />
          <path d={kePath(pMasuk)} fill="none" stroke="#2457A7" strokeWidth="2" />
          {pMasuk.map((p, i) => (
            <circle key={`m${i}`} cx={p.x} cy={p.y} r="3.5" fill="#2457A7">
              <title>{`${monthly[i].namaBulan}: masuk ${fmtSingkat(masuk[i])}, keluar ${fmtSingkat(keluar[i])}`}</title>
            </circle>
          ))}
          {showTahap1 && (
            <>
              {/* Tahap 1 */}
              <path d={areaTahap1} fill="url(#akTahap1)" />
              <path d={kePath(pTahap1)} fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" />
              {pTahap1.map((p, i) => (
                <circle key={`t1${i}`} cx={p.x} cy={p.y} r="3" fill="#3B82F6" opacity="0.7">
                  <title>{`Tahap 1 ${monthly[i].namaBulan}: keluar ${fmtSingkat(tahap1[i])}`}</title>
                </circle>
              ))}
            </>
          )}
          {showTahap2 && (
            <>
              {/* Tahap 2 */}
              <path d={kePath(pTahap2)} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
              {pTahap2.map((p, i) => (
                <circle key={`t2${i}`} cx={p.x} cy={p.y} r="3" fill="#94A3B8" opacity="0.7">
                  <title>{`Tahap 2 ${monthly[i].namaBulan}: keluar ${fmtSingkat(tahap2[i])}`}</title>
                </circle>
              ))}
            </>
          )}
          {pMasuk.map((p, i) => (
            <text key={`x${i}`} x={p.x} y={H - 10} textAnchor="middle" fontSize="11" className="fill-slate-500 dark:fill-slate-400">
              {String(monthly[i].namaBulan || '').slice(0, 3)}
            </text>
          ))}
        </svg>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 pt-1 pb-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#2457A7] rounded" /> Penerimaan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#3B82F6] border-t-2 border-dashed border-[#3B82F6]" /> Tahap 1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#94A3B8] border-t-2 border-dashed border-[#94A3B8]" /> Tahap 2
          </span>
        </div>
      </div>
    </div>
  )
}
