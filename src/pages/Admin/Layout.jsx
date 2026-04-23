import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, Users, ClipboardList, LogOut, ExternalLink, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/employees', label: 'Colaboradores', icon: Users },
  { to: '/admin/audit', label: 'Auditoria', icon: ClipboardList },
]

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        bg-azul-escuro text-white w-60 flex-shrink-0 flex flex-col
        fixed inset-y-0 left-0 z-40 transition-transform duration-300
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-apatita flex items-center justify-center font-bold text-white">A</div>
            <div>
              <p className="font-bold text-sm leading-tight">AmorSaúde</p>
              <p className="text-xs text-apatita/80 leading-tight">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-apatita text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver organograma
          </a>
          <div className="px-3 py-2 text-xs text-white/40 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-vermelho hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-20">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-azul-escuro text-sm">AmorSaúde Admin</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
