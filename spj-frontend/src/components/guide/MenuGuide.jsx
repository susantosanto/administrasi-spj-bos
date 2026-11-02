/**
 * MenuGuide — pill Panduan + popover checklist sadar-state (Sprint 003 US-26…US-30).
 * Non-modal (tidak menghalangi form), print:hidden (tidak ikut cetak),
 * config-driven via data/guideConfig.js, storage prefix spj_.
 *
 * REVISI 2026-10-01 (4 keputusan user — BLUEPRINT §ADDENDUM task R4).
 * Aturan prioritas (dari atas):
 *  a. mount (kunjungan menu detail, key={menuId}) → auto-open SETIAP KALI,
 *     selama belum pernah dismiss;
 *  b. setiap PERPINDAHAN KONTEKS (jenis/sub, tab form, mode form/preview) →
 *     popover SELALU tampil dengan langkah konteks baru — selama belum dismiss;
 *     popover yang sedang terbuka (mis. setelah klik langkah) TETAP terbuka;
 *  c. transisi langkah belum→selesai → popover SELALU muncul (edge-triggered,
 *     jeda 600 ms), TERMASUK sesudah dismiss — dismiss hanya mematikan (a)+(b);
 *  d. tombol dismiss "Selesai — jangan buka otomatis lagi" permanen per menu.
 *  e. tiap langkah BISA DIKLIK → onJump({mode,tab}) berpindah ke langkah tsb
 *     + scroll ke area detail (popover tetap terbuka).
 * Langkah terlihat = config (klausul when); langkah AKTIF = yang pertama
 * belum-selesai (bukan predikat active manual).
 */
import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import { GUIDE_MENUS } from '../../data/guideConfig'

const asBool = (fn, ctx) => {
  try {
    return fn(ctx) === true
  } catch {
    return false
  }
}
const asWhen = (fn, ctx) => {
  try {
    return !!fn(ctx)
  } catch {
    return false
  }
}

export default function MenuGuide({ menuId, ctx = {}, onJump }) {
  const cfg = GUIDE_MENUS[menuId]
  const dismissedKey = `spj_guide_dismissed_${menuId}`
  const activeTab = ctx.activeTab || 'f:form'
  // Konteks = gabungan menu × jenis/sub × tab — tiap perubahan → efek di bawah
  const contextKey = `${menuId}|${ctx.subId || ''}|${activeTab}`
  const [dismissed, setDismissed] = useState(() => storageHelper.get(dismissedKey, false) === true)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const doneRef = useRef(null) // done-key sebelumnya (null = render pertama)
  const timerRef = useRef(null)

  const steps = cfg ? cfg.steps.filter((s) => !s.when || asWhen(s.when, ctx)) : []
  const doneFlags = steps.map((s) => asBool(s.done, ctx))
  const doneCount = doneFlags.filter(Boolean).length
  const doneKey = steps.map((s, i) => `${s.id}:${doneFlags[i] ? 1 : 0}`).join('|')

  // (a)+(b) RONDE-2: masuk menu / ganti jenis / ganti tab / ganti mode → popover
  // SELALU tampil dengan konteks baru (bila belum dismiss). Jika sedang terbuka
  // → tetap terbuka (dipakai klik langkah). StrictMode-safe (idempoten).
  useEffect(() => {
    if (!cfg) return
    const off = storageHelper.get(dismissedKey, false) === true
    setOpen((was) => was || !off)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey])

  // (c) Transisi langkah belum→selesai → popover selalu muncul (lewati dismiss)
  useEffect(() => {
    if (!cfg) return
    if (doneRef.current === null) {
      doneRef.current = doneKey
      return
    }
    if (doneRef.current === doneKey) return
    const prevMap = new Map(
      doneRef.current.split('|').filter(Boolean).map((pair) => {
        const i = pair.lastIndexOf(':')
        return [pair.slice(0, i), pair.slice(i + 1)]
      })
    )
    doneRef.current = doneKey
    // Edge-triggered hanya untuk langkah yang benar-benar baru selesai;
    // langkah baru muncul (when) tidak dihitung — hindari buka ganda.
    const gained = steps.some((s, i) => doneFlags[i] && prevMap.get(s.id) === '0')
    if (gained) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        setOpen(true)
      }, 600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey])

  // Bersihkan timer saat unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

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

  const activeIdx = doneFlags.findIndex((d) => !d)

  const dismiss = () => {
    storageHelper.set(dismissedKey, true)
    setDismissed(true)
    setOpen(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
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
            {doneCount}/{steps.length}
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
            {steps.map((s, i) => {
              const done = doneFlags[i]
              const active = !done && i === activeIdx
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onJump?.(s.jump)}
                    title="Klik untuk buka langkah ini"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                      active ? 'bg-primary/5' : 'hover:bg-slate-50'
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
                  <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                  </button>
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
              Selesai — jangan buka otomatis lagi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
