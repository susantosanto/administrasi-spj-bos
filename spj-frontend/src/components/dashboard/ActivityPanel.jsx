/**
 * ActivityPanel — Aktivitas operator terbaru (ala referensi "Recent activity").
 * Sumber: `spj_activity_log` via `utils/activityLog.js`.
 * Kosong → empty state jujur (bukan data palsu).
 */
import { useEffect, useState } from 'react'
import { getActivity } from '../../utils/activityLog'

function relatif(ts) {
  const dt = (Date.now() - new Date(ts).getTime()) / 1000
  if (!Number.isFinite(dt) || dt < 0) return ''
  if (dt < 60) return 'baru saja'
  if (dt < 3600) return `${Math.floor(dt / 60)} mnt lalu`
  if (dt < 86400) return `${Math.floor(dt / 3600)} jam lalu`
  if (dt < 604800) return `${Math.floor(dt / 86400)} hari lalu`
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ActivityPanel() {
  const [items, setItems] = useState(() => getActivity(7))

  useEffect(() => {
    const muat = () => setItems(getActivity(7))
    muat()
    window.addEventListener('focus', muat)
    return () => window.removeEventListener('focus', muat)
  }, [])

  return (
    <div className="flex flex-col bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-transparent">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Aktivitas Terbaru</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Jejak kerja operator di aplikasi</p>
      </div>
      <div className="px-5 py-4 flex-1 flex flex-col">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-2 py-6">
            <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">history</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Belum ada aktivitas</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">Upload BKU atau buat nomor surat untuk mulai mencatat jejak kerja.</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-4">
            {items.map((a) => (
              <li key={a.id} className="flex items-start gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base text-slate-500 dark:text-slate-300">{a.icon || 'info'}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-slate-800 dark:text-slate-100 truncate">{a.title}</p>
                  {a.detail ? <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{a.detail}</p> : null}
                  <p className="text-xs text-slate-500 dark:text-slate-400">{relatif(a.ts)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
