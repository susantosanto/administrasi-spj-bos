/**
 * Sidebar Context — Responsive Design 2026
 * Handles sidebar state with mobile-first approach
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  // Check if screen is mobile
  const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024

  const [isOpen, setIsOpen] = useState(() => !getIsMobile())
  const [isMobile, setIsMobile] = useState(getIsMobile())

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // Auto-close sidebar when switching to mobile
      if (mobile) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

export default SidebarContext
