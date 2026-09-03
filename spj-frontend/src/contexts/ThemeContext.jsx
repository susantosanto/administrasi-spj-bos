/**
 * ThemeContext — Light / Dark with persistence + system preference
 * Premium Blue: light #f8f9fb, dark #0f172a. Toggle adds class "dark" to <html>
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'spj_theme' // 'light' | 'dark'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  // apply class to html
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, theme)
    // for CSS variables sync
    root.setAttribute('data-theme', theme)
    setMounted(true)
  }, [theme])

  // listen system change if user hasn't manually set
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const set = useCallback((v) => {
    if (v === 'light' || v === 'dark') setTheme(v)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: set, isDark: theme === 'dark', mounted }}>
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
