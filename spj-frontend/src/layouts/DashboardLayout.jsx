/**
 * Dashboard Layout — Responsive Design 2026
 * Mobile: overlay sidebar, Desktop: push sidebar
 */
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext'
import { useTheme } from '../contexts/ThemeContext'
import { seedMockData } from '../data/mockData'
import storageHelper from '../utils/storageHelper'
import { licenseService } from '../services/licenseService'

function DashboardContent() {
  const { isOpen, isMobile } = useSidebar()
  const { isDark } = useTheme()

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
      {/* Batik accent — subtle header, drift pelan 60s */}
      <div className="fixed inset-x-0 top-0 h-[280px] overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-x-0 -inset-y-[360px] animate-batik-drift"
          style={{
            backgroundImage: "url('/floral-pattern.jpg')",
            backgroundSize: "360px 360px",
            backgroundRepeat: "repeat",
            opacity: isDark ? 0.03 : 0.04,
            mixBlendMode: isDark ? "normal" : "multiply",
            animationDuration: '60s',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f8f9fb] dark:to-[#0f172a]" />
      </div>
      <Sidebar />
      <main
        className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          !isMobile && isOpen ? 'lg:ml-[260px]' : 'ml-0'
        }`}
      >
        <Outlet />
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
