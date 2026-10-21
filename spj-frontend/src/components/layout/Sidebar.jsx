/**
 * Sidebar — Minimalis Premium Design 2026
 * Responsive: Overlay on mobile, push on desktop
 * Tanpa glassmorphism: permukaan solid putih + hairline border (revisi user 2026-10-21).
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MENU_DASHBOARD = { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', exact: true }

const MENU_GROUPS = [
  {
    label: 'DATA SEKOLAH',
    items: [
      { label: 'Data Sekolah', icon: 'school', path: '/dashboard/data-sekolah' },
      { label: 'Data Guru & Tendik', icon: 'groups', path: '/dashboard/data-guru' },
      { label: 'Data BKU', icon: 'upload_file', path: '/dashboard/bku' },
    ],
  },
  {
    label: 'DOKUMEN',
    items: [
      { label: 'Dokumen LPJ', icon: 'description', path: '/dashboard/dokumen-lpj' },
      { label: 'Dokumen Kelengkapan', icon: 'folder_open', path: '/dashboard/dokumen-kelengkapan' },
      { label: 'Nomor Surat', icon: 'pin', path: '/dashboard/nomor-surat' },
    ],
  },
  {
    label: 'CATATAN',
    items: [
      { label: 'Catatan', icon: 'edit_note', path: '/dashboard/catatan' },
    ],
  },
  {
    label: 'REFERENSI',
    items: [
      { label: 'Kode Referensi', icon: 'book_2', path: '/dashboard/kode-referensi' },
    ],
  },
]

const BOTTOM_ITEMS = [
  { label: 'Pengaturan', icon: 'settings', path: '/dashboard/pengaturan' },
]

// Kelas bersama setiap item navigasi — satu sumber untuk dashboard, grup, bawah.
const NAV_BASE = 'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150'
const navClass = (aktif) =>
  aktif
    ? `${NAV_BASE} bg-primary/[0.08] text-primary`
    : `${NAV_BASE} text-slate-500 hover:bg-slate-100 hover:text-slate-800`

const ACTIVE_BAR = 'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full'

const ICON_BASE = 'material-symbols-outlined text-[20px] flex-shrink-0 transition-colors duration-150'
const iconClass = (aktif) =>
  aktif ? `${ICON_BASE} text-primary` : `${ICON_BASE} text-slate-400 group-hover:text-slate-600`

const LABEL_BASE = 'text-[13px] truncate'

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Sidebar() {
  const navigate = useNavigate()
  const { isOpen, isMobile, close } = useSidebar()

  const handleLogout = () => {
    localStorage.removeItem('spj_auth')
    localStorage.removeItem('spj_auth_user')
    localStorage.removeItem('spj_auth_token')
    navigate('/')
  }

  // Close sidebar on navigation (mobile only)
  const handleNavClick = () => {
    if (isMobile) {
      close()
    }
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* OVERLAY — scrim gelap (mobile only)                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/25 z-40 transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR — permukaan solid putih, tanpa glassmorphism                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed left-0 top-0 h-screen z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="relative w-[260px] h-full bg-white border-r border-slate-200/80 shadow-[8px_0_24px_rgba(15,23,42,0.06)] flex flex-col overflow-hidden">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* LOGO SECTION                                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/25">
                <span className="material-symbols-outlined text-white text-[18px]">school</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-none mb-1">
                  LPJ BOS/BOSP
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Sistem Dokumen Sekolah
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MAIN NAVIGATION — Categorized Groups                            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <nav className="flex-1 px-3 pt-2 pb-2 space-y-5 overflow-y-auto">
            {/* Dashboard — At the Top */}
            <NavLink
              to={MENU_DASHBOARD.path}
              end={MENU_DASHBOARD.exact}
              onClick={handleNavClick}
              className={({ isActive }) => navClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className={ACTIVE_BAR} />}
                  <span
                    className={iconClass(isActive)}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {MENU_DASHBOARD.icon}
                  </span>
                  <span className={`${LABEL_BASE} ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {MENU_DASHBOARD.label}
                  </span>
                </>
              )}
            </NavLink>

            {/* Hairline Divider */}
            <div className="mx-5 h-px bg-slate-100" />

            {MENU_GROUPS.map((group, groupIdx) => (
              <div key={group.label} className={groupIdx > 0 ? 'mt-5' : ''}>
                {/* Group Header */}
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
                    {group.label}
                  </span>
                </div>

                {/* Group Items */}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={({ isActive }) => navClass(isActive)}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator — Left Bar */}
                          {isActive && <span className={ACTIVE_BAR} />}

                          {/* Icon */}
                          <span
                            className={iconClass(isActive)}
                            style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {item.icon}
                          </span>

                          {/* Label */}
                          <span className={`${LABEL_BASE} ${isActive ? 'font-semibold' : 'font-medium'}`}>
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* BOTTOM SECTION                                                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="px-3 pb-4 space-y-0.5">
            {/* Hairline Divider */}
            <div className="mx-5 h-px bg-slate-100 mb-3" />

            {/* Bottom Menu Items */}
            {BOTTOM_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) => navClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className={ACTIVE_BAR} />}
                    <span
                      className={iconClass(isActive)}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span className={`${LABEL_BASE} ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => { handleNavClick(); handleLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 group"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-red-600 transition-colors">
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
