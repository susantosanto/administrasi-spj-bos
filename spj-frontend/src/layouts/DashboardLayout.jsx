/**
 * Dashboard Layout — Responsive Design 2026
 * Mobile: overlay sidebar, Desktop: push sidebar
 */
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext'
import { seedMockData } from '../data/mockData'

function DashboardContent() {
  const { isOpen, isMobile } = useSidebar()

  useEffect(() => {
    seedMockData()
  }, [])

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        backgroundImage: "url('/gradasi-blue.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay agar konten tetap terbaca di atas gradasi tebal */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#02052a]/20 via-transparent to-[#001a4d]/20 pointer-events-none" />
      <div className="absolute inset-0 bg-white/8 dark:bg-black/20 backdrop-blur-[0.5px] pointer-events-none" />
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
