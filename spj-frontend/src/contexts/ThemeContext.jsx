/**
 * ThemeContext — Light Mode Only (Dark Mode dihapus Step 7.5)
 * Tetap mempertahankan API agar komponen lain tidak error.
 */
import { createContext, useContext } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Selalu Light Mode — Dark Mode dihapus
  const theme = 'light'
  const isDark = false
  const toggle = () => {} // no-op, karena dark mode dihapus
  const setTheme = () => {} // no-op

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme, isDark, mounted: true }}>
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
