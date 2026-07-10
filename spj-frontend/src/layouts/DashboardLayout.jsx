import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext'
import { seedMockData } from '../data/mockData'

function DashboardContent() {
  const { isOpen } = useSidebar()

  useEffect(() => {
    seedMockData()
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Sidebar />
      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'ml-[260px]' : 'ml-0'
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
