/**
 * Sidebar — Ultra Premium Glass Morphism Design 2026
 * Backdrop blur + Frosted glass + Elegant animations
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MENU_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', exact: true },
  { label: 'Data Sekolah', icon: 'school', path: '/dashboard/data-sekolah' },
  { label: 'Data Guru', icon: 'groups', path: '/dashboard/data-guru' },
  { label: 'Upload BKU', icon: 'upload_file', path: '/dashboard/bku' },
  { label: 'Dokumen LPJ', icon: 'description', path: '/dashboard/dokumen-lpj' },
  { label: 'Dokumen Kelengkapan', icon: 'folder_open', path: '/dashboard/dokumen-kelengkapan' },
]

const BOTTOM_ITEMS = [
  { label: 'Pengaturan', icon: 'settings', path: '/dashboard/pengaturan' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Sidebar() {
  const navigate = useNavigate()
  const { isOpen, close } = useSidebar()

  const handleLogout = () => {
    localStorage.removeItem('spj_auth')
    localStorage.removeItem('spj_auth_user')
    localStorage.removeItem('spj_auth_token')
    navigate('/')
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* OVERLAY — Glass blur backdrop                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 lg:hidden transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR — Glass Morphism Container                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed left-0 top-0 h-screen z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0'
        }`}
      >
        {/* Glass Container */}
        <div className="relative w-[260px] h-full bg-white/60 backdrop-blur-2xl border-r border-white/50 shadow-[8px_0_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">

          {/* ── Decorative Background Elements ── */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-40 -left-24 w-64 h-64 bg-gradient-to-tr from-slate-400/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* LOGO SECTION                                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="relative px-5 pt-6 pb-5">
            <div className="flex items-center gap-3">
              {/* Logo Icon */}
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined text-white text-xl">school</span>
                </div>
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
              </div>

              {/* Logo Text */}
              <div className="flex-1 min-w-0">
                <h1 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none mb-0.5">
                  LPJ BOS/BOSP
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Sistem Dokumen Sekolah
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MAIN NAVIGATION                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Indicator — Left Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}

                    {/* Icon */}
                    <span
                      className={`material-symbols-outlined text-[20px] flex-shrink-0 transition-all duration-200 ${
                        isActive
                          ? 'text-primary'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className={`text-[13px] truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* BOTTOM SECTION                                                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="px-3 pb-4 space-y-1">
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3" />

            {/* Bottom Menu Items */}
            {BOTTOM_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}
                    <span
                      className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                        isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span className={`text-[13px] truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50/60 transition-all duration-200 group"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-red-500 transition-colors">
                logout
              </span>
              <span className="text-[13px] font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
