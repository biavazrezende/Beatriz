import { useAuditLog } from '../../hooks/useEmployees'
import { Clock, FilePlus, FileEdit, Trash2 } from 'lucide-react'

const ACTION_CONFIG = {
  created: { label: 'Criado', icon: FilePlus, color: 'text-green-600 bg-green-50' },
  updated: { label: 'Atualizado', icon: FileEdit, color: 'text-apatita bg-apatita/10' },
  deleted: { label: 'Removido', icon: Trash2, color: 'text-vermelho bg-red-50' },
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

function DiffView({ oldData, newData }) {
  if (!oldData || !newData) return null
  const changed = Object.keys(newData).filter(
    (key) => !['updated_at', 'created_at'].includes(key) && oldData[key] !== newData[key]
  )
  if (changed.length === 0) return null
  return (
    <div className="mt-2 space-y-1">
      {changed.map((key) => (
        <div key={key} className="flex gap-2 text-xs">
          <span className="text-gray-400 w-24 flex-shrink-0">{key}:</span>
          <span className="line-through text-gray-400 truncate max-w-[120px]">{String(oldData[key] ?? '—')}</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-700 truncate max-w-[120px]">{String(newData[key] ?? '—')}</span>
        </div>
      ))}
    </div>
  )
}

export default function AuditLog() {
  const { data: logs = [], isLoading, error } = useAuditLog()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-azul-escuro">Log de auditoria</h2>
        <p className="text-sm text-gray-500 mt-0.5">Últimas 100 alterações no organograma</p>
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

      {!isLoading && logs.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum registro de auditoria ainda</p>
        </div>
      )}

      {!isLoading && logs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {logs.map((log) => {
            const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated
            const Icon = config.icon
            const name = log.new_data?.name || log.old_data?.name || '—'

            return (
              <div key={log.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${config.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium text-azul-escuro">
                        <span className={`mr-1.5 text-xs font-semibold ${config.color.split(' ')[0]} px-1.5 py-0.5 rounded`}>
                          {config.label}
                        </span>
                        {name}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(log.created_at)}</span>
                    </div>
                    {log.changed_by_email && (
                      <p className="text-xs text-gray-400 mt-0.5">por {log.changed_by_email}</p>
                    )}
                    <DiffView oldData={log.old_data} newData={log.new_data} />
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
