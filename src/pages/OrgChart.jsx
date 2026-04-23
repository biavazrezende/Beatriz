import { useState, useMemo } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import { OrgNode } from '../components/OrgNode'
import { SearchBar } from '../components/SearchBar'
import { X, Mail, Building2, Briefcase, Users } from 'lucide-react'

function buildTree(employees, managerId = null) {
  return employees
    .filter((e) => e.manager_id === managerId)
    .map((e) => ({ ...e, children: buildTree(employees, e.id) }))
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm px-4 py-3 min-w-[140px] flex flex-col items-center gap-2 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="w-20 h-3 rounded bg-gray-200" />
      <div className="w-16 h-2 rounded bg-gray-100" />
    </div>
  )
}

function EmployeeCard({ employee, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          {employee.photo_url ? (
            <img src={employee.photo_url} alt={employee.name} className="w-20 h-20 rounded-full object-cover border-4 border-apatita/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-apatita/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-apatita" />
            </div>
          )}

          <div>
            <h2 className="font-bold text-azul-escuro text-lg leading-tight">{employee.name}</h2>
            {employee.status === 'hiring' && (
              <span className="inline-block mt-1 text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5 rounded-full">
                Em contratação
              </span>
            )}
          </div>

          <div className="w-full space-y-2 text-sm text-left">
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-apatita flex-shrink-0" />
              <span className="text-gray-700">{employee.role}</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
              <Building2 className="w-4 h-4 text-apatita flex-shrink-0" />
              <span className="text-gray-700">{employee.department}</span>
            </div>
            {employee.email && (
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-apatita/10 transition-colors"
              >
                <Mail className="w-4 h-4 text-apatita flex-shrink-0" />
                <span className="text-apatita truncate">{employee.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrgChart() {
  const { data: employees, isLoading, error } = useEmployees()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('Todos')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const departments = useMemo(() => {
    if (!employees) return []
    return ['Todos', ...new Set(employees.map((e) => e.department))]
  }, [employees])

  const filteredEmployees = useMemo(() => {
    if (!employees) return []
    return employees.filter((e) => {
      const matchesSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase())
      const matchesDept = departmentFilter === 'Todos' || e.department === departmentFilter
      return matchesSearch && matchesDept
    })
  }, [employees, search, departmentFilter])

  const tree = useMemo(() => buildTree(filteredEmployees), [filteredEmployees])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-azul-escuro text-white shadow-md sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-apatita flex items-center justify-center font-bold text-white text-sm">A</div>
            <div>
              <h1 className="font-bold text-base leading-tight">AmorSaúde</h1>
              <p className="text-xs text-apatita/80 leading-tight">Organograma 2026</p>
            </div>
          </div>
          <a href="/login" className="text-xs text-apatita hover:text-white transition-colors font-medium">
            Admin →
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          bg-white border-r border-gray-200 flex flex-col gap-4 p-4 w-64 flex-shrink-0
          transition-transform duration-300 z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed top-14 bottom-0 lg:relative lg:top-auto lg:bottom-auto lg:translate-x-0
        `}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome ou cargo..."
          />

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Departamento</p>
            <div className="flex flex-col gap-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`
                    text-sm text-left px-3 py-2 rounded-lg transition-colors
                    ${departmentFilter === dept
                      ? 'bg-apatita text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {filteredEmployees.length > 0 && (
            <p className="text-xs text-gray-400 mt-auto">
              {filteredEmployees.length} colaborador{filteredEmployees.length !== 1 ? 'es' : ''}
            </p>
          )}
        </aside>

        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden fixed bottom-4 left-4 z-40 bg-apatita text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Main chart area */}
        <main className="flex-1 overflow-auto p-6">
          {isLoading && (
            <div className="flex gap-6 justify-center flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-vermelho">
              <p className="font-semibold text-lg">Erro ao carregar dados</p>
              <p className="text-sm text-gray-500 mt-1">{error.message}</p>
            </div>
          )}

          {!isLoading && !error && tree.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum colaborador encontrado</p>
              {search && <p className="text-sm mt-1">Tente outro termo de busca</p>}
            </div>
          )}

          {!isLoading && !error && tree.length > 0 && (
            <div className="flex justify-start min-w-max pb-8">
              <div className="flex gap-10 items-start">
                {tree.map((root) => (
                  <OrgNode key={root.id} node={root} level={0} onSelect={setSelectedEmployee} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Employee detail card */}
      {selectedEmployee && (
        <EmployeeCard employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}
    </div>
  )
}
