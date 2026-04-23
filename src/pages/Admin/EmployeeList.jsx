import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEmployees, useDeleteEmployee, useEmployeeAuditLog } from '../../hooks/useEmployees'
import { SearchBar } from '../../components/SearchBar'
import { UserPlus, Pencil, Trash2, ChevronUp, ChevronDown, X, AlertTriangle, History, FilePlus, FileEdit, Clock } from 'lucide-react'

// ─── History modal ───────────────────────────────────────────────────────────

const AUDIT_ICON = {
  created: { Icon: FilePlus,  color: 'text-green-600 bg-green-50',  label: 'Criado' },
  updated: { Icon: FileEdit,  color: 'text-apatita bg-apatita/10',  label: 'Atualizado' },
  deleted: { Icon: Trash2,    color: 'text-vermelho bg-red-50',     label: 'Removido' },
}
const FIELD_PT = { name: 'Nome', role: 'Cargo', department: 'Departamento', manager_id: 'Gestor', email: 'E-mail', status: 'Status', photo_url: 'Foto' }
const STATUS_PT = { active: 'Ativo', inactive: 'Inativo', hiring: 'Em contratação' }

function formatDate(d) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

function HistoryModal({ employee, onClose }) {
  const { data: logs = [], isLoading } = useEmployeeAuditLog(employee.id)

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {employee.photo_url
              ? <img src={employee.photo_url} alt={employee.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
              : <div className="w-9 h-9 rounded-full bg-apatita/15 flex items-center justify-center text-sm font-bold text-apatita">{employee.name[0]}</div>
            }
            <div>
              <p className="font-bold text-azul-escuro text-sm">{employee.name}</p>
              <p className="text-xs text-gray-500">{employee.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma alteração registrada</p>
            </div>
          )}

          {!isLoading && logs.length > 0 && (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => {
                const cfg = AUDIT_ICON[log.action] ?? AUDIT_ICON.updated
                const { Icon } = cfg

                const changedFields = log.old_data && log.new_data
                  ? Object.keys(log.new_data).filter(
                      (k) => !['id', 'created_at', 'updated_at'].includes(k) &&
                             String(log.old_data[k] ?? '') !== String(log.new_data[k] ?? '')
                    )
                  : []

                return (
                  <div key={log.id} className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(log.created_at)}</span>
                        </div>
                        {log.changed_by_email && (
                          <p className="text-xs text-gray-400 mt-0.5">por {log.changed_by_email}</p>
                        )}
                        {changedFields.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {changedFields.map((k) => (
                              <div key={k} className="flex items-center gap-1.5 text-xs">
                                <span className="text-gray-500 w-20 flex-shrink-0">{FIELD_PT[k] ?? k}</span>
                                <span className="line-through text-gray-400 truncate max-w-[100px]">
                                  {k === 'status' ? (STATUS_PT[log.old_data[k]] ?? log.old_data[k]) : (log.old_data[k] ?? '—')}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-gray-700 font-medium truncate max-w-[100px]">
                                  {k === 'status' ? (STATUS_PT[log.new_data[k]] ?? log.new_data[k]) : (log.new_data[k] ?? '—')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{logs.length} registro{logs.length !== 1 ? 's' : ''}</span>
          <Link to="/admin/audit" onClick={onClose} className="text-xs text-apatita hover:underline">
            Ver log completo →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

const STATUS_LABEL = { active: 'Ativo', inactive: 'Inativo', hiring: 'Em contratação' }
const STATUS_COLOR = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  hiring: 'bg-yellow-100 text-yellow-700',
}

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativos' },
  { key: 'hiring', label: 'Em contratação' },
  { key: 'inactive', label: 'Inativos' },
]

function Avatar({ emp }) {
  if (emp.photo_url) {
    return <img src={emp.photo_url} alt={emp.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200" />
  }
  const initials = emp.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  return (
    <div className="w-8 h-8 rounded-full bg-apatita/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-apatita">
      {initials}
    </div>
  )
}

function SortButton({ field, sort, onSort }) {
  const active = sort.field === field
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-0.5 hover:text-azul-escuro transition-colors"
    >
      <span>{field === 'name' ? 'Nome' : field === 'department' ? 'Departamento' : 'Cargo'}</span>
      <span className="flex flex-col">
        <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && sort.dir === 'asc' ? 'text-apatita' : 'text-gray-300'}`} />
        <ChevronDown className={`w-2.5 h-2.5 ${active && sort.dir === 'desc' ? 'text-apatita' : 'text-gray-300'}`} />
      </span>
    </button>
  )
}

export default function EmployeeList() {
  const { data: employees = [], isLoading } = useEmployees()
  const deleteEmployee = useDeleteEmployee()
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [deptFilter, setDeptFilter] = useState('')
  const [sort, setSort] = useState({ field: 'name', dir: 'asc' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [historyEmployee, setHistoryEmployee] = useState(null)

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees],
  )

  const counts = useMemo(
    () => employees.reduce((acc, e) => { acc[e.status] = (acc[e.status] ?? 0) + 1; return acc }, {}),
    [employees],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return employees
      .filter((e) => {
        const matchSearch = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)
        const matchStatus = statusTab === 'all' || e.status === statusTab
        const matchDept = !deptFilter || e.department === deptFilter
        return matchSearch && matchStatus && matchDept
      })
      .sort((a, b) => {
        const va = a[sort.field]?.toLowerCase() ?? ''
        const vb = b[sort.field]?.toLowerCase() ?? ''
        return sort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [employees, search, statusTab, deptFilter, sort])

  function toggleSort(field) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' },
    )
  }

  async function handleDelete(id) {
    await deleteEmployee.mutateAsync(id)
    setConfirmDelete(null)
  }

  const hasActiveFilters = search || statusTab !== 'all' || deptFilter

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-azul-escuro">Colaboradores</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {employees.length} registros · {departments.length} departamentos
          </p>
        </div>
        <Link
          to="/admin/employees/new"
          className="flex items-center gap-2 bg-apatita text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-apatita/90 active:scale-[0.98] transition-all shadow-sm shadow-apatita/20 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo colaborador</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, cargo ou departamento..." />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-apatita/40 focus:border-apatita bg-white min-w-[160px]"
        >
          <option value="">Todos os departamentos</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(''); setStatusTab('all'); setDeptFilter('') }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-vermelho border border-gray-200 rounded-xl hover:border-red-200 transition-colors"
          >
            <X className="w-4 h-4" /> Limpar
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map(({ key, label }) => {
          const count = key === 'all' ? employees.length : (counts[key] ?? 0)
          return (
            <button
              key={key}
              onClick={() => setStatusTab(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${statusTab === key
                  ? 'bg-white text-azul-escuro shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${statusTab === key ? 'bg-apatita/15 text-apatita' : 'bg-gray-200 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium text-gray-500">Nenhum colaborador encontrado</p>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearch(''); setStatusTab('all'); setDeptFilter('') }}
                  className="mt-2 text-xs text-apatita hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-400">
                {filtered.length} {filtered.length !== 1 ? 'resultados' : 'resultado'}
                {hasActiveFilters && ' (filtrado)'}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      <SortButton field="name" sort={sort} onSort={toggleSort} />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">
                      <SortButton field="role" sort={sort} onSort={toggleSort} />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">
                      <SortButton field="department" sort={sort} onSort={toggleSort} />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar emp={emp} />
                          <div className="min-w-0">
                            <p className="font-semibold text-azul-escuro truncate">{emp.name}</p>
                            <p className="text-xs text-gray-400 sm:hidden truncate">{emp.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{emp.role}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[emp.status]}`}>
                          {STATUS_LABEL[emp.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setHistoryEmployee(emp)}
                            className="p-1.5 text-gray-400 hover:text-azul-escuro hover:bg-gray-100 rounded-lg transition-colors"
                            title="Histórico"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/employees/${emp.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-apatita hover:bg-apatita/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(emp)}
                            className="p-1.5 text-gray-400 hover:text-vermelho hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* History modal */}
      {historyEmployee && (
        <HistoryModal employee={historyEmployee} onClose={() => setHistoryEmployee(null)} />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-vermelho" />
              </div>
              <div>
                <h3 className="font-bold text-azul-escuro">Remover colaborador</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Deseja remover <strong>{confirmDelete.name}</strong>? Essa ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleteEmployee.isPending}
                className="flex-1 px-4 py-2.5 bg-vermelho text-white rounded-xl text-sm font-semibold hover:bg-vermelho/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {deleteEmployee.isPending
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Removendo…</>
                  : 'Remover'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
