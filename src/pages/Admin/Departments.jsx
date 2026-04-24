import { useState, useRef, useEffect } from 'react'
import { useEmployees } from '../../hooks/useEmployees'
import {
  useDepartments,
  useAddDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '../../hooks/useDepartments'
import { Building2, Plus, Pencil, Trash2, Check, X, AlertTriangle, Users } from 'lucide-react'

// ─── Inline edit row ─────────────────────────────────────────────────────────

function EditRow({ dept, onSave, onCancel }) {
  const [value, setValue] = useState(dept.name)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSave(value)
    if (e.key === 'Escape') onCancel()
  }

  return (
    <tr className="bg-apatita/5">
      <td className="px-4 py-3" colSpan={2}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-1.5 rounded-lg border border-apatita text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => onSave(value)}
            disabled={!value.trim() || value.trim() === dept.name}
            className="p-1.5 rounded-lg bg-apatita text-white hover:bg-apatita/90 disabled:opacity-40 transition-colors"
            title="Salvar"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ dept, employeeCount, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-vermelho" />
          </div>
          <div>
            <h3 className="font-bold text-azul-escuro">Remover departamento?</h3>
            <p className="text-sm text-gray-500 mt-1">
              "<strong>{dept.name}</strong>" será removido da lista.
            </p>
          </div>
        </div>

        {employeeCount > 0 && (
          <div className="mb-4 px-3 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
            <span>
              <strong>{employeeCount} colaborador{employeeCount !== 1 ? 'es' : ''}</strong> ainda está
              {employeeCount !== 1 ? 'ão' : ''} neste departamento. O campo departamento deles não será alterado.
            </span>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-vermelho text-white hover:bg-vermelho/90 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Removendo…' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Departments() {
  const { data: departments = [], isLoading } = useDepartments()
  const { data: employees = [] } = useEmployees()
  const addDept = useAddDepartment()
  const updateDept = useUpdateDepartment()
  const deleteDept = useDeleteDepartment()

  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [toast, setToast] = useState(null)
  const newInputRef = useRef(null)

  // Employee count per department name
  const countByDept = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] ?? 0) + 1
    return acc
  }, {})

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (departments.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
      setAddError('Já existe um departamento com esse nome.')
      return
    }
    try {
      await addDept.mutateAsync(name)
      setNewName('')
      setAddError('')
      showToast(`Departamento "${name}" criado.`)
    } catch (err) {
      setAddError(err.message || 'Erro ao criar departamento.')
    }
  }

  async function handleSaveEdit(dept, value) {
    const name = value.trim()
    if (!name || name === dept.name) { setEditingId(null); return }
    if (departments.some((d) => d.id !== dept.id && d.name.toLowerCase() === name.toLowerCase())) {
      showToast('Já existe um departamento com esse nome.', 'error')
      return
    }
    try {
      await updateDept.mutateAsync({ id: dept.id, oldName: dept.name, newName: name })
      setEditingId(null)
      showToast(`Renomeado para "${name}".`)
    } catch (err) {
      showToast(err.message || 'Erro ao renomear.', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteDept.mutateAsync(deleteTarget.id)
      showToast(`"${deleteTarget.name}" removido.`)
    } catch (err) {
      showToast(err.message || 'Erro ao remover.', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-azul-escuro">Departamentos</h2>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie as áreas da organização</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-azul-escuro flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xl font-black text-azul-escuro">{departments.length}</p>
            <p className="text-xs text-gray-500">Departamentos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-apatita flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xl font-black text-azul-escuro">{employees.length}</p>
            <p className="text-xs text-gray-500">Colaboradores</p>
          </div>
        </div>
      </div>

      {/* Add new department */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-azul-escuro mb-3">Novo departamento</h3>
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="flex-1">
            <input
              ref={newInputRef}
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setAddError('') }}
              placeholder="Ex: Jurídico"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-apatita/40 transition-colors ${addError ? 'border-vermelho bg-red-50' : 'border-gray-200 focus:border-apatita'}`}
            />
            {addError && (
              <p className="text-xs text-vermelho mt-1">{addError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!newName.trim() || addDept.isPending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-apatita text-white text-sm font-semibold hover:bg-apatita/90 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </form>
      </div>

      {/* Department list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Departamento</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Colaboradores</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><div className="h-4 w-36 bg-gray-100 rounded animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-8 bg-gray-100 rounded animate-pulse mx-auto" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" /></td>
                </tr>
              ))
            )}
            {!isLoading && departments.map((dept) => (
              editingId === dept.id
                ? (
                  <EditRow
                    key={dept.id}
                    dept={dept}
                    onSave={(v) => handleSaveEdit(dept, v)}
                    onCancel={() => setEditingId(null)}
                  />
                )
                : (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-apatita flex-shrink-0" />
                        <span className="text-sm font-medium text-azul-escuro">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${countByDept[dept.name] ? 'text-azul-escuro' : 'text-gray-300'}`}>
                        {countByDept[dept.name] ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingId(dept.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-apatita hover:bg-apatita/10 transition-colors"
                          title="Renomear"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(dept)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-vermelho hover:bg-red-50 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
            ))}
            {!isLoading && departments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-400 text-sm">
                  Nenhum departamento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          dept={deleteTarget}
          employeeCount={countByDept[deleteTarget.name] ?? 0}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteDept.isPending}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-vermelho text-white' : 'bg-azul-escuro text-white'}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
