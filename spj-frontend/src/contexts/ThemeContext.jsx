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
// Urutan tahap overlay langit (0 = idle). Index ganjil/genap dipakai overlay CSS.
const STAGE_MS = [520, 520, 520, 520] // durasi tiap tahap; total ~2.1s — halus, tidak mengganggu

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
  // Transisi bertahap: { active, stage, toDark } — stage 0 = idle. Dibaca ThemeTransitionLayer.
  const [stageFx, setStageFx] = useState({ active: false, stage: 0, toDark: true })
  const fxTimers = useRef([])
  const fxActive = useRef(false)

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
    // for CSS variables sync
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
  // Urutan tahap index.css: 1 Golden Hour, 2 Sunset, 3 Twilight, 4 Night
  // (kebalikannya untuk ke Light: Moonset, Dawn, Sunrise).
  const toggleWithTransition = useCallback(() => {
    // Transisi masih berjalan → klik lagi = selesaikan instan ke target.
    if (fxActive.current) {
      clearFxTimers()
      fxActive.current = false
      setStageFx((fx) => ({ active: false, stage: 0, toDark: fx.toDark }))
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
      return
    }
    if (prefersReducedMotion()) {
      toggle()
      return
    }
    const toDark = theme !== 'dark'
    fxActive.current = true
    setStageFx({ active: true, stage: 1, toDark })
    let elapsed = 0
    for (let i = 0; i < STAGE_MS.length; i++) {
      elapsed += STAGE_MS[i]
      const stage = i + 1
      if (stage < STAGE_MS.length) {
        // Tahap tengah — cuma ganti warna overlay
        fxTimers.current.push(setTimeout(() => setStageFx({ active: true, stage, toDark }), elapsed))
      } else {
        // Tahap terakhir: swap class `dark` di tema nyata, lalu tutup overlay
        fxTimers.current.push(
          setTimeout(() => {
            setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
            setStageFx({ active: true, stage, toDark })
          }, elapsed - STAGE_MS[STAGE_MS.length - 1] * 0.4)
        )
        fxTimers.current.push(
          setTimeout(() => {
            fxActive.current = false
            setStageFx({ active: false, stage: 0, toDark })
          }, elapsed + 260)
        )
      }
    }
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
