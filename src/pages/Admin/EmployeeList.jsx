import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEmployees, useDeleteEmployee } from '../../hooks/useEmployees'
import { SearchBar } from '../../components/SearchBar'
import { UserPlus, Pencil, Trash2, User } from 'lucide-react'

const STATUS_LABEL = { active: 'Ativo', inactive: 'Inativo', hiring: 'Em contratação' }
const STATUS_COLOR = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  hiring: 'bg-yellow-100 text-yellow-700',
}

export default function EmployeeList() {
  const { data: employees = [], isLoading } = useEmployees()
  const deleteEmployee = useDeleteEmployee()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id) {
    await deleteEmployee.mutateAsync(id)
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-azul-escuro">Colaboradores</h2>
          <p className="text-sm text-gray-500 mt-0.5">{employees.length} registros</p>
        </div>
        <Link
          to="/admin/employees/new"
          className="flex items-center gap-2 bg-apatita text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-apatita/90 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Novo colaborador
        </Link>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, cargo ou departamento..." />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum colaborador encontrado</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Cargo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Departamento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {emp.photo_url ? (
                          <img src={emp.photo_url} alt={emp.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-apatita/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-apatita" />
                          </div>
                        )}
                        <span className="font-medium text-azul-escuro">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{emp.role}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[emp.status]}`}>
                        {STATUS_LABEL[emp.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
          )}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-azul-escuro text-lg mb-2">Confirmar remoção</h3>
            <p className="text-sm text-gray-600 mb-6">
              Deseja remover <strong>{confirmDelete.name}</strong> do organograma? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleteEmployee.isPending}
                className="flex-1 px-4 py-2 bg-vermelho text-white rounded-lg text-sm font-medium hover:bg-vermelho/90 disabled:opacity-60 transition-colors"
              >
                {deleteEmployee.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
