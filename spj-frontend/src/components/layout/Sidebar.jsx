import { NavLink, useNavigate } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'

const menuItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', exact: true },
  { label: 'Data Sekolah', icon: 'school', path: '/dashboard/data-sekolah' },
  { label: 'Data Guru', icon: 'groups', path: '/dashboard/data-guru' },
  { label: 'Upload BKU', icon: 'upload_file', path: '/dashboard/bku' },
  { label: 'Dokumen SPJ', icon: 'description', path: '/dashboard/dokumen-spj' },
  { label: 'Dokumen Wajib', icon: 'assignment_turned_in', path: '/dashboard/dokumen-wajib' },
  { label: 'Pengaturan', icon: 'settings', path: '/dashboard/pengaturan' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const user = storageHelper.get('auth_user', { name: 'Ahmad Operator' })

  const handleLogout = () => {
    localStorage.removeItem('spj_auth')
    localStorage.removeItem('spj_auth_user')
    localStorage.removeItem('spj_auth_token')
    navigate('/')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest flex flex-col p-md gap-sm shadow-lg z-50">
      {/* Logo */}
      <div className="flex items-center gap-md px-sm mb-lg">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">SPJ BOS/BOSP</h1>
          <p className="font-label-xs text-label-xs text-text-low">Cetak Dokumen SPJ</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-xs overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : 'text-on-surface-variant'}`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-md text-label-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="pt-md border-t border-outline-variant">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-danger hover:bg-error-container/20 active:scale-95"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Keluar</span>
        </button>
      </div>
    </aside>
  )
}
