/**
 * Dashboard Layout — Responsive Design 2026
 * Mobile: overlay sidebar, Desktop: push sidebar
 */
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext'
import { useTheme } from '../contexts/ThemeContext'
import { seedMockData } from '../data/mockData'
import storageHelper from '../utils/storageHelper'
import { licenseService } from '../services/licenseService'
import TrialMiniBanner from '../components/ui/TrialMiniBanner'

function DashboardContent() {
  const { isOpen, isMobile } = useSidebar()
  const { isDark } = useTheme()
  const location = useLocation()

  useEffect(() => {
    storageHelper.ensureSchemaVersion()
    seedMockData()
    // Refresh status lisensi saat masuk dashboard (REPLACES perlu klik manual)
    licenseService.refresh()
    const iv = setInterval(() => licenseService.refresh(), 15 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div
      className="flex min-h-screen relative"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F3F5F9' }}
    >
      {/* Batik — full dashboard, lebih terlihat 0.08 (was 0.05) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-x-0 -inset-y-[360px] animate-batik-drift"
          style={{
            backgroundImage: "url('/floral-pattern.jpg')",
            backgroundSize: "360px 360px",
            backgroundRepeat: "repeat",
            opacity: isDark ? 0.07 : 0.09,
            mixBlendMode: isDark ? "normal" : "multiply",
            animationDuration: '60s',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent dark:from-transparent" />
      </div>
      <Sidebar />
      {/* Mini banner trial mengambang draggable — khusus TRIAL, hilang saat berbayar */}
      <TrialMiniBanner variant="floating" />
      <main
        className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          !isMobile && isOpen ? 'lg:ml-[260px]' : 'ml-0'
        }`}
      >
        <div key={location.pathname} className="animate-fade-in flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  )
}
