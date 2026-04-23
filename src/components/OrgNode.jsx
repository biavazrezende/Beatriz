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
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  return (
    <div className={`${sizeClass} rounded-full bg-apatita/20 flex items-center justify-center flex-shrink-0 font-semibold text-apatita`}>
      {initials || <User className={size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} strokeWidth={1.5} />}
    </div>
  )
}

/**
 * @param {object} props
 * @param {object} props.node          - Employee node (with children[])
 * @param {number} props.level         - Depth in tree (0 = root)
 * @param {Function} props.onSelect    - Callback when card is clicked
 * @param {Set<string>} props.matchedIds - IDs that directly match search/filter
 * @param {boolean} props.searchActive - Whether search or filter is active
 */
export function OrgNode({ node, level = 0, onSelect, matchedIds = new Set(), searchActive = false }) {
  const [expandedLocal, setExpandedLocal] = useState(level < 2)
  const hasChildren = node.children && node.children.length > 0
  const badge = STATUS_BADGE[node.status]

  // When search is active, force expand so matches are visible
  const isExpanded = searchActive ? true : expandedLocal

  const isMatch = matchedIds.has(node.id)
  const isAncestor = searchActive && !isMatch

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div className="relative flex flex-col items-center">
        <button
          onClick={() => onSelect(node)}
          className={`
            group relative rounded-xl border-2 shadow-sm px-4 py-3
            flex flex-col items-center gap-1 min-w-[140px] max-w-[180px] text-center
            transition-all duration-150 hover:shadow-md hover:-translate-y-0.5
            ${isMatch
              ? 'border-apatita bg-apatita/8 shadow-apatita/20 ring-2 ring-apatita/30'
              : isAncestor
                ? 'border-gray-200 bg-white/70 opacity-70'
                : node.status === 'hiring'
                  ? 'border-yellow-300 bg-yellow-50/40'
                  : 'border-gray-200 bg-white hover:border-apatita/50'}
            ${level === 0 && !searchActive ? 'border-apatita bg-apatita/5 shadow-md' : ''}
          `}
        >
          <Avatar photoUrl={node.photo_url} name={node.name} />
          <div className="mt-1">
            <p className={`font-semibold text-xs leading-tight ${isMatch ? 'text-apatita' : 'text-azul-escuro'}`}>
              {node.name}
            </p>
            <p className="text-gray-500 text-[11px] leading-tight mt-0.5">{node.role}</p>
          </div>
          {badge && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          )}
          {level === 0 && !searchActive && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-apatita text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              {node.department}
            </span>
          )}
          {isMatch && searchActive && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-apatita text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              ✓
            </span>
          )}
        </button>

        {/* Expand/collapse toggle (only when search is not active) */}
        {hasChildren && !searchActive && (
          <button
            onClick={() => setExpandedLocal(!expandedLocal)}
            className="mt-1 w-5 h-5 rounded-full bg-apatita/10 border border-apatita/30 flex items-center justify-center hover:bg-apatita/20 transition-colors z-10"
            title={expandedLocal ? 'Colapsar' : 'Expandir'}
          >
            {expandedLocal
              ? <ChevronDown className="w-3 h-3 text-apatita" />
              : <ChevronRight className="w-3 h-3 text-apatita" />
            }
          </button>
        )}
        {hasChildren && searchActive && (
          <div className="mt-1 w-5 h-5" />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative mt-0 pt-0">
          {/* Vertical line from toggle down */}
          <div className="absolute top-0 left-1/2 -translate-x-px w-px h-4 bg-apatita/30" />
          {/* Horizontal connector */}
          {node.children.length > 1 && (
            <div
              className="absolute top-4 bg-apatita/30 h-px"
              style={{
                left: `calc(${(1 / node.children.length) * 50}%)`,
                right: `calc(${(1 / node.children.length) * 50}%)`,
              }}
            />
          )}
          <div className="flex gap-4 mt-4 items-start">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-apatita/30" />
                <OrgNode
                  node={child}
                  level={level + 1}
                  onSelect={onSelect}
                  matchedIds={matchedIds}
                  searchActive={searchActive}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
