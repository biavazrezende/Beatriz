import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, Users, ClipboardList, LogOut, ExternalLink, Menu, X, GitBranch } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/employees', label: 'Colaboradores', icon: Users },
  { to: '/admin/org-tree', label: 'Hierarquia', icon: GitBranch },
  { to: '/admin/audit', label: 'Auditoria', icon: ClipboardList },
]

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/employees': 'Colaboradores',
  '/admin/employees/new': 'Novo colaborador',
  '/admin/org-tree': 'Hierarquia',
  '/admin/audit': 'Auditoria',
}

function UserAvatar({ email }) {
  const initials = (email ?? '')
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="w-8 h-8 rounded-full bg-apatita/20 border border-apatita/40 flex items-center justify-center text-xs font-bold text-apatita flex-shrink-0">
      {initials || '?'}
    </div>
  )
}

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.includes('/edit') ? 'Editar colaborador' : 'Admin')

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`
        bg-azul-escuro text-white w-60 flex-shrink-0 flex flex-col
        fixed inset-y-0 left-0 z-40 transition-transform duration-300
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="https://5338832.fs1.hubspotusercontent-na1.net/hubfs/5338832/LOGO_AS_VERTICAL.png"
              alt="AmorSaúde"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
            <p className="text-xs text-apatita/70 leading-tight">Painel Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-apatita text-white shadow-sm shadow-apatita/30'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <a
            href="/sistema-organograma/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver organograma
          </a>

          {/* User info */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
            <UserAvatar email={user?.email} />
            <span className="text-xs text-white/50 truncate flex-1">{user?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-vermelho hover:bg-red-900/20 transition-colors"
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

      {/* ── Main content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-gray-500 hover:text-azul-escuro hover:bg-gray-100 rounded-xl transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-azul-escuro text-sm">{pageTitle}</span>
          <div className="ml-auto">
            <UserAvatar email={user?.email} />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
