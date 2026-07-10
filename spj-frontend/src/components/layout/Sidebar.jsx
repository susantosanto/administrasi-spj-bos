import { NavLink, useNavigate } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'

const menuItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', exact: true },
  { label: 'Data Sekolah', icon: 'school', path: '/dashboard/data-sekolah' },
  { label: 'Data Guru', icon: 'groups', path: '/dashboard/data-guru' },
  { label: 'Upload BKU', icon: 'upload_file', path: '/dashboard/bku' },
  { label: 'Dokumen LPJ', icon: 'description', path: '/dashboard/dokumen-lpj' },
  { label: 'Dokumen Kelengkapan', icon: 'folder_open', path: '/dashboard/dokumen-kelengkapan' },
  { label: 'Pengaturan', icon: 'settings', path: '/dashboard/pengaturan' },
]

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
      {/* Overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={close}
        />
      )}

      {/* ══ SUPER PREMIUM SIDEBAR NAVIGATION ══ */}
      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0'
        }`}
      >
        {/* Premium Glass Container */}
        <div className="w-64 h-full bg-white/80 backdrop-blur-2xl border-r border-white/20 shadow-2xl flex flex-col p-md gap-sm overflow-hidden">
          {/* ── Premium Decorative Gradient ── */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-primary-fixed/10 rounded-full blur-3xl pointer-events-none" />

          {/* ── Logo / Brand ── */}
          <div className="relative flex items-center gap-md px-sm mb-lg mt-md">
            <div className="w-11 h-11 rounded-xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-headline-sm text-headline-sm font-bold text-gray-900 truncate">LPJ BOS/BOSP</h1>
              <p className="font-label-xs text-label-xs text-gray-400">Cetak Dokumen LPJ</p>
            </div>
          </div>

          {/* ── Navigation ── */}
          <nav className="relative flex-1 flex flex-col gap-1 overflow-y-auto py-sm">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={close}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-md py-3 rounded-xl font-label-md text-label-md transition-all duration-200 overflow-hidden group ${
                    isActive
                      ? 'bg-primary-fixed/40 text-primary font-semibold shadow-sm border border-primary-fixed'
                      : 'text-gray-500 hover:bg-gray-50/80 hover:text-gray-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-sm shadow-primary/30" />
                    )}
                    {/* Icon with premium fill */}
                    <span
                      className={`material-symbols-outlined text-lg flex-shrink-0 ${
                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                      }`}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    {/* Label */}
                    <span className="truncate">{item.label}</span>
                    {/* Active shine */}
                    {isActive && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ══ SUPER PREMIUM LOGOUT BUTTON ══ */}
          <div className="relative px-sm pb-sm">
            <div className="border-t border-gray-100 pt-sm mb-sm">
              <p className="px-sm text-[10px] font-medium text-gray-300 uppercase tracking-[0.15em]">Sesi</p>
            </div>
            <button
              onClick={handleLogout}
              className="relative w-full flex items-center gap-3 px-md py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden group/logout text-gray-400 hover:text-red-600 hover:bg-red-50/80 active:scale-[0.98]"
            >
              {/* Premium glow on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover/logout:opacity-100 transition-opacity duration-300" />
              {/* Icon */}
              <span className="material-symbols-outlined text-lg relative z-10 group-hover/logout:scale-110 transition-transform duration-300">
                logout
              </span>
              <span className="relative z-10 font-label-md">Keluar</span>
              {/* Decorative right arrow on hover */}
              <span className="material-symbols-outlined text-lg absolute right-md opacity-0 -translate-x-2 group-hover/logout:opacity-100 group-hover/logout:translate-x-0 transition-all duration-300">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
