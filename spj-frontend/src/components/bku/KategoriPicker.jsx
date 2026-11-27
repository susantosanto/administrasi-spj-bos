/**
 * KategoriPicker — pemilih kategori premium minimalis (pengganti <select> OS).
 * Tombol pill + panel popover (portal, fixed position). Tutup saat klik di
 * luar, Escape, scroll, atau resize. Keyboard: Enter/Space membuka, Esc menutup.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LABEL_KATEGORI, WARNA_KATEGORI } from '../../utils/bkuKategori'
import { cn } from '../../lib/utils'

export default function KategoriPicker({ value, options, onChange, ariaLabel }) {
  const [buka, setBuka] = useState(false)
  const [posisi, setPosisi] = useState({ top: 0, left: 0, width: 200 })
  const tombolRef = useRef(null)
  const panelRef = useRef(null)

  const terpilih = options.findIndex((entry) => entry.kategori === value)
  const warna = WARNA_KATEGORI[value] || null
  const labelAktif = terpilih >= 0
    ? (LABEL_KATEGORI[value] || options[terpilih].label || value)
    : 'Pilih kategori'
  const pillWarna = warna ? warna.pill : 'border-slate-200 text-slate-400'
  const dotWarna = warna ? warna.dot : 'bg-slate-300'

  const hitungPosisi = () => {
    const el = tombolRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const lebar = Math.max(r.width, 200)
    setPosisi({
      top: r.bottom + 6,
      left: Math.min(r.left, window.innerWidth - lebar - 12),
      width: lebar,
    })
  }

  useLayoutEffect(() => {
    if (buka) hitungPosisi()
  }, [buka])

  useEffect(() => {
    if (!buka) return
    const tutupLuar = (e) => {
      if (
        tombolRef.current && !tombolRef.current.contains(e.target)
        && panelRef.current && !panelRef.current.contains(e.target)
      ) setBuka(false)
    }
    const tutupKunci = (e) => { if (e.key === 'Escape') setBuka(false) }
    const tutupGeser = () => setBuka(false)
    document.addEventListener('mousedown', tutupLuar)
    document.addEventListener('keydown', tutupKunci)
    window.addEventListener('scroll', tutupGeser, true)
    window.addEventListener('resize', tutupGeser)
    return () => {
      document.removeEventListener('mousedown', tutupLuar)
      document.removeEventListener('keydown', tutupKunci)
      window.removeEventListener('scroll', tutupGeser, true)
      window.removeEventListener('resize', tutupGeser)
    }
  }, [buka])

  return (
    <>
      <button
        ref={tombolRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={buka}
        onClick={(e) => { e.stopPropagation(); setBuka((v) => !v) }}
        className={cn(
          'inline-flex w-full items-center gap-2 rounded-full border bg-white pl-2.5 pr-2 py-0 text-[12px] font-semibold transition-all duration-150 h-8',
          buka
            ? 'border-primary shadow-[0_0_0_3px_rgba(0,74,198,0.12)]'
            : 'hover:shadow-sm',
          terpilih >= 0 ? pillWarna : 'border-dashed text-slate-400 border-slate-200',
        )}
        title={labelAktif}
      >
        <span
          aria-hidden="true"
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotWarna)}
        />
        <span className="min-w-0 flex-1 truncate text-left">{labelAktif}</span>
        <span className={cn('material-symbols-outlined text-base text-slate-400 transition-transform duration-150', buka && 'rotate-180')} aria-hidden="true">
          expand_more
        </span>
      </button>
      {buka && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          aria-label={ariaLabel}
          className="fixed z-[300] overflow-hidden rounded-2xl border border-slate-200 dark:border-transparent/80 bg-white dark:bg-slate-900 py-1.5 shadow-[0_16px_48px_rgba(15,23,42,0.16)] animate-pop-in origin-top-left"
          style={{ top: posisi.top, left: posisi.left, width: posisi.width }}
        >
          <p className="px-3.5 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Pilih kategori</p>
          {options.map((entry, i) => {
            const aktif = i === terpilih
            const w = WARNA_KATEGORI[entry.kategori]
            return (
              <button
                key={entry.kategori}
                type="button"
                role="option"
                aria-selected={aktif}
                onClick={(e) => { e.stopPropagation(); setBuka(false); onChange(i) }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors',
                  aktif ? 'bg-slate-900/[0.04] font-semibold text-slate-900' : 'font-medium text-slate-600 hover:bg-slate-50',
                )}
              >
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', w ? w.dot : 'bg-slate-200')} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{LABEL_KATEGORI[entry.kategori] || entry.label || entry.kategori}</span>
                {aktif && <span className="material-symbols-outlined text-base text-slate-900 dark:text-white" aria-hidden="true">check</span>}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}
