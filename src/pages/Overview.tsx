import { useMemo } from 'react'
import { Building2, Users, CheckCircle, AlertTriangle, TrendingUp, ClipboardList } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { SAMPLING_TARGETS, CAREGIVER_TARGET_PER_FACILITY } from '@/config/geo'
import {
  completedFacilities, completionRate, completedCaregiverInterviews,
  caregiverTarget, caregiverAchievement, facilitiesRequiringFollowUp,
  dataQualityFlags, countByOutcome, dailyCompletionTrend, lgaSummaries,
} from '@/analytics/indicators'

const COLORS = ['#059669', '#D97706', '#DC2626', '#94A3B8', '#2563EB', '#7C3AED', '#EC4899']
const OUTCOME_COLORS: Record<string, string> = {
  completed: '#059669',
  partial: '#D97706',
  closed: '#DC2626',
  not_sam_site: '#94A3B8',
  inaccessible: '#6366F1',
  refused: '#EC4899',
  other: '#64748B',
}
const OUTCOME_LABELS: Record<string, string> = {
  completed: 'Completed',
  partial: 'Partly completed',
  closed: 'Closed',
  not_sam_site: 'Not SAM site',
  inaccessible: 'Inaccessible',
  refused: 'Refused',
  other: 'Other',
}

export default function Overview() {
  const { facilities, caregivers, syncStatus } = useStore()

  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const compRate = useMemo(() => completionRate(facilities), [facilities])
  const cgCompleted = useMemo(() => completedCaregiverInterviews(caregivers), [caregivers])
  const cgTarget = useMemo(() => caregiverTarget(), [])
  const cgRate = useMemo(() => caregiverAchievement(caregivers), [caregivers])
  const followUp = useMemo(() => facilitiesRequiringFollowUp(facilities), [facilities])
  const dqFlags = useMemo(() => dataQualityFlags(facilities), [facilities])
  const outcomes = useMemo(() => countByOutcome(facilities), [facilities])
  const trend = useMemo(() => dailyCompletionTrend(facilities), [facilities])
  const lgaData = useMemo(() => lgaSummaries(facilities, caregivers), [facilities, caregivers])

  const outcomeData = Object.entries(outcomes).map(([key, value]) => ({
    name: OUTCOME_LABELS[key] ?? key,
    value,
    color: OUTCOME_COLORS[key] ?? '#64748B',
  }))

  const stateComparison = [
    {
      state: 'Kano',
      target: SAMPLING_TARGETS.kano.facilities,
      completed: facilities.filter(f => f.a_state === 'kano' && f.a_outcome === 'completed').length,
      visited: facilities.filter(f => f.a_state === 'kano').length,
    },
    {
      state: 'Kaduna',
      target: SAMPLING_TARGETS.kaduna.facilities,
      completed: facilities.filter(f => f.a_state === 'kaduna' && f.a_outcome === 'completed').length,
      visited: facilities.filter(f => f.a_state === 'kaduna').length,
    },
  ]

  const topLgas = lgaData
    .filter(l => l.completed > 0)
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 15)

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Executive summary of fieldwork performance, data quality and preliminary findings"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          title="Facilities Sampled"
          value={SAMPLING_TARGETS.total.facilities}
          icon={<Building2 size={20} />}
        />
        <KpiCard
          title="Facilities Visited"
          value={facilities.length}
          subtitle={`${new Set(facilities.map(f => f.a_fac)).size} unique`}
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          title="Completed"
          value={completed.length}
          subtitle={`${(compRate * 100).toFixed(1)}% of target`}
          color="success"
          icon={<CheckCircle size={20} />}
        />
        <KpiCard
          title="Caregiver Interviews"
          value={cgCompleted.length}
          subtitle={`${(cgRate * 100).toFixed(1)}% of ${cgTarget} target`}
          icon={<Users size={20} />}
        />
        <KpiCard
          title="Quality Flags"
          value={dqFlags.total}
          subtitle={`${dqFlags.critical} critical, ${dqFlags.warning} warnings`}
          color={dqFlags.critical > 0 ? 'danger' : 'warning'}
          icon={<AlertTriangle size={20} />}
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Daily completion trend */}
        <SectionCard title="Daily Facility Completions" subtitle="Cumulative and daily completions">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number, name: string) => [value, name === 'cumulative' ? 'Cumulative' : 'Daily']}
                />
                <Line type="monotone" dataKey="cumulative" stroke="#2A6496" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="daily" stroke="#8BB8D4" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* State comparison */}
        <SectionCard title="State Progress" subtitle="Kano vs Kaduna completion">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="state" tick={{ fontSize: 12 }} width={70} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="target" fill="#E2E8F0" name="Target" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completed" fill="#059669" name="Completed" radius={[0, 4, 4, 0]} />
                <Bar dataKey="visited" fill="#8BB8D4" name="Visited" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Visit outcome distribution */}
        <SectionCard title="Visit Outcomes" subtitle="Distribution of facility visit results">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {outcomeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Top LGAs by completion */}
        <SectionCard title="LGA Performance" subtitle="Top LGAs by completed visits">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLgas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="lgaLabel" tick={{ fontSize: 9 }} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="completed" fill="#5A9BBF" name="Completed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Follow-up and issues */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Facilities Requiring Follow-up" subtitle={`${followUp.length} facilities need attention`}>
          <div className="max-h-64 overflow-y-auto">
            {followUp.length === 0 ? (
              <p className="text-sm text-muted">No facilities currently require follow-up</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-3">Facility</th>
                    <th className="pb-2 pr-3">LGA</th>
                    <th className="pb-2 pr-3">Team</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {followUp.slice(0, 10).map(f => (
                    <tr key={f._uuid} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{f.pre_fname}</td>
                      <td className="py-2 pr-3 text-muted">{f.a_lga}</td>
                      <td className="py-2 pr-3 text-muted">{f.a_team}</td>
                      <td className="py-2">
                        <span className={f.a_outcome === 'partial' ? 'badge-warning' : 'badge-danger'}>
                          {f.a_outcome === 'partial' ? 'Partial' : 'Low DQ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Caregiver Interviews by State">
          <div className="space-y-4">
            {(['kano', 'kaduna'] as const).map(state => {
              const stateCg = caregivers.filter(c => c.a_state === state)
              const stateCompleted = stateCg.filter(c => c.c_contact === 'yes' && c.c_consent === 'yes').length
              const stateTarget = SAMPLING_TARGETS[state].facilities * CAREGIVER_TARGET_PER_FACILITY
              const pct = stateTarget > 0 ? (stateCompleted / stateTarget * 100) : 0
              return (
                <div key={state}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium capitalize">{state}</span>
                    <span className="text-muted">{stateCompleted} / {stateTarget} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>

      {/* Sync info */}
      <div className="mt-6 text-xs text-muted text-center">
        Last sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'} ·
        {syncStatus.facilityCount} facility submissions · {syncStatus.caregiverCount} caregiver submissions
      </div>
    </div>
  )
}
