/**
 * MenuGuide — pill Panduan + popover checklist sadar-state (Sprint 003 US-26…US-30).
 * Non-modal (tidak menghalangi form), print:hidden (tidak ikut cetak),
 * config-driven via data/guideConfig.js, storage prefix spj_.
 */
import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import { GUIDE_MENUS } from '../../data/guideConfig'

export default function MenuGuide({ menuId, ctx = {} }) {
  const cfg = GUIDE_MENUS[menuId]
  const visitedKey = `spj_guide_visited_${menuId}`
  const dismissedKey = `spj_guide_dismissed_${menuId}`
  const [dismissed, setDismissed] = useState(() => storageHelper.get(dismissedKey, false) === true)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  // Auto-open hanya kunjungan pertama per menu (maks 1x)
  useEffect(() => {
    if (!cfg) return
    const visited = storageHelper.get(visitedKey, false) === true
    const off = storageHelper.get(dismissedKey, false) === true
    if (!visited && !off) {
      setOpen(true)
      storageHelper.set(visitedKey, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId])

  // Klik-luar & Escape menutup popover
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!cfg) return null

  const safe = (fn) => {
    try {
      return fn(ctx) === true
    } catch {
      return false
    }
  }
  const doneCount = cfg.steps.filter((s) => safe(s.done)).length

  const dismiss = () => {
    storageHelper.set(dismissedKey, true)
    setDismissed(true)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative print:hidden">
      {dismissed ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          title={cfg.title}
          className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-sm font-bold hover:bg-primary/10 hover:text-primary transition-colors"
        >
          ?
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
        >
          <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">?</span>
          Panduan
          <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
            {doneCount}/{cfg.steps.length}
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={cfg.title}
          className="absolute right-0 top-full mt-2 w-[360px] max-w-[90vw] bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-slate-200">
            <p className="text-sm font-bold text-slate-800">{cfg.title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup panduan"
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <ul className="p-2">
            {cfg.steps.map((s) => {
              const done = safe(s.done)
              const active = !done && safe(s.active)
              return (
                <li
                  key={s.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                    active ? 'bg-primary/5' : ''
                  }`}
                >
                  {done ? (
                    <span className="w-5 h-5 shrink-0 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">✓</span>
                  ) : (
                    <span className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      active ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </span>
                  )}
                  <span className={`flex-1 ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {s.label}
                  </span>
                  {active && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase">
                      Sekarang
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="px-4 py-3 border-t border-slate-100">
            <button
              type="button"
              onClick={dismiss}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Selesai — jangan tampilkan lagi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
