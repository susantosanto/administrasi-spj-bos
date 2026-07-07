import storageHelper from '../../utils/storageHelper'

export default function Topbar({ title, subtitle }) {
  const user = storageHelper.get('auth_user', { name: 'Ahmad Operator' })

  return (
    <header className="sticky top-0 z-40 bg-surface flex justify-between items-center px-lg py-md w-full border-b border-outline-variant">
      <div className="flex items-center gap-md">
        <h2 className="font-headline-md text-headline-md font-extrabold text-primary">{title}</h2>
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
