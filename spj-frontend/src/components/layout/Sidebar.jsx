/**
 * Sidebar — ASIK
 * Desktop: rail 76 px (default tertutup) ↔ 232 px. Mobile: drawer overlay.
 * Ikon: Heroicons outline. Tooltip saat rail tertutup dirender lewat portal agar tidak terpotong.
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpenIcon as BookOpen,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  DocumentTextIcon as FileText,
  FolderOpenIcon as FolderOpen,
  HashtagIcon as Hash,
  Squares2X2Icon as LayoutDashboard,
  ArrowLeftOnRectangleIcon as LogOut,
  BuildingOffice2Icon as School,
  Cog6ToothIcon as Settings,
  PencilSquareIcon as StickyNote,
  UserGroupIcon as Users,
  WalletIcon as Wallet,
  XMarkIcon as X,
} from '@heroicons/react/24/outline'
import { useSidebar } from '../../contexts/SidebarContext'
import BrandedLoader from '../ui/BrandedLoader'
import storageHelper from '../../utils/storageHelper'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MENU_DASHBOARD = { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }

const MENU_GROUPS = [
  {
    label: 'DATA SEKOLAH',
    items: [
      { label: 'Data Sekolah', icon: School, path: '/dashboard/data-sekolah' },
      { label: 'Data Guru & Tendik', icon: Users, path: '/dashboard/data-guru' },
      { label: 'Data BKU', icon: Wallet, path: '/dashboard/bku' },
    ],
  },
  {
    label: 'DOKUMEN',
    items: [
      { label: 'Dokumen LPJ', icon: FileText, path: '/dashboard/dokumen-lpj' },
      { label: 'Dokumen Kelengkapan', icon: FolderOpen, path: '/dashboard/dokumen-kelengkapan' },
      { label: 'Nomor Surat', icon: Hash, path: '/dashboard/nomor-surat' },
    ],
  },
  {
    label: 'CATATAN',
    items: [{ label: 'Catatan', icon: StickyNote, path: '/dashboard/catatan' }],
  },
  {
    label: 'REFERENSI',
    items: [{ label: 'Kode Referensi', icon: BookOpen, path: '/dashboard/kode-referensi' }],
  },
]

const BOTTOM_ITEMS = [{ label: 'Pengaturan', icon: Settings, path: '/dashboard/pengaturan' }]

const ALL_GROUP_KEYS = Object.fromEntries(MENU_GROUPS.map((g) => [g.label, true]))

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Sidebar() {
  const navigate = useNavigate()
  const { isOpen, isMobile, close, toggle } = useSidebar()
  const isExpanded = isMobile || isOpen
  const asideRef = useRef(null)
  const [tip, setTip] = useState(null)

  const currentUser = storageHelper.get('auth_user', {})
  const userName = currentUser.name || 'Operator'
  const userInitials = userName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const [expanded, setExpanded] = useState(() => ({ ...ALL_GROUP_KEYS }))
  const toggleGroup = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))

  useEffect(() => {
    if (isMobile && isOpen) setExpanded({ ...ALL_GROUP_KEYS })
  }, [isMobile, isOpen])

  // Tooltip hanya untuk rail tertutup; hilang saat sidebar dibuka.
  useEffect(() => {
    if (isExpanded) setTip(null)
  }, [isExpanded])

  // Desktop: klik di luar atau Escape menutup sidebar. Mobile memakai overlay.
  useEffect(() => {
    if (!isExpanded) return
    const onPointerDown = (e) => {
      if (!isMobile && asideRef.current && !asideRef.current.contains(e.target)) close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isExpanded, isMobile, close])

  // Logout → loader ASIK (fullscreen) dulu, lalu fade-out, baru bersihkan & keluar.
  const [logoutStage, setLogoutStage] = useState(null) // null | 'show' | 'exit'
  const handleLogout = () => {
    if (logoutStage) return
    setLogoutStage('show')
    setTimeout(() => {
      setLogoutStage('exit')
      setTimeout(() => {
        localStorage.removeItem('spj_auth')
        localStorage.removeItem('spj_auth_user')
        localStorage.removeItem('spj_auth_token')
        navigate('/')
      }, 320)
    }, 850)
  }

  // Tutup drawer saat berpindah halaman (mobile saja)
  const handleNavClick = () => {
    if (isMobile) close()
  }

  const showTip = (e, label) => {
    if (isExpanded) return
    const r = e.currentTarget.getBoundingClientRect()
    setTip({ label, top: r.top + r.height / 2, left: r.right + 12 })
  }
  const hideTip = () => setTip(null)

  const tipProps = (label) => ({
    onMouseEnter: (e) => showTip(e, label),
    onMouseLeave: hideTip,
    onFocus: (e) => showTip(e, label),
    onBlur: hideTip,
  })

  const renderLink = (item, end = false) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={end}
        onClick={handleNavClick}
        aria-label={item.label}
        {...tipProps(item.label)}
        className={({ isActive }) =>
          `group relative flex min-h-[44px] items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl transition-colors duration-200 ${
            isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />}
            <Icon
              aria-hidden="true"
              className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            {isExpanded && (
              <span className={`truncate text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            )}
          </>
        )}
      </NavLink>
    )
  }

  const ToggleIcon = isMobile ? X : isExpanded ? ChevronLeft : ChevronRight
  const toggleLabel = isMobile ? 'Tutup menu' : isExpanded ? 'Ciutkan menu' : 'Perluas menu'

  return (
    <>
      {/* OVERLAY — mobile only */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={close} />
      )}

      <aside
        ref={asideRef}
        data-collapsed={!isExpanded}
        className={`dashboard-sidebar fixed left-4 top-4 bottom-4 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobile
            ? `w-[calc(100vw-2rem)] max-w-[260px] ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+1rem)] opacity-0 pointer-events-none'}`
            : isOpen
              ? 'w-[232px]'
              : 'w-[76px]'
        }`}
      >
        <div className="relative w-full h-full rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-[0_16px_48px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl pointer-events-none opacity-60" aria-hidden="true" />

          {/* LOGO */}
          <div className={`relative pt-6 pb-4 ${isExpanded ? 'px-5' : 'px-1.5'}`}>
            <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
              <div className="relative">
                <div className={`${isExpanded ? 'w-16' : 'w-10'} h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200/60 dark:border-slate-700 px-1.5`}>
                  <img src="/asik-logo.png" alt="ASIK" className="h-5 w-full object-contain" draggable="false" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900" aria-hidden="true" />
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-0.5">LPJ BOS/BOSP</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sistem Dokumen Sekolah</p>
                </div>
              )}
            </div>
          </div>

          {/* Satu-satunya kontrol buka/tutup desktop */}
          <div className={`relative px-3 ${isExpanded ? 'flex justify-end' : 'flex justify-center'}`}>
            <button
              type="button"
              onClick={isMobile ? close : toggle}
              aria-label={toggleLabel}
              title={toggleLabel}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
            >
              <ToggleIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>

          {/* MENU */}
          <nav aria-label="Navigasi dashboard" className="sidebar-nav flex-1 min-h-0 px-3 pt-3 pb-2 space-y-3 overflow-y-auto">
            {renderLink(MENU_DASHBOARD, true)}

            <div className={`relative mx-3 ${isExpanded ? '' : 'hidden'}`} aria-hidden="true">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>

            {MENU_GROUPS.map((group, groupIdx) => (
              <div key={group.label} className={groupIdx > 0 ? 'mt-1' : ''}>
                {isExpanded && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={expanded[group.label]}
                    className="w-full min-h-[36px] flex items-center justify-between px-3 mb-1 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">{group.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200"
                      style={{ transform: expanded[group.label] ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    />
                  </button>
                )}

                {(expanded[group.label] || !isExpanded) && (
                  <div className="space-y-1">{group.items.map((item) => renderLink(item))}</div>
                )}
              </div>
            ))}
          </nav>

          {/* BOTTOM — profil, Pengaturan, Keluar */}
          <div className={`sidebar-bottom pb-4 space-y-1 ${isExpanded ? 'px-3' : 'px-1.5'}`}>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3" aria-hidden="true" />

            <button
              type="button"
              onClick={() => { navigate('/dashboard/pengaturan'); handleNavClick() }}
              aria-label={`Profil ${userName}`}
              {...tipProps(userName)}
              className={`w-full min-h-[48px] flex items-center ${isExpanded ? 'gap-3 px-2.5' : 'justify-center'} rounded-xl text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors`}
            >
              <span className="w-9 h-9 rounded-xl shrink-0 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold" aria-hidden="true">
                {userInitials}
              </span>
              {isExpanded && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{userName}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.role || 'Operator sekolah'}</span>
                </span>
              )}
            </button>

            {BOTTOM_ITEMS.map((item) => renderLink(item))}

            <button
              type="button"
              onClick={() => { handleNavClick(); handleLogout() }}
              aria-label="Keluar"
              {...tipProps('Keluar')}
              className={`group w-full min-h-[44px] flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50/60 transition-colors duration-200`}
            >
              <LogOut aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
              {isExpanded && <span className="text-[13px] font-medium">Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Tooltip rail — portal ke body agar tidak terpotong overflow */}
      {tip && !isExpanded && createPortal(
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-xl"
          style={{ top: tip.top, left: tip.left }}
        >
          {tip.label}
        </div>,
        document.body
      )}

      {logoutStage && createPortal(
        <BrandedLoader
          variant="fullscreen"
          title="Tunggu sebentar..."
          subtitle="Keluar dari aplikasi"
          exiting={logoutStage === 'exit'}
        />,
        document.body
      )}
    </>
  )
}
