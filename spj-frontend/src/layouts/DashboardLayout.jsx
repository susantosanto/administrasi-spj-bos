import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { seedMockData } from '../data/mockData'

export default function DashboardLayout() {
  useEffect(() => {
    seedMockData()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
