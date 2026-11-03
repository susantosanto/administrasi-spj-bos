/**
 * Topbar — Premium Responsive Design 2026
 * With user profile dropdown menu
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'
import storageHelper from '../../utils/storageHelper'
import { useLicenseStatus, licenseService } from '../../services/licenseService'
import ThemeToggle from '../ui/ThemeToggle'
import BrandedLoader from '../ui/BrandedLoader'

export default function Topbar({ title, subtitle }) {
  const { isOpen, toggle } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const user = storageHelper.get('auth_user', { name: 'Operator', email: 'operator@sekolah.id' })

  // Status lisensi untuk zona banner (ganti judul bila ada lisensi)
  const lic = useLicenseStatus()
  const hasCode = !!storageHelper.get('license_code')
  const daysLeft = lic.validUntil ? Math.max(0, Math.ceil((new Date(lic.validUntil) - new Date()) / 86400000)) : null
  const trialDate = lic.validUntil ? new Date(lic.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  let licMain = null
  let licSub = null
  let licTone = 'warn'
  if (hasCode && lic.status) {
    if (lic.status === 'TRIAL') {
      licMain = daysLeft !== null ? `Masa Percobaan : ${daysLeft} Hari` : 'Masa Percobaan'
      licSub = trialDate ? `sampai ${trialDate}` : 'aktifkan lisensi agar tetap menulis'
    } else if (lic.status === 'GRACE') {
      licMain = 'Masa Tenggang'
      licSub = 'segera hubungi admin pusat'
    } else if (lic.status === 'READ_ONLY') {
      licMain = 'Mode Baca'
      licSub = 'edit dikunci — perbarui lisensi'
      licTone = 'dang'
    } else if (lic.status === 'SUSPENDED') {
      licMain = 'Ditangguhkan'
      licSub = 'hanya membaca — hubungi admin'
      licTone = 'dang'
    } else if (lic.status === 'EXPIRED') {
      licMain = 'Kadaluarsa'
      licSub = 'hanya membaca — perpanjang lisensi'
      licTone = 'dang'
    }
  }
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [showLicInfo, setShowLicInfo] = useState(false)

  // Tutup popup lisensi saat Escape
  useEffect(() => {
    if (!showLicInfo) return
    const onKey = (e) => { if (e.key === 'Escape') setShowLicInfo(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showLicInfo])

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

  // Tutup dropdown saat Escape atau pindah halaman
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowDropdown(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { setShowDropdown(false) }, [location.pathname])

  // Logout → loader ASIK (fullscreen) dulu, lalu fade-out, baru bersihkan & keluar.
  // Isi bersihkan + navigate PERSIS versi lama — hanya diberi urutan loader.
  const [logoutStage, setLogoutStage] = useState(null) // null | 'show' | 'exit'
  const handleLogout = () => {
    if (logoutStage) return
    setShowDropdown(false)
    setLogoutStage('show')
    setTimeout(() => {
      setLogoutStage('exit')
      setTimeout(() => {
        storageHelper.remove('auth')
        storageHelper.remove('auth_user')
        storageHelper.remove('auth_token')
        navigate('/')
      }, 320)
    }, 850)
  }

  const menuItems = [
    { label: 'Profil Saya', icon: 'person', action: () => { setShowDropdown(false); navigate('/dashboard/pengaturan') } },
    { label: 'Ubah Password', icon: 'lock', action: () => { setShowDropdown(false); navigate('/dashboard/pengaturan') } },
    { label: 'Pengaturan', icon: 'settings', action: () => { setShowDropdown(false); navigate('/dashboard/pengaturan') } },
  ]

  return (
    <header className="sticky top-3 z-40 mx-3 sm:mx-6 mt-3 rounded-2xl bg-white/70 dark:bg-slate-900/75 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 shadow-lg shadow-slate-900/5 flex justify-between items-center px-3 sm:px-4 py-2.5">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Button */}
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          title={isOpen ? 'Tutup Sidebar' : 'Buka Menu'}
          aria-label={isOpen ? 'Tutup sidebar' : 'Buka menu'}
          aria-expanded={isOpen}
        >
          <span
            className="material-symbols-outlined text-xl transition-transform duration-300"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            chevron_right
          </span>
        </button>
        {licMain ? (
          <>
            <button
              type="button"
              onClick={() => setShowLicInfo(true)}
              title="Lihat info lisensi"
              aria-haspopup="dialog"
              className={`flex items-center gap-1.5 shrink-0 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-bold transition-colors border ${licTone === 'dang' ? 'bg-red-500/10 text-red-700 dark:bg-red-900/30 dark:text-red-200 border-red-500/25 dark:border-red-700/30 hover:bg-red-500/15' : 'bg-amber-500/10 text-amber-800 dark:bg-amber-900/25 dark:text-amber-200 border-amber-500/25 dark:border-amber-700/30 hover:bg-amber-500/15'}`}
            >
              <span className={`w-2 h-2 rounded-full relative shrink-0 ${licTone === 'dang' ? 'bg-red-500' : 'bg-amber-500'}`} aria-hidden="true">
                <span className="lic-ring absolute inset-0 rounded-full bg-inherit" />
              </span>
              {licMain}
            </button>
            {showLicInfo && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm"
                onClick={() => setShowLicInfo(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Info masa percobaan"
              >
                <div
                  className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-2xl p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Kartu trial ala referensi: ikon | divider | label + pil durasi */}
                  <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-[22px] border border-[#c9ddff] dark:border-slate-700/40 bg-[linear-gradient(125deg,#ffffff,#f2f7ff_65%,#e2efff)] dark:bg-[linear-gradient(125deg,#1e293b,#0f172a_65%,#1e3a5f)]">
                    <div className="absolute w-40 h-40 rounded-full bg-[#70a9ff]/10 dark:bg-white/5 -right-12 -top-20 pointer-events-none" aria-hidden="true" />
                    <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-[#2676dc] dark:text-blue-300 bg-[linear-gradient(145deg,#d8eaff,#edf5ff)] dark:bg-slate-700/70 border dark:border-slate-600/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="3" />
                        <path d="M16 3v4M8 3v4" />
                        <path d="M3 10h18" />
                        <path d="M8 14h2M14 14h2" />
                        <path d="M8 17h2M14 17h2" />
                      </svg>
                    </div>
                    <div className="w-0.5 self-stretch bg-[#c7dcff] dark:bg-slate-800/60 shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0 relative">
                      <p className="text-sm font-semibold text-[#294776] dark:text-slate-200 mb-1.5">
                        {lic.status === 'TRIAL' ? 'Masa Percobaan :' : `${licMain} :`}
                      </p>
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-[#9fc4ff] dark:border-white/15 bg-[linear-gradient(120deg,#edf5ff,#dceaff)] dark:bg-white/5 text-[#123c82] dark:text-blue-200 text-2xl font-extrabold tracking-tight">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        <span>{daysLeft !== null ? `${daysLeft} Hari` : licMain}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLicInfo(false)}
                      aria-label="Tutup"
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                  <div className="rounded-xl mt-3 px-3.5 py-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1.5">
                    {trialDate && <p><b className="text-slate-800 dark:text-slate-100">Berlaku sampai:</b> {trialDate}</p>}
                    <p>Selama masa percobaan semua fitur tulis aktif. Setelah berakhir, aplikasi jadi mode baca — hubungi admin pusat untuk perpanjangan.</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => { licenseService.refresh(); }}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
                    >
                      Periksa ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowLicInfo(false); navigate('/dashboard/pengaturan?tab=lisensi'); }}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 transition-all"
                    >
                      Kelola lisensi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : title ? (
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{title}</h2>
            {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
          </div>
        ) : (
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">LPJ BOS/BOSP</span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar - Hidden on mobile */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm w-48 lg:w-64 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400"
            placeholder="Cari..."
            type="search"
            aria-label="Cari di aplikasi"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle variant="icon" />

        {/* ═══ User Profile Dropdown ═══ */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-2xl transition-all duration-200 ${
              showDropdown
                ? 'bg-primary/10 shadow-sm'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            aria-label="Menu profil pengguna"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email || 'operator@sekolah.id'}</p>
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
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-700 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email || 'operator@sekolah.id'}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl text-slate-400">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 dark:bg-slate-700 mx-4" />

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

      {/* Logout overlay — loader ASIK (satu bahasa visual dengan boot splash) */}
      {logoutStage && (
        <BrandedLoader
          variant="fullscreen"
          title="Tunggu sebentar..."
          subtitle="Keluar dari aplikasi"
          exiting={logoutStage === 'exit'}
        />
      )}
      <style>{`
        .lic-ring { animation: lic-ring 1.6s ease-out infinite; }
        @keyframes lic-ring { 0% { transform: scale(1); opacity: 0.55; } 100% { transform: scale(2.4); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .lic-ring { animation: none; } }
      `}</style>
    </header>
  )
}
