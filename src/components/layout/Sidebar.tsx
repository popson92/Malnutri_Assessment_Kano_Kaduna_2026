import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { NAV_ITEMS, NAV_GROUPS } from '@/config/nav'
import type { DataMode } from '@/types'

interface Props {
  dataMode: DataMode
  facilityCount: number
  lastSync: string | null
  collapsed?: boolean
  onToggleCollapse?: () => void
  onClose?: () => void
}

export function Sidebar({ dataMode, facilityCount, lastSync, collapsed, onToggleCollapse, onClose }: Props) {
  const modeLabel =
    dataMode === 'development' ? 'DEV' :
    dataMode === 'testing' ? 'PILOT' : 'LIVE'

  const modeColor =
    dataMode === 'production' ? 'bg-success' :
    dataMode === 'testing' ? 'bg-amber-500' : 'bg-primary'

  return (
    <div className="flex h-full flex-col bg-white border-r border-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Activity size={16} />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold tracking-wide uppercase text-primary">GiveWell SAM</div>
            <div className="text-xs font-bold text-ink truncate">Assessment Dashboard</div>
          </div>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded text-muted hover:text-ink hover:bg-pale-blue transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Mode indicator */}
      {!collapsed && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-pale-blue px-3 py-1.5">
          <span className={`h-2 w-2 rounded-full ${modeColor}`} />
          <span className="text-[10px] font-semibold text-primary">{modeLabel} DATA</span>
          <span className="text-[10px] text-muted ml-auto">{facilityCount} submissions</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map(group => {
          const items = NAV_ITEMS.filter(n => n.group === group)
          return (
            <div key={group}>
              {!collapsed && <div className="sidebar-group-label">{group}</div>}
              {collapsed && <div className="mt-3 mb-1 mx-auto h-px w-6 bg-border" />}
              {items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'} ${collapsed ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={16} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && lastSync && (
        <div className="border-t border-border px-4 py-2.5 text-[10px] text-muted">
          Last sync: {new Date(lastSync).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
