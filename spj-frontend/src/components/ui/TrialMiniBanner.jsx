import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLicenseStatus } from '../../services/licenseService'

/**
 * TrialMiniBanner — khusus TRIAL, hilang otomatis saat berbayar (ACTIVE/GRACE dll)
 * variant="banner"  → pill inline (untuk Topbar)
 * variant="floating"→ popup mengambang draggable (geser, double-click reset)
 */
export default function TrialMiniBanner({ variant = 'banner' }) {
  const lic = useLicenseStatus()
  const navigate = useNavigate()
  const [dismiss, setDismiss] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0, abs: false })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef(null)
  const offsetRef = useRef({ ox: 0, oy: 0 })

  const isFloating = variant === 'floating' || variant === 'popup'
  const days = lic.validUntil ? Math.max(0, Math.ceil((new Date(lic.validUntil) - new Date()) / 86400000)) : 14

  // reset posisi saat resize
  useEffect(() => {
    if (!isFloating) return
    const onResize = () => setPos({ x: 0, y: 0, abs: false })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isFloating])

  const onPointerMove = useCallback((e) => {
    const el = dragRef.current
    if (!el) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = el.offsetWidth || 340
    const h = el.offsetHeight || 88
    let nx = e.clientX - offsetRef.current.ox
    let ny = e.clientY - offsetRef.current.oy
    nx = Math.max(8, Math.min(nx, vw - w - 8))
    ny = Math.max(8, Math.min(ny, vh - h - 8))
    setPos({ x: nx, y: ny, abs: true })
  }, [])

  const onPointerUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [dragging, onPointerMove, onPointerUp])

  if (dismiss) return null
  if (lic.status !== 'TRIAL') return null

  if (isFloating) {
    const onPointerDown = (e) => {
      const el = dragRef.current
      if (!el) return
      // hanya drag dari card, bukan dari tombol
      if (e.target.closest('button')) return
      const rect = el.getBoundingClientRect()
      offsetRef.current = { ox: e.clientX - rect.left, oy: e.clientY - rect.top }
      setDragging(true)
    }

    const style = pos.abs
      ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
      : { right: 16, bottom: 16 }

    return (
      <div
        ref={dragRef}
        onPointerDown={onPointerDown}
        onDoubleClick={() => setPos({ x: 0, y: 0, abs: false })}
        title="Geser untuk pindah — klik 2× untuk reset"
        style={style}
        className={`fixed z-50 select-none max-w-[340px] w-[calc(100vw-32px)] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/50 rounded-2xl shadow-xl shadow-amber-900/10 p-3.5 flex gap-3 items-center cursor-grab active:cursor-grabbing ${dragging ? 'opacity-95 scale-[1.01]' : ''} transition-[opacity,transform]`}
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">Uji Coba: {days} Hari</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Geser • klik 2× reset</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => navigate('/dashboard/pengaturan?tab=lisensi')}
            className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
          >
            Perpanjang
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setDismiss(true)}
            aria-label="Tutup"
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-200">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      Uji Coba: {days} Hari
      <button
        onClick={() => navigate('/dashboard/pengaturan?tab=lisensi')}
        className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] hover:bg-amber-600"
      >
        Perpanjang
      </button>
      <button
        onClick={() => setDismiss(true)}
        aria-label="Tutup"
        className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  )
}
