import { useEmployees } from '../../hooks/useEmployees'
import { Users, Building2, UserCheck, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-azul-escuro">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: employees = [], isLoading } = useEmployees()

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    hiring: employees.filter((e) => e.status === 'hiring').length,
    departments: new Set(employees.map((e) => e.department)).size,
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-azul-escuro">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do organograma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total de colaboradores" value={stats.total} color="bg-azul-escuro" />
        <StatCard icon={UserCheck} label="Ativos" value={stats.active} color="bg-apatita" />
        <StatCard icon={UserPlus} label="Em contratação" value={stats.hiring} color="bg-yellow-400" />
        <StatCard icon={Building2} label="Departamentos" value={stats.departments} color="bg-vermelho" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-azul-escuro mb-3">Por departamento</h3>
          <div className="space-y-2">
            {Object.entries(
              employees.reduce((acc, e) => {
                acc[e.department] = (acc[e.department] || 0) + 1
                return acc
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{dept}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-apatita/60"
                      style={{ width: `${Math.max(20, (count / stats.total) * 120)}px` }}
                    />
                    <span className="text-gray-500 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-azul-escuro mb-3">Ações rápidas</h3>
          <div className="space-y-2">
            <Link
              to="/admin/employees/new"
              className="flex items-center gap-3 px-4 py-3 bg-apatita/10 hover:bg-apatita/20 rounded-lg transition-colors text-sm font-medium text-azul-escuro"
            >
              <UserPlus className="w-4 h-4 text-apatita" />
              Adicionar colaborador
            </Link>
            <Link
              to="/admin/employees"
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-azul-escuro"
            >
              <Users className="w-4 h-4 text-gray-500" />
              Ver todos os colaboradores
            </Link>
            <Link
              to="/admin/audit"
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-azul-escuro"
            >
              <Building2 className="w-4 h-4 text-gray-500" />
              Ver log de auditoria
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
