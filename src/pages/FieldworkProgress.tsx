import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { PageHeader, KpiCard, SectionCard, StatusBadge } from '@/components/ui'
import { useStore } from '@/store'
import { SAMPLING_TARGETS, getLgaLabel, getStateLabel } from '@/config/geo'
import { completedFacilities, countByOutcome, dailyCompletionTrend, replacementCount, teamPerformance } from '@/analytics/indicators'

const OUTCOME_LABELS: Record<string, string> = {
  completed: 'Completed', partial: 'Partly completed', closed: 'Closed',
  not_sam_site: 'Not SAM site', inaccessible: 'Inaccessible', refused: 'Refused', other: 'Other',
}

export default function FieldworkProgress() {
  const { facilities, caregivers, filters } = useStore()

  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const outcomes = useMemo(() => countByOutcome(facilities), [facilities])
  const trend = useMemo(() => dailyCompletionTrend(facilities), [facilities])
  const replacements = useMemo(() => replacementCount(facilities), [facilities])
  const teams = useMemo(() => teamPerformance(facilities, caregivers), [facilities, caregivers])

  const target = filters.state ? SAMPLING_TARGETS[filters.state].facilities : SAMPLING_TARGETS.total.facilities
  const remaining = Math.max(0, target - completed.length)
  const partialCount = facilities.filter(f => f.a_outcome === 'partial').length

  const outcomeData = Object.entries(outcomes)
    .filter(([_, v]) => v > 0)
    .map(([key, value]) => ({ name: OUTCOME_LABELS[key] ?? key, value }))
    .sort((a, b) => b.value - a.value)

  return (
    <div>
      <PageHeader title="Fieldwork Progress" description="Facility visits, completion targets, replacements and team performance" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard title="Target" value={target} />
        <KpiCard title="Visited" value={facilities.length} />
        <KpiCard title="Completed" value={completed.length} color="success" />
        <KpiCard title="Partly Completed" value={partialCount} color="warning" />
        <KpiCard title="Remaining" value={remaining} />
        <KpiCard title="Replacements" value={replacements} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Cumulative Completion Trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="cumulative" stroke="#3678B9" strokeWidth={2} name="Cumulative" />
                <Line type="monotone" dataKey="daily" stroke="#65A5DF" strokeWidth={1.5} dot={{ r: 3 }} name="Daily" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Visit Outcomes">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#65A5DF" radius={[0, 4, 4, 0]} name="Facilities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Team Performance">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-4">Team</th>
                  <th className="pb-2 pr-4">State</th>
                  <th className="pb-2 pr-4 text-right">Visited</th>
                  <th className="pb-2 pr-4 text-right">Completed</th>
                  <th className="pb-2 pr-4 text-right">Pending</th>
                  <th className="pb-2 pr-4 text-right">CG Interviews</th>
                  <th className="pb-2 pr-4 text-right">DQ Flags</th>
                  <th className="pb-2">Last Submission</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(t => (
                  <tr key={t.team} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">{t.team}</td>
                    <td className="py-2 pr-4 text-muted capitalize">{t.state}</td>
                    <td className="py-2 pr-4 text-right">{t.visited}</td>
                    <td className="py-2 pr-4 text-right font-medium text-success">{t.completed}</td>
                    <td className="py-2 pr-4 text-right">{t.pending}</td>
                    <td className="py-2 pr-4 text-right">{t.cgInterviews}</td>
                    <td className="py-2 pr-4 text-right">{t.qualityFlags > 0 ? <span className="text-danger">{t.qualityFlags}</span> : '0'}</td>
                    <td className="py-2 text-muted">{t.lastSubmission ? new Date(t.lastSubmission).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {partialCount > 0 && (
        <div className="mt-6">
          <SectionCard title="Pending Return Visits" subtitle={`${partialCount} facilities need return visits`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-4">Facility</th>
                    <th className="pb-2 pr-4">LGA</th>
                    <th className="pb-2 pr-4">Team</th>
                    <th className="pb-2 pr-4">Visit Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.filter(f => f.a_outcome === 'partial').map(f => (
                    <tr key={f._uuid} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">{f.pre_fname}</td>
                      <td className="py-2 pr-4 text-muted">{getLgaLabel(f.a_lga)}</td>
                      <td className="py-2 pr-4 text-muted">{f.a_team}</td>
                      <td className="py-2 pr-4 text-muted">{f.a_date}</td>
                      <td className="py-2"><StatusBadge status="partial" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
