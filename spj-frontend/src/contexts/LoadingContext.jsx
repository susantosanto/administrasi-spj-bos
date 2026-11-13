import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import BrandedLoader from '../components/ui/BrandedLoader'

const LoadingContext = createContext(null)

/**
 * LoadingProvider — loader global ASIK
 * Dipakai di mana saja: const { show, hide, withLoading } = useLoading()
 * - show(title, subtitle) → tampil fullscreen
 * - hide() → hilang (dengan animasi exiting 300ms)
 * - withLoading(fn, title, subtitle) → bungkus async otomatis
 *
 * Counter ref-count agar beberapa proses bersamaan tidak saling matikan.
 */
export function LoadingProvider({ children }) {
  const [state, setState] = useState({ active: false, exiting: false, title: 'Memproses...', subtitle: 'Mohon tunggu sebentar' })
  const countRef = useRef(0)
  const timerRef = useRef(null)

  const show = useCallback((title = 'Memproses...', subtitle = 'Mohon tunggu sebentar') => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    countRef.current += 1
    setState({ active: true, exiting: false, title, subtitle })
  }, [])

  const hide = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    if (countRef.current > 0) return
    setState((s) => ({ ...s, exiting: true }))
    timerRef.current = setTimeout(() => {
      setState((s) => ({ ...s, active: false, exiting: false }))
    }, 300)
  }, [])

  const withLoading = useCallback(async (fn, title, subtitle) => {
    show(title, subtitle)
    try { return await fn() } finally { hide() }
  }, [show, hide])

  return (
    <LoadingContext.Provider value={{ show, hide, withLoading, isLoading: state.active }}>
      {children}
      {state.active && typeof document !== 'undefined' && createPortal(
        <BrandedLoader variant="fullscreen" title={state.title} subtitle={state.subtitle} exiting={state.exiting} />,
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

// Service untuk non-React (mis. interceptor) — diisi oleh Provider saat mount
export const loadingService = {
  show: () => {},
  hide: () => {},
  _bind(s, h) { this.show = s; this.hide = h }
}
