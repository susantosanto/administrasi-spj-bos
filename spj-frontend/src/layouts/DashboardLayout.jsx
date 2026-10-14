/**
 * Dashboard Layout — Responsive Design 2026
 * Mobile: overlay sidebar, Desktop: push sidebar
 * Theme: Light/Dark via ThemeContext (html.dark class)
 */
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext'
import { seedMockData } from '../data/mockData'
import storageHelper from '../utils/storageHelper'

function DashboardContent() {
  const { isOpen, isMobile } = useSidebar()

  useEffect(() => {
    storageHelper.ensureSchemaVersion()
    seedMockData()
  }, [])

  return (
    <div className="flex min-h-screen relative bg-[#f4f7fb]">
      {/* Overlay tipis agar konten tetap terbaca */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#dbeafe]/30 pointer-events-none" />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] pointer-events-none" />
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
