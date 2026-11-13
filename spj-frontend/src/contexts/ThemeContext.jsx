/**
 * ThemeContext — Light / Dark with persistence + system preference + staged transition
 * Premium Blue: light #f8f9fb, dark #0f172a. Toggle adds class "dark" to <html>
 *
 * Global Theme Engine (feat/theme-engine):
 * - ThemeProvider tunggal (satu-satunya source of truth tema di aplikasi).
 * - Persistensi `spj_theme` via storageAdapter; FOUC dicegah inline script index.html.
 * - `toggleWithTransition()` — transisi bertahap Light→Golden Hour→Sunset→Twilight→Night
 *   (dan kebalikannya), HANYA dipicu klik pengguna. Class `dark` di-swap di tengah transisi.
 * - `prefers-reduced-motion` → transisi dilewati, tema langsung berpindah.
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getItem, setItem } from '../utils/storageAdapter'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'spj_theme' // 'light' | 'dark'
// Durasi satu tahap overlay (ms). Dikirim ke CSS sebagai --fx-stage-ms.
export const STAGE_MS = 300

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch (e) {}
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const [mounted, setMounted] = useState(false)
  // Transisi bertahap: { active, stage, toDark } — stage 0 = idle.
  const [stageFx, setStageFx] = useState({ active: false, stage: 0, toDark: true })
  const fxTimers = useRef([])
  const fxActive = useRef(false)
  const fxTarget = useRef(false)

  const clearFxTimers = useCallback(() => {
    fxTimers.current.forEach(clearTimeout)
    fxTimers.current = []
  }, [])

  useEffect(() => () => clearFxTimers(), [clearFxTimers])

  // apply class to html
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setItem(STORAGE_KEY, theme)
    root.setAttribute('data-theme', theme)
    setMounted(true)
  }, [theme])

  // listen system change if user hasn't manually set
  useEffect(() => {
    let mql
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)')
    } catch (e) {
      return
    }
    const handler = (e) => {
      const stored = getItem(STORAGE_KEY)
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])

  const prefersReducedMotion = useCallback(() => {
    try {
      return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    } catch (e) {
      return false
    }
  }, [])

  // Transisi instan (tanpa overlay) — dipakai sistem & reduced-motion.
  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  // Transisi bertahap via overlay langit — HANYA dari klik pengguna (ThemeToggle).
  // Ke Dark : Golden Hour → Sunset → Twilight → Night
  // Ke Light: Moonset → Dawn → Sunrise → Day
  const toggleWithTransition = useCallback(() => {
    // Transisi masih berjalan → klik lagi = selesaikan instan ke arah transisi.
    if (fxActive.current) {
      clearFxTimers()
      fxActive.current = false
      document.documentElement.classList.remove('theme-crossfade')
      setTheme(fxTarget.current ? 'dark' : 'light')
      setStageFx((fx) => ({ active: false, stage: 0, toDark: fx.toDark }))
      return
    }
    if (prefersReducedMotion()) {
      toggle()
      return
    }
    const toDark = theme !== 'dark'
    fxActive.current = true
    fxTarget.current = toDark
    setStageFx({ active: true, stage: 1, toDark })
    const D = STAGE_MS
    const at = (fn, ms) => fxTimers.current.push(setTimeout(fn, ms))
    at(() => setStageFx({ active: true, stage: 2, toDark }), D)
    at(() => setStageFx({ active: true, stage: 3, toDark }), D * 2)
    at(() => setStageFx({ active: true, stage: 4, toDark }), D * 3)
    // Swap class `dark` di tengah crossfade tahap 4.
    at(() => {
      document.documentElement.classList.add('theme-crossfade')
      setTheme(toDark ? 'dark' : 'light')
    }, D * 3 + D * 0.55)
    at(() => {
      fxActive.current = false
      setStageFx({ active: false, stage: 0, toDark })
    }, D * 4 + 150)
    at(() => document.documentElement.classList.remove('theme-crossfade'), D * 4 + 1100)
  }, [theme, toggle, prefersReducedMotion, clearFxTimers])

  const set = useCallback((v) => {
    if (v === 'light' || v === 'dark') setTheme(v)
  }, [])

  return (
    <ThemeContext.Provider
      value={{ theme, toggle, toggleWithTransition, setTheme: set, isDark: theme === 'dark', mounted, stageFx }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext
