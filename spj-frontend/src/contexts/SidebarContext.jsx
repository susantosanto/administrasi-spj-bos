/**
 * Sidebar Context — Responsive Design 2026
 * Handles sidebar state with mobile-first approach
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const SidebarContext = createContext(null)
const DESKTOP_SIDEBAR_MIN = 900

export function SidebarProvider({ children }) {
  // Check if screen is mobile
  const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth < DESKTOP_SIDEBAR_MIN

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(getIsMobile())

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < DESKTOP_SIDEBAR_MIN
      if (mobile === isMobile) return
      setIsMobile(mobile)
      setIsOpen(false)
      setIsExpanded(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  const toggle = useCallback(() => {
    if (isMobile) setIsOpen((prev) => !prev)
    else setIsExpanded((prev) => !prev)
  }, [isMobile])
  const open = useCallback(() => {
    if (isMobile) setIsOpen(true)
    else setIsExpanded(true)
  }, [isMobile])
  const close = useCallback(() => {
    if (isMobile) setIsOpen(false)
    else setIsExpanded(false)
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ isOpen: isMobile ? isOpen : isExpanded, isExpanded, isMobile, toggle, open, close }}>
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
