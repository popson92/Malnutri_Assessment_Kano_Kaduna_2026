import { NavLink } from 'react-router-dom'
import { NAV_ITEMS, NAV_GROUPS } from '@/config/nav'
import type { DataMode } from '@/types'

interface Props {
  dataMode: DataMode
  facilityCount: number
  lastSync: string | null
  onClose?: () => void
}

export function Sidebar({ dataMode, facilityCount, lastSync, onClose }: Props) {
  const modeLabel =
    dataMode === 'development' ? 'DEV MODE' :
    dataMode === 'testing' ? 'KOBO CONNECTED' : 'LIVE DATA'

  const modeColor =
    dataMode === 'production' ? 'bg-emerald-500' : 'bg-amber-500'

  return (
    <div className="flex h-full flex-col" style={{ background: '#1E3A5F' }}>
      <div className="px-4 pt-5 pb-4">
        <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#8BB8D4' }}>GiveWell SAM Assessment</div>
        <div className="mt-1 text-sm font-bold text-white">Monitoring &amp; Verification</div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${modeColor}`} />
          <span className="text-[10px] font-medium text-white/60">{modeLabel}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map(group => {
          const items = NAV_ITEMS.filter(n => n.group === group)
          return (
            <div key={group} className="mb-3">
              <div className="mb-1 px-3 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                {group}
              </div>
              {items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                  }
                >
                  <item.icon size={16} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-3 text-[10px] text-white/40">
        <div>{facilityCount} facility submissions</div>
        {lastSync && <div>Last sync: {new Date(lastSync).toLocaleTimeString()}</div>}
      </div>
    </div>
  )
}
