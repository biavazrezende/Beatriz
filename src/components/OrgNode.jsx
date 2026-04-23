import { useState } from 'react'
import { ChevronDown, ChevronRight, User } from 'lucide-react'

const STATUS_BADGE = {
  hiring: { label: 'Em contratação', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-500 border border-gray-300' },
}

function Avatar({ photoUrl, name, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm'
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-2 border-apatita/30 flex-shrink-0`}
      />
    )
  }
  return (
    <div className={`${sizeClass} rounded-full bg-apatita/20 flex items-center justify-center flex-shrink-0`}>
      <User className={size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} strokeWidth={1.5} style={{ color: '#61C1D0' }} />
    </div>
  )
}

export function OrgNode({ node, level = 0, onSelect }) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node.children && node.children.length > 0
  const badge = STATUS_BADGE[node.status]

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div className="relative flex flex-col items-center">
        <button
          onClick={() => onSelect(node)}
          className={`
            group relative bg-white rounded-xl border-2 shadow-sm px-4 py-3
            flex flex-col items-center gap-1 min-w-[140px] max-w-[180px] text-center
            transition-all duration-150 hover:shadow-md hover:-translate-y-0.5
            ${node.status === 'hiring' ? 'border-yellow-300 bg-yellow-50/40' : 'border-gray-200 hover:border-apatita/50'}
            ${level === 0 ? 'border-apatita bg-apatita/5 shadow-md' : ''}
          `}
        >
          <Avatar photoUrl={node.photo_url} name={node.name} />
          <div className="mt-1">
            <p className="font-semibold text-azul-escuro text-xs leading-tight">{node.name}</p>
            <p className="text-gray-500 text-[11px] leading-tight mt-0.5">{node.role}</p>
          </div>
          {badge && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          )}
          {level === 0 && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-apatita text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {node.department}
            </span>
          )}
        </button>

        {/* Expand/collapse toggle */}
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 w-5 h-5 rounded-full bg-apatita/10 border border-apatita/30 flex items-center justify-center hover:bg-apatita/20 transition-colors z-10"
            title={expanded ? 'Colapsar' : 'Expandir'}
          >
            {expanded
              ? <ChevronDown className="w-3 h-3 text-apatita" />
              : <ChevronRight className="w-3 h-3 text-apatita" />
            }
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="relative mt-0 pt-0">
          {/* Vertical line from toggle down */}
          <div className="absolute top-0 left-1/2 -translate-x-px w-px h-4 bg-apatita/30" />
          {/* Horizontal connector */}
          {node.children.length > 1 && (
            <div
              className="absolute top-4 bg-apatita/30 h-px"
              style={{
                left: `calc(${(1 / (node.children.length)) * 50}%)`,
                right: `calc(${(1 / (node.children.length)) * 50}%)`,
              }}
            />
          )}
          <div className="flex gap-4 mt-4 items-start">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector from horizontal line to card */}
                <div className="w-px h-4 bg-apatita/30" />
                <OrgNode node={child} level={level + 1} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
