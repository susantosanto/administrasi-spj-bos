/**
 * ArusKasChart — Arus kas BKU per bulan (SVG mandiri, tanpa deps chart).
 * Sumber: `bku_data.summary.monthlySummaries` (penerimaan vs pengeluaran).
 * Seri 1 (penerimaan): garis + area gradien. Seri 2 (pengeluaran): garis putus.
 * Kosong → empty state + tautan upload.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'

const W = 600
const H = 220
const PAD = { l: 46, r: 12, t: 12, b: 30 }

const fmtSingkat = (n) => {
  const v = Number(n) || 0
  const f = (x, s) => `Rp ${x.toLocaleString('id-ID', { maximumFractionDigits: 1 })} ${s}`
  if (Math.abs(v) >= 1e9) return f(v / 1e9, 'M')
  if (Math.abs(v) >= 1e6) return f(v / 1e6, 'jt')
  if (Math.abs(v) >= 1e3) return f(v / 1e3, 'rb')
  return `Rp ${v.toLocaleString('id-ID')}`
}

function titik(data, max) {
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const n = data.length
  return data.map((d, i) => ({
    x: PAD.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1)),
    y: PAD.t + ih - (max > 0 ? (d / max) * ih : 0),
  }))
}

const kePath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

export default function ArusKasChart() {
  const [monthly, setMonthly] = useState(() => storageHelper.get('bku_data', null)?.summary?.monthlySummaries || [])

  useEffect(() => {
    const muat = () => setMonthly(storageHelper.get('bku_data', null)?.summary?.monthlySummaries || [])
    muat()
    window.addEventListener('focus', muat)
    return () => window.removeEventListener('focus', muat)
  }, [])

  if (monthly.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-slate-300">bar_chart</span>
        <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">Belum ada data arus kas</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Upload BKU agar grafik penerimaan vs pengeluaran muncul.</p>
        <Link to="/dashboard/bku" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          Upload di Kas & Dokumen <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    )
  }

  const masuk = monthly.map((m) => Number(m.totalPenerimaan) || 0)
  const keluar = monthly.map((m) => Number(m.totalPengeluaran) || 0)
  const max = Math.max(...masuk, ...keluar, 1)
  const pMasuk = titik(masuk, max)
  const pKeluar = titik(keluar, max)
  const area = `${kePath(pMasuk)} L${pMasuk[pMasuk.length - 1].x.toFixed(1)},${(H - PAD.b).toFixed(1)} L${pMasuk[0].x.toFixed(1)},${(H - PAD.b).toFixed(1)} Z`
  const ticks = [0.25, 0.5, 0.75, 1].map((f) => ({ v: max * f, y: PAD.t + (H - PAD.t - PAD.b) * (1 - f) }))

  return (
    <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Arus Kas</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Penerimaan vs pengeluaran per bulan (BKU)</p>
      </div>
      <div className="px-3 py-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56" role="img" aria-label="Grafik arus kas per bulan">
          <defs>
            <linearGradient id="akMasuk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2457A7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2457A7" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 3" />
              <text x={PAD.l - 6} y={t.y + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.55">{fmtSingkat(t.v)}</text>
            </g>
          ))}
          <path d={area} fill="url(#akMasuk)" />
          <path d={kePath(pKeluar)} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
          <path d={kePath(pMasuk)} fill="none" stroke="#2457A7" strokeWidth="2" />
          {pMasuk.map((p, i) => (
            <circle key={`m${i}`} cx={p.x} cy={p.y} r="3" fill="#2457A7">
              <title>{`${monthly[i].namaBulan}: masuk ${fmtSingkat(masuk[i])}, keluar ${fmtSingkat(keluar[i])}`}</title>
            </circle>
          ))}
          {monthly.map((m, i) => (
            <text key={`x${i}`} x={pMasuk[i].x} y={H - 10} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">
              {String(m.namaBulan || '').slice(0, 3)}
            </text>
          ))}
        </svg>
        <div className="flex items-center gap-4 px-2 pb-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#2457A7] rounded" /> Penerimaan</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-slate-400" /> Pengeluaran</span>
        </div>
      </div>
    </div>
  )
}
