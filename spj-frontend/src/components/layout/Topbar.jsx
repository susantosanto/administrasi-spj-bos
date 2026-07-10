import { useSidebar } from '../../contexts/SidebarContext'
import storageHelper from '../../utils/storageHelper'

export default function Topbar({ title, subtitle }) {
  const { isOpen, toggle } = useSidebar()
  const user = storageHelper.get('auth_user', { name: 'Ahmad Operator' })

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-lg py-md w-full border-b border-gray-200/60">
      <div className="flex items-center gap-md">
        {/* ══ SUPER PREMIUM SIDEBAR TOGGLE BUTTON ══ */}
        <button
          onClick={toggle}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden group ${
            isOpen
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
          }`}
          title={isOpen ? 'Tutup Sidebar' : 'Buka Menu Navigasi'}
        >
          {/* Shimmer */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="material-symbols-outlined text-xl relative z-10">
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>
        <h2 className="font-headline-md text-headline-md font-extrabold text-gray-900">{title}</h2>
      </div>
      <div className="flex items-center gap-xl">
        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-sm w-72 focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Cari transaksi atau dokumen..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-md">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:opacity-80">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:opacity-80">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <div className="h-8 w-[1px] bg-outline-variant mx-sm"></div>
          <div className="flex items-center gap-sm">
            <div className="text-right hidden sm:block">
              <p className="font-label-md text-label-md text-text-high">{user.name}</p>
              <p className="font-label-xs text-label-xs text-text-low">SDN 01 Nusantara</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary-fixed-dim bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
