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

function DashboardContent() {
  const { isOpen, isMobile } = useSidebar()
  const { isDark } = useTheme()

  useEffect(() => {
    seedMockData()
  }, [])

  return (
    <div
      className="flex min-h-screen relative"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F3F5F9' }}
    >
      {/* Batik motif beranimasi — sama seperti landing & login (clipped agar tidak menambah tinggi scroll) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-x-0 -inset-y-[360px] animate-batik-drift"
          style={{
            backgroundImage: "url('/floral-pattern.jpg')",
            backgroundSize: "360px 360px",
            backgroundRepeat: "repeat",
            opacity: isDark ? 0.12 : 0.28,
            mixBlendMode: isDark ? "normal" : "multiply",
          }}
        />
      </div>
      {/* Overlay agar konten tetap terbaca di atas batik */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#02052a]/20 via-transparent to-[#001a4d]/20 pointer-events-none" />
      <div className="absolute inset-0 bg-white/10 dark:bg-black/30 backdrop-blur-[0.5px] pointer-events-none" />
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
