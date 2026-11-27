import {
  LayoutDashboard, TrendingUp, Users, ShieldCheck, ClipboardList,
  Package, Map, Building2, AlertTriangle, Settings,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  group: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, group: 'Fieldwork Monitoring' },
  { to: '/fieldwork', label: 'Fieldwork Progress', icon: TrendingUp, group: 'Fieldwork Monitoring' },
  { to: '/caregivers', label: 'Caregiver Interviews', icon: Users, group: 'Fieldwork Monitoring' },
  { to: '/data-quality', label: 'Data Quality', icon: ShieldCheck, group: 'Data Quality & Findings' },
  { to: '/register', label: 'Register Verification', icon: ClipboardList, group: 'Data Quality & Findings' },
  { to: '/rutf', label: 'RUTF & Stock', icon: Package, group: 'Data Quality & Findings' },
  { to: '/geographic', label: 'Geographic Overview', icon: Map, group: 'Deep Dive & Supervision' },
  { to: '/facility', label: 'Facility Explorer', icon: Building2, group: 'Deep Dive & Supervision' },
  { to: '/issues', label: 'Issues & Follow-up', icon: AlertTriangle, group: 'Deep Dive & Supervision' },
  { to: '/settings', label: 'Data & Settings', icon: Settings, group: 'System' },
]

export const NAV_GROUPS = ['Fieldwork Monitoring', 'Data Quality & Findings', 'Deep Dive & Supervision', 'System']
