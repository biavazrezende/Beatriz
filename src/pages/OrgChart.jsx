import { useState, useMemo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { useEmployees } from '../hooks/useEmployees'
import { OrgNode } from '../components/OrgNode'
import { SearchBar } from '../components/SearchBar'
import {
  X, Mail, Building2, Briefcase, Users,
  Menu, Filter, Download, Loader2,
} from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────────────────────────────

function buildTree(employees, managerId = null) {
  return employees
    .filter((e) => e.manager_id === managerId)
    .map((e) => ({ ...e, children: buildTree(employees, e.id) }))
}

/** Returns a Set of employee IDs that directly match the query/department. */
function getDirectMatchIds(employees, search, department) {
  const q = search.toLowerCase()
  return new Set(
    employees
      .filter((e) => {
        const matchesSearch =
          !search ||
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
        const matchesDept = department === 'Todos' || e.department === department
        return matchesSearch && matchesDept
      })
      .map((e) => e.id),
  )
}

/** Walks up the manager chain to collect ancestor IDs for every matched ID. */
function getAncestorIds(employeeMap, matchedIds) {
  const ancestors = new Set()
  for (const id of matchedIds) {
    let emp = employeeMap.get(id)
    while (emp?.manager_id) {
      if (ancestors.has(emp.manager_id)) break
      ancestors.add(emp.manager_id)
      emp = employeeMap.get(emp.manager_id)
    }
  }
  return ancestors
}

// ─── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm px-4 py-3 min-w-[140px] flex flex-col items-center gap-2 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="w-20 h-3 rounded bg-gray-200" />
      <div className="w-16 h-2 rounded bg-gray-100" />
    </div>
  )
}

// ─── Employee detail modal ─────────────────────────────────────────────────────

function EmployeeModal({ employee, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          {employee.photo_url ? (
            <img
              src={employee.photo_url}
              alt={employee.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-apatita/20"
            />
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
            {employee.status === 'inactive' && (
              <span className="inline-block mt-1 text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-300 px-2 py-0.5 rounded-full">
                Inativo
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

// ─── Main page ──────────────────────────────────────────────────────────────────────

export default function OrgChart() {
  const { data: employees, isLoading, error } = useEmployees()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('Todos')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const chartRef = useRef(null)

  async function handleExportPng() {
    if (!chartRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#F9FAFB',
        pixelRatio: 2,
        // exclude UI controls from the capture
        filter: (node) => !node.classList?.contains('no-export'),
      })
      const link = document.createElement('a')
      link.download = `organograma-amorsaude-${new Date().getFullYear()}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error('Erro ao exportar PNG', e)
    } finally {
      setExporting(false)
    }
  }

  const isFiltering = !!search || departmentFilter !== 'Todos'

  // Map for O(1) lookup
  const employeeMap = useMemo(
    () => new Map((employees ?? []).map((e) => [e.id, e])),
    [employees],
  )

  // Count employees per department (excluding "Todos")
  const departmentCounts = useMemo(() => {
    if (!employees) return {}
    return employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1
      return acc
    }, {})
  }, [employees])

  // Sorted department list
  const departments = useMemo(() => {
    if (!employees) return []
    const depts = [...new Set(employees.map((e) => e.department))].sort()
    return ['Todos', ...depts]
  }, [employees])

  // IDs that directly satisfy the current filter
  const directMatchIds = useMemo(
    () => (employees ? getDirectMatchIds(employees, search, departmentFilter) : new Set()),
    [employees, search, departmentFilter],
  )

  // Employees visible in tree = direct matches + their full ancestor chain
  const visibleEmployees = useMemo(() => {
    if (!employees) return []
    if (!isFiltering) return employees
    const ancestorIds = getAncestorIds(employeeMap, directMatchIds)
    const idsToShow = new Set([...directMatchIds, ...ancestorIds])
    return employees.filter((e) => idsToShow.has(e.id))
  }, [employees, employeeMap, directMatchIds, isFiltering])

  const tree = useMemo(() => buildTree(visibleEmployees), [visibleEmployees])

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setDepartmentFilter('Todos')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-azul-escuro text-white shadow-md sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              className="lg:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <img
              src="https://5338832.fs1.hubspotusercontent-na1.net/hubfs/5338832/LOGO_AS_VERTICAL.png"
              alt="AmorSaúde"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* Inline search on desktop */}
          <div className="hidden lg:block flex-1 max-w-xs">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar colaborador ou cargo..."
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExportPng}
              disabled={exporting || isLoading}
              className="no-export flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors disabled:opacity-50"
              title="Exportar como PNG"
            >
              {exporting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />
              }
              <span className="hidden sm:inline">{exporting ? 'Exportando…' : 'Exportar PNG'}</span>
            </button>
            <Link to="/login" className="text-xs text-apatita hover:text-white transition-colors font-medium">
              Admin →
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`
            bg-white border-r border-gray-200 flex flex-col gap-4 p-4 w-64 flex-shrink-0
            transition-transform duration-300 z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed top-14 bottom-0 lg:relative lg:top-auto lg:bottom-auto lg:translate-x-0
          `}
        >
          {/* Mobile search */}
          <div className="lg:hidden">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar colaborador ou cargo..."
            />
          </div>

          {/* Department filter */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3" /> Área
              </p>
              {departmentFilter !== 'Todos' && (
                <button
                  onClick={() => setDepartmentFilter('Todos')}
                  className="text-xs text-apatita hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {departments.map((dept) => {
                const count = dept === 'Todos'
                  ? (employees?.length ?? 0)
                  : (departmentCounts[dept] ?? 0)
                return (
                  <button
                    key={dept}
                    onClick={() => {
                      setDepartmentFilter(dept)
                      setSidebarOpen(false)
                    }}
                    className={`
                      flex items-center justify-between text-sm text-left px-3 py-2 rounded-lg transition-colors
                      ${departmentFilter === dept
                        ? 'bg-apatita text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <span className="truncate">{dept}</span>
                    <span
                      className={`ml-2 text-xs font-semibold rounded-full px-1.5 py-0.5 flex-shrink-0
                        ${departmentFilter === dept ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}
                      `}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status summary */}
          <div className="border-t border-gray-100 pt-3 space-y-1">
            {isFiltering ? (
              <>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-apatita">{directMatchIds.size}</span> resultado{directMatchIds.size !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-vermelho hover:underline"
                >
                  Limpar filtros
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-400">
                {employees?.length ?? 0} colaboradores
              </p>
            )}
          </div>
        </aside>

        {/* ── Main chart area ────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex gap-6 justify-center flex-wrap p-8">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
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
              <p className="font-medium text-gray-500">Nenhum colaborador encontrado</p>
              {isFiltering && (
                <button
                  onClick={handleClearFilters}
                  className="mt-3 text-sm text-apatita hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && tree.length > 0 && (
            <div className="p-6 pb-12">
              {/* Filter banner */}
              {isFiltering && directMatchIds.size > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm text-apatita bg-apatita/5 border border-apatita/20 rounded-lg px-4 py-2">
                  <span className="font-semibold">{directMatchIds.size}</span>
                  <span>resultado{directMatchIds.size !== 1 ? 's' : ''} encontrado{directMatchIds.size !== 1 ? 's' : ''}</span>
                  {search && (
                    <span className="text-gray-500">para "<strong className="text-azul-escuro">{search}</strong>"</span>
                  )}
                  {departmentFilter !== 'Todos' && (
                    <span className="text-gray-500">em <strong className="text-azul-escuro">{departmentFilter}</strong></span>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="ml-auto flex items-center gap-1 text-xs text-vermelho hover:underline"
                  >
                    <X className="w-3 h-3" /> Limpar
                  </button>
                </div>
              )}

              <div ref={chartRef} className="flex justify-start min-w-max">
                <div className="flex gap-10 items-start">
                  {tree.map((root) => (
                    <OrgNode
                      key={root.id}
                      node={root}
                      level={0}
                      onSelect={setSelectedEmployee}
                      matchedIds={directMatchIds}
                      searchActive={isFiltering}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Employee detail modal */}
      {selectedEmployee && (
        <EmployeeModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}
    </div>
  )
}
