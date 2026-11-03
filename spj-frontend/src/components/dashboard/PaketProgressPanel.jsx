/**
 * PaketProgressPanel — Progres paket kerja (ala referensi "Active projects").
 * Item = paket nyata dari storage: LPJ checklist, arsip PBJ, realisasi tahap 1 & 2.
 * Badge: Selesai / Berjalan / Belum mulai. Tanpa data palsu.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'
import { ringkasTahap } from '../../utils/realisasiAgregat'

const fmtRp = (n) => `Rp ${(Number(n) || 0).toLocaleString('id-ID')}`

const BADGE = {
  Selesai: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Berjalan: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'Belum mulai': 'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400',
}

function hitung() {
  const bku = storageHelper.get('bku_data', null)
  const txs = bku?.transactions || []
  const checklist = storageHelper.get('bku_lpj_checklist', {})
  const checked = txs.length ? Object.values(checklist).filter(Boolean).length : 0

  const arsip = storageHelper.get('pbj_arsip', [])
  const inv = storageHelper.get('pbj_invoices', [])
  const pbjTotal = arsip.length + inv.length

  const t1 = ringkasTahap(txs, { tahap: 1 })
  const t2 = ringkasTahap(txs, { tahap: 2 })

  const pct = (a, b) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0)
  const status = (p, ada) => (!ada ? 'Belum mulai' : p >= 100 ? 'Selesai' : 'Berjalan')

  return [
    {
      nama: 'Kelengkapan LPJ',
      desc: txs.length ? `${checked}/${txs.length} transaksi ber checklist` : 'Belum ada transaksi BKU',
      progress: pct(checked, txs.length),
      badge: status(pct(checked, txs.length), txs.length > 0),
      meta: txs.length ? `${pct(checked, txs.length)}%` : '—',
      path: '/dashboard/bku',
    },
    {
      nama: 'Arsip PBJ',
      desc: pbjTotal ? `${arsip.length}/${pbjTotal} invoice terarsip` : 'Belum ada invoice PBJ',
      progress: pct(arsip.length, pbjTotal),
      badge: status(pct(arsip.length, pbjTotal), pbjTotal > 0),
      meta: pbjTotal ? `${arsip.length}/${pbjTotal}` : '—',
      path: '/dashboard/dokumen-kelengkapan',
    },
    {
      nama: 'Realisasi Tahap 1',
      desc: t1.ada ? `Pakai ${fmtRp(t1.pakai)} dari ${fmtRp(t1.terima)}` : 'Belum ada data tahap 1',
      progress: pct(t1.pakai, t1.terima),
      badge: status(pct(t1.pakai, t1.terima), t1.ada),
      meta: t1.ada ? `${pct(t1.pakai, t1.terima)}%` : '—',
      path: '/dashboard/realisasi',
    },
    {
      nama: 'Realisasi Tahap 2',
      desc: t2.ada ? `Pakai ${fmtRp(t2.pakai)} dari ${fmtRp(t2.terima)}` : 'Belum ada data tahap 2',
      progress: pct(t2.pakai, t2.terima),
      badge: status(pct(t2.pakai, t2.terima), t2.ada),
      meta: t2.ada ? `${pct(t2.pakai, t2.terima)}%` : '—',
      path: '/dashboard/realisasi',
    },
  ]
}

export default function PaketProgressPanel() {
  const [items, setItems] = useState(hitung)

  useEffect(() => {
    const muat = () => setItems(hitung())
    muat()
    window.addEventListener('focus', muat)
    return () => window.removeEventListener('focus', muat)
  }, [])

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Progres Paket Kerja</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Capaian per paket dari data nyata</p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-5">
        {items.map((p) => (
          <div key={p.nama} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Link to={p.path} className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-primary hover:underline">
                {p.nama}
              </Link>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${BADGE[p.badge]}`}>{p.badge}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.desc}</p>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">{p.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
