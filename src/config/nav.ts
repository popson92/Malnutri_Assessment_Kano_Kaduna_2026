import {
  LayoutDashboard, FileSearch, TrendingUp, Users, MapPin,
  ShieldCheck, ClipboardList, Package, UserCog,
  Building2, Layers, AlertTriangle, Settings,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  group: string
}

export const NAV_ITEMS: NavItem[] = [
  // Assessment Intelligence
  { to: '/', label: 'Executive Overview', icon: LayoutDashboard, group: 'Assessment Intelligence' },
  { to: '/findings', label: 'Assessment Findings', icon: FileSearch, group: 'Assessment Intelligence' },

  // Fieldwork Monitoring
  { to: '/fieldwork', label: 'Fieldwork Progress', icon: TrendingUp, group: 'Fieldwork Monitoring' },
  { to: '/caregivers', label: 'Caregiver Verification', icon: Users, group: 'Fieldwork Monitoring' },
  { to: '/geographic', label: 'Geographic & Photo', icon: MapPin, group: 'Fieldwork Monitoring' },

  // Technical Analysis
  { to: '/data-quality', label: 'Data Quality & Outliers', icon: ShieldCheck, group: 'Technical Analysis' },
  { to: '/register', label: 'Admissions & Register', icon: ClipboardList, group: 'Technical Analysis' },
  { to: '/rutf', label: 'RUTF & Stockouts', icon: Package, group: 'Technical Analysis' },
  { to: '/health-workers', label: 'Health Worker Perspectives', icon: UserCog, group: 'Technical Analysis' },

  // Deep Dive & Action
  { to: '/facility', label: 'Facility Explorer', icon: Building2, group: 'Deep Dive & Action' },
  { to: '/lga', label: 'LGA Deep Dive', icon: Layers, group: 'Deep Dive & Action' },
  { to: '/flags', label: 'Flags & Follow-up', icon: AlertTriangle, group: 'Deep Dive & Action' },

  // Administration
  { to: '/settings', label: 'Data & Settings', icon: Settings, group: 'Administration' },
]

export const NAV_GROUPS = [
  'Assessment Intelligence',
  'Fieldwork Monitoring',
  'Technical Analysis',
  'Deep Dive & Action',
  'Administration',
]
