import { useEmployees, useAuditLog } from '../../hooks/useEmployees'
import { Users, Building2, UserCheck, UserPlus, FilePlus, FileEdit, Trash2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (m < 1) return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  if (h < 24) return `há ${h} h`
  return `há ${d} d`
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, iconBg, isLoading }) {
  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-gray-200 p-5 h-24 animate-pulse shadow-sm" />
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-azul-escuro">{value}</p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Department bar chart ────────────────────────────────────────────────────

function DeptChart({ employees }) {
  const counts = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] ?? 0) + 1
    return acc
  }, {})
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] ?? 1

  return (
    <div className="space-y-2.5">
      {sorted.map(([dept, count]) => (
        <div key={dept} className="flex items-center gap-3 text-sm">
          <span className="text-gray-600 w-36 flex-shrink-0 truncate" title={dept}>{dept}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-apatita transition-all duration-700"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-gray-500 w-5 text-right flex-shrink-0 text-xs font-semibold">{count}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Status distribution ─────────────────────────────────────────────────────

function StatusPill({ label, count, color }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${color}`}>
      <span className="text-xl font-black">{count}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

// ─── Recent activity ─────────────────────────────────────────────────────────

const AUDIT_ICON = {
  created: { Icon: FilePlus, color: 'text-green-600 bg-green-50' },
  updated: { Icon: FileEdit, color: 'text-apatita bg-apatita/10' },
  deleted: { Icon: Trash2, color: 'text-vermelho bg-red-50' },
}
const AUDIT_LABEL = { created: 'Criado', updated: 'Atualizado', deleted: 'Removido' }

function ActivityFeed({ logs, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }
  if (!logs.length) {
    return <p className="text-sm text-gray-400 py-4 text-center">Nenhuma atividade registrada</p>
  }
  return (
    <div className="space-y-1">
      {logs.slice(0, 6).map((log) => {
        const cfg = AUDIT_ICON[log.action] ?? AUDIT_ICON.updated
        const { Icon } = cfg
        const name = log.new_data?.name || log.old_data?.name || '—'
        return (
          <div key={log.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-azul-escuro truncate">
                <span className="font-medium">{name}</span>
                <span className="text-gray-400 font-normal"> — {AUDIT_LABEL[log.action]}</span>
              </p>
              {log.changed_by_email && (
                <p className="text-xs text-gray-400 truncate">por {log.changed_by_email}</p>
              )}
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{formatRelative(log.created_at)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: employees = [], isLoading: empLoading } = useEmployees()
  const { data: logs = [], isLoading: logLoading } = useAuditLog()

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    hiring: employees.filter((e) => e.status === 'hiring').length,
    inactive: employees.filter((e) => e.status === 'inactive').length,
    departments: new Set(employees.map((e) => e.department)).size,
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-azul-escuro">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do organograma AmorSaúde 2026</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Total"            value={stats.total}       iconBg="bg-azul-escuro"  isLoading={empLoading} />
        <StatCard icon={UserCheck} label="Ativos"           value={stats.active}      iconBg="bg-apatita"      isLoading={empLoading} />
        <StatCard icon={UserPlus}  label="Em contratação"   value={stats.hiring}      iconBg="bg-yellow-400"   isLoading={empLoading} />
        <StatCard icon={Building2} label="Departamentos"    value={stats.departments} iconBg="bg-vermelho"     isLoading={empLoading} />
      </div>

      {/* Status distribution */}
      {!empLoading && (
        <div className="flex gap-3 flex-wrap">
          <StatusPill label="Ativos"           count={stats.active}   color="bg-apatita/10 text-apatita" />
          <StatusPill label="Em contratação"   count={stats.hiring}   color="bg-yellow-50 text-yellow-700" />
          <StatusPill label="Inativos"         count={stats.inactive} color="bg-gray-100 text-gray-600" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-azul-escuro text-sm">Colaboradores por área</h3>
            <Link to="/admin/employees" className="text-xs text-apatita hover:underline flex items-center gap-0.5">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {empLoading
            ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>
            : <DeptChart employees={employees} />
          }
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-azul-escuro text-sm">Atividade recente</h3>
            <Link to="/admin/audit" className="text-xs text-apatita hover:underline flex items-center gap-0.5">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ActivityFeed logs={logs} isLoading={logLoading} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold text-azul-escuro text-sm mb-3">Ações rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            to="/admin/employees/new"
            className="flex items-center gap-3 px-4 py-3 bg-apatita text-white rounded-xl text-sm font-semibold hover:bg-apatita/90 transition-colors shadow-sm shadow-apatita/20"
          >
            <UserPlus className="w-4 h-4" />
            Adicionar colaborador
          </Link>
          <Link
            to="/admin/employees"
            className="flex items-center gap-3 px-4 py-3 bg-azul-escuro/8 hover:bg-azul-escuro/12 rounded-xl text-sm font-medium text-azul-escuro transition-colors"
          >
            <Users className="w-4 h-4" />
            Gerenciar colaboradores
          </Link>
          <Link
            to="/admin/audit"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            <FilePlus className="w-4 h-4 text-gray-400" />
            Ver log de auditoria
          </Link>
        </div>
      </div>
    </div>
  )
}
