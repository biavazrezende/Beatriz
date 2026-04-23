import { useState, useMemo } from 'react'
import { useAuditLog } from '../../hooks/useEmployees'
import { Clock, FilePlus, FileEdit, Trash2 } from 'lucide-react'

const ACTION_CONFIG = {
  created: { label: 'Criado',     Icon: FilePlus,  color: 'text-green-600 bg-green-50',   tab: 'bg-green-100 text-green-700' },
  updated: { label: 'Atualizado', Icon: FileEdit,  color: 'text-apatita bg-apatita/10',   tab: 'bg-apatita/10 text-apatita' },
  deleted: { label: 'Removido',   Icon: Trash2,    color: 'text-vermelho bg-red-50',       tab: 'bg-red-100 text-vermelho' },
}

const FIELD_LABELS = {
  name:        'Nome',
  role:        'Cargo',
  department:  'Departamento',
  manager_id:  'Gestor',
  email:       'E-mail',
  status:      'Status',
  photo_url:   'Foto',
}

const STATUS_LABELS = { active: 'Ativo', inactive: 'Inativo', hiring: 'Em contratação' }

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

function renderValue(key, value) {
  if (value === null || value === undefined) return <em className="text-gray-400">—</em>
  if (key === 'status') return STATUS_LABELS[value] ?? value
  if (key === 'photo_url') return value ? '(foto)' : '(sem foto)'
  if (key === 'manager_id') return `(UUID: ${String(value).slice(0, 8)}…)`
  return String(value)
}

function DiffView({ oldData, newData }) {
  if (!oldData || !newData) return null
  const changed = Object.keys(newData).filter(
    (key) =>
      !['updated_at', 'created_at', 'id'].includes(key) &&
      String(oldData[key] ?? '') !== String(newData[key] ?? ''),
  )
  if (!changed.length) return null
  return (
    <div className="mt-2 space-y-1 pl-1 border-l-2 border-apatita/20 ml-1">
      {changed.map((key) => (
        <div key={key} className="flex items-start gap-2 text-xs flex-wrap">
          <span className="font-medium text-gray-500 w-24 flex-shrink-0">{FIELD_LABELS[key] ?? key}</span>
          <span className="line-through text-gray-400">{renderValue(key, oldData[key])}</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-700 font-medium">{renderValue(key, newData[key])}</span>
        </div>
      ))}
    </div>
  )
}

const FILTER_TABS = [
  { key: 'all',     label: 'Todos' },
  { key: 'created', label: 'Criados' },
  { key: 'updated', label: 'Atualizações' },
  { key: 'deleted', label: 'Removidos' },
]

export default function AuditLog() {
  const { data: logs = [], isLoading, error } = useAuditLog()
  const [actionFilter, setActionFilter] = useState('all')

  const counts = useMemo(
    () => logs.reduce((acc, l) => { acc[l.action] = (acc[l.action] ?? 0) + 1; return acc }, {}),
    [logs],
  )

  const filtered = useMemo(
    () => actionFilter === 'all' ? logs : logs.filter((l) => l.action === actionFilter),
    [logs, actionFilter],
  )

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-azul-escuro">Log de auditoria</h2>
        <p className="text-sm text-gray-500 mt-0.5">Últimas 100 alterações no organograma</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === 'all' ? logs.length : (counts[key] ?? 0)
          return (
            <button
              key={key}
              onClick={() => setActionFilter(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${actionFilter === key
                  ? 'bg-white text-azul-escuro shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${actionFilter === key ? 'bg-apatita/15 text-apatita' : 'bg-gray-200 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="py-10 text-center text-vermelho text-sm">
          Erro ao carregar o log: {error.message}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium text-gray-500">
            {actionFilter === 'all' ? 'Nenhum registro ainda' : 'Nenhum registro desse tipo'}
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filtered.map((log) => {
            const cfg = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.updated
            const { Icon } = cfg
            const name = log.new_data?.name || log.old_data?.name || '—'
            const dept = log.new_data?.department || log.old_data?.department

            return (
              <div key={log.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-azul-escuro truncate">{name}</p>
                        {dept && <p className="text-xs text-gray-400">{dept}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.tab}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                      </div>
                    </div>
                    {log.changed_by_email && (
                      <p className="text-xs text-gray-400 mt-0.5">por {log.changed_by_email}</p>
                    )}
                    {log.action === 'updated' && (
                      <DiffView oldData={log.old_data} newData={log.new_data} />
                    )}
                    {log.action === 'created' && log.new_data && (
                      <p className="mt-1 text-xs text-gray-500">
                        {log.new_data.role}{log.new_data.department ? ` · ${log.new_data.department}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
