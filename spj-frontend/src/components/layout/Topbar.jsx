/**
 * Topbar — Premium Responsive Design 2026
 * With user profile dropdown menu
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'
import storageHelper from '../../utils/storageHelper'

export default function Topbar({ title, subtitle }) {
  const { isOpen, toggle } = useSidebar()
  const navigate = useNavigate()
  const user = storageHelper.get('auth_user', { name: 'Operator', email: 'operator@sekolah.id' })
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [showDropdown])

  const handleLogout = () => {
    localStorage.removeItem('spj_auth')
    localStorage.removeItem('spj_auth_user')
    localStorage.removeItem('spj_auth_token')
    navigate('/')
  }

  const menuItems = [
    { label: 'Profil Saya', icon: 'person', action: () => { setShowDropdown(false); navigate('/dashboard/pengaturan') } },
    { label: 'Ubah Password', icon: 'lock', action: () => { setShowDropdown(false); navigate('/dashboard/pengaturan') } },
    { label: 'Pengaturan', icon: 'settings', action: () => { setShowDropdown(false); navigate('/dashboard/pengaturan') } },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 w-full border-b border-slate-200/60">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Button */}
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          title={isOpen ? 'Tutup Sidebar' : 'Buka Menu'}
        >
          <span
            className="material-symbols-outlined text-xl transition-transform duration-300"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            chevron_right
          </span>
        </button>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h2>
          {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar - Hidden on mobile */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm w-48 lg:w-64 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400"
            placeholder="Cari..."
            type="text"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 sm:p-2.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-all">
          <span className="material-symbols-outlined text-lg sm:text-xl">notifications</span>
        </button>

        {/* Help - Hidden on mobile */}
        <button className="hidden sm:block p-2.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-all">
          <span className="material-symbols-outlined text-xl">help_outline</span>
        </button>

        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1" />

        {/* ═══ User Profile Dropdown ═══ */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-2xl transition-all duration-200 ${
              showDropdown
                ? 'bg-primary/10 shadow-sm'
                : 'hover:bg-slate-100'
            }`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500">{user.email || 'operator@sekolah.id'}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-base sm:text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <span className={`material-symbols-outlined text-slate-400 text-lg transition-transform duration-200 hidden sm:block ${showDropdown ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {/* ═══ Dropdown Menu ═══ */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email || 'operator@sekolah.id'}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl text-slate-400">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mx-4" />

              {/* Logout */}
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span className="font-medium">Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
