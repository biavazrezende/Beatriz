import { useState, useCallback, useMemo } from 'react'
import { useEmployees, useUpdateEmployee } from '../../hooks/useEmployees'
import { GripVertical, ChevronDown, ChevronRight, User, CheckCircle2, XCircle, Info } from 'lucide-react'

// ─── Tree helpers ────────────────────────────────────────────────────────────

function buildTree(employees, managerId = null) {
  return employees
    .filter((e) => e.manager_id === managerId)
    .map((e) => ({ ...e, children: buildTree(employees, e.id) }))
}

/** Returns true if moving `dragId` under `newParentId` would create a cycle. */
function wouldCreateCycle(empMap, dragId, newParentId) {
  if (!newParentId || dragId === newParentId) return dragId === newParentId
  let cur = newParentId
  const seen = new Set()
  while (cur) {
    if (cur === dragId) return true
    if (seen.has(cur)) break
    seen.add(cur)
    cur = empMap.get(cur)?.manager_id ?? null
  }
  return false
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ emp, size = 8 }) {
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0`
  if (emp.photo_url) {
    return <img src={emp.photo_url} alt={emp.name} className={`${cls} object-cover border border-gray-200`} />
  }
  const initials = emp.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  return (
    <div className={`${cls} bg-apatita/15 flex items-center justify-center text-xs font-bold text-apatita`}>
      {initials || <User className="w-3 h-3" />}
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
      px-5 py-3 rounded-2xl shadow-xl text-sm font-medium border animate-in slide-in-from-bottom-4
      ${toast.type === 'success' ? 'bg-white border-apatita/30 text-azul-escuro' : 'bg-white border-vermelho/30 text-vermelho'}
    `}>
      {toast.type === 'success'
        ? <CheckCircle2 className="w-4 h-4 text-apatita flex-shrink-0" />
        : <XCircle className="w-4 h-4 text-vermelho flex-shrink-0" />
      }
      {toast.message}
    </div>
  )
}

// ─── Drop zone ───────────────────────────────────────────────────────────────

function RootDropZone({ isDragActive, dragOverRoot, onDragOver, onDragLeave, onDrop }) {
  if (!isDragActive) return null
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        mb-4 flex items-center justify-center h-12 rounded-2xl border-2 border-dashed text-sm font-medium transition-all
        ${dragOverRoot
          ? 'border-apatita bg-apatita/10 text-apatita'
          : 'border-gray-300 text-gray-400 hover:border-apatita/50'}
      `}
    >
      ↑ Soltar aqui para tornar colaborador raiz (sem gestor)
    </div>
  )
}

// ─── Tree node ───────────────────────────────────────────────────────────────

function TreeNode({
  node,
  level,
  draggingId,
  dragOverId,
  empMap,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node.children?.length > 0

  const isDragging = draggingId === node.id
  const isOver = dragOverId === node.id
  const isInvalid = isOver && draggingId && wouldCreateCycle(empMap, draggingId, node.id)
  const isValid = isOver && draggingId && !wouldCreateCycle(empMap, draggingId, node.id) && draggingId !== node.id

  return (
    <div className={`transition-opacity duration-150 ${isDragging ? 'opacity-30' : ''}`}>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, node.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOver(e, node.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, node.id)}
        className={`
          flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 cursor-grab active:cursor-grabbing
          transition-all duration-100 select-none group
          ${isValid   ? 'border-apatita bg-apatita/8 shadow-sm shadow-apatita/20' : ''}
          ${isInvalid ? 'border-vermelho bg-red-50' : ''}
          ${!isOver   ? 'border-transparent hover:border-gray-200 hover:bg-gray-50' : ''}
        `}
      >
        {/* Indent */}
        {level > 0 && <div style={{ width: `${(level - 1) * 20}px` }} className="flex-shrink-0" />}

        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
          className={`w-4 h-4 flex-shrink-0 transition-colors ${hasChildren ? 'text-gray-400 hover:text-apatita' : 'invisible'}`}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Drag handle */}
        <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />

        <Avatar emp={node} size={8} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-azul-escuro truncate">{node.name}</p>
          <p className="text-xs text-gray-500 truncate">{node.role}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="hidden sm:inline text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {node.department}
          </span>
          {hasChildren && (
            <span className="text-xs bg-apatita/10 text-apatita px-1.5 py-0.5 rounded-full font-medium">
              {node.children.length}
            </span>
          )}
          {node.status === 'hiring' && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
              Contrat.
            </span>
          )}
          {isInvalid && (
            <span className="text-xs text-vermelho font-medium">ciclo!</span>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              draggingId={draggingId}
              dragOverId={dragOverId}
              empMap={empMap}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OrgTree() {
  const { data: employees = [], isLoading } = useEmployees()
  const updateEmployee = useUpdateEmployee()

  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)  // null = not over any node
  const [dragOverRoot, setDragOverRoot] = useState(false)
  const [toast, setToast] = useState(null)

  const empMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])
  const tree = useMemo(() => buildTree(employees), [employees])

  function showToast(type, message) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const handleDragStart = useCallback((e, id) => {
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setDragOverId(null)
    setDragOverRoot(false)
  }, [])

  const handleDragOver = useCallback((e, id) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverRoot(false)
    setDragOverId(id)
  }, [])

  const handleDragLeave = useCallback((e) => {
    // Only clear if leaving the list entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverId(null)
    }
  }, [])

  const handleDrop = useCallback((e, newParentId) => {
    e.preventDefault()
    e.stopPropagation()
    const id = draggingId
    handleDragEnd()

    if (!id || id === newParentId) return

    if (wouldCreateCycle(empMap, id, newParentId)) {
      showToast('error', 'Não é possível: moveria um gestor para dentro de sua própria equipe.')
      return
    }

    const emp = empMap.get(id)
    const parent = empMap.get(newParentId)

    updateEmployee.mutate(
      { id, manager_id: newParentId },
      {
        onSuccess: () =>
          showToast('success', `${emp?.name} agora reporta para ${parent?.name}.`),
        onError: () =>
          showToast('error', 'Erro ao salvar. Tente novamente.'),
      },
    )
  }, [draggingId, empMap, handleDragEnd, updateEmployee])

  const handleRootDrop = useCallback((e) => {
    e.preventDefault()
    const id = draggingId
    handleDragEnd()
    if (!id) return

    const currentManager = empMap.get(id)?.manager_id
    if (currentManager === null) return // already root

    const emp = empMap.get(id)
    updateEmployee.mutate(
      { id, manager_id: null },
      {
        onSuccess: () => showToast('success', `${emp?.name} agora é um colaborador raiz (sem gestor).`),
        onError: () => showToast('error', 'Erro ao salvar. Tente novamente.'),
      },
    )
  }, [draggingId, empMap, handleDragEnd, updateEmployee])

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-azul-escuro">Reorganizar hierarquia</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Arraste colaboradores para alterar o gestor direto.
        </p>
      </div>

      {/* Hint banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-apatita/5 border border-apatita/20 rounded-xl text-sm text-gray-600">
        <Info className="w-4 h-4 text-apatita flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-azul-escuro">Como usar:</strong> segure e arraste uma linha para cima de outra para alterar o gestor.
          Borda <span className="text-apatita font-medium">azul</span> = destino válido ·
          Borda <span className="text-vermelho font-medium">vermelha</span> = criaria ciclo (não permitido).
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
          {/* Root drop zone */}
          <RootDropZone
            isDragActive={Boolean(draggingId)}
            dragOverRoot={dragOverRoot}
            onDragOver={(e) => { e.preventDefault(); setDragOverRoot(true); setDragOverId(null) }}
            onDragLeave={() => setDragOverRoot(false)}
            onDrop={handleRootDrop}
          />

          {/* Tree */}
          <div className="space-y-0.5">
            {tree.map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                level={0}
                draggingId={draggingId}
                dragOverId={dragOverId}
                empMap={empMap}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </div>

          <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
            {employees.length} colaboradores · {tree.length} raiz{tree.length !== 1 ? 'es' : ''}
          </p>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  )
}
