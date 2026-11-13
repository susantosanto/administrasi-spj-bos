import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import BrandedLoader from '../components/ui/BrandedLoader'

const LoadingContext = createContext(null)

/**
 * LoadingProvider — loader global ASIK
 * Dipakai di mana saja: const { show, hide, withLoading } = useLoading()
 * - show(title, subtitle) → tampil fullscreen
 * - hide() → hilang (dengan animasi exiting 250ms)
 * - withLoading(fn, title, subtitle) → bungkus async otomatis
 * Counter ref-count agar beberapa proses bersamaan tidak saling matikan.
 */
export function LoadingProvider({ children }) {
  const [state, setState] = useState({ active: false, exiting: false, title: 'Memproses...', subtitle: 'Mohon tunggu sebentar' })
  const countRef = useRef(0)
  const timerRef = useRef(null)
  const failSafeRef = useRef(null)

  const show = useCallback((title = 'Memproses...', subtitle = 'Mohon tunggu sebentar') => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (failSafeRef.current) { clearTimeout(failSafeRef.current); failSafeRef.current = null }
    countRef.current += 1
    setState({ active: true, exiting: false, title, subtitle })
    // Fail-safe: jangan biarkan loader nyangkut >2.5s (StrictMode / lupa hide)
    failSafeRef.current = setTimeout(() => {
      if (countRef.current > 0) {
        countRef.current = 0
        setState((s) => ({ ...s, exiting: true }))
        timerRef.current = setTimeout(() => setState((s) => ({ ...s, active: false, exiting: false })), 250)
      }
    }, 2500)
  }, [])

  const hide = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    if (countRef.current > 0) return
    if (failSafeRef.current) { clearTimeout(failSafeRef.current); failSafeRef.current = null }
    setState((s) => ({ ...s, exiting: true }))
    timerRef.current = setTimeout(() => {
      setState((s) => ({ ...s, active: false, exiting: false }))
    }, 250)
  }, [])

  const forceHide = useCallback(() => {
    countRef.current = 0
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (failSafeRef.current) { clearTimeout(failSafeRef.current); failSafeRef.current = null }
    setState((s) => s.active ? { ...s, exiting: true } : s)
    timerRef.current = setTimeout(() => setState((s) => ({ ...s, active: false, exiting: false })), 250)
  }, [])

  const withLoading = useCallback(async (fn, title, subtitle) => {
    show(title, subtitle)
    try { return await fn() } finally { hide() }
  }, [show, hide])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && countRef.current > 0) forceHide() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [forceHide])

  return (
    <LoadingContext.Provider value={{ show, hide, forceHide, withLoading, isLoading: state.active }}>
      {children}
      {state.active && typeof document !== 'undefined' && createPortal(
        <div onClick={forceHide} title="Klik untuk tutup (ESC)">
          <BrandedLoader variant="fullscreen" title={state.title} subtitle={state.subtitle} exiting={state.exiting} />
        </div>,
        document.body
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading harus di dalam <LoadingProvider>')
  return ctx
}

export const loadingService = {
  show: () => {},
  hide: () => {},
  _bind(s, h) { this.show = s; this.hide = h }
}
