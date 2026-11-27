import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities, dataQualityFlags } from '@/analytics/indicators'
import { getLgaLabel } from '@/config/geo'
import type { DataQualityIssue } from '@/types'

function generateIssues(facilities: ReturnType<typeof completedFacilities>): DataQualityIssue[] {
  const issues: DataQualityIssue[] = []
  let idx = 0

  for (const f of facilities) {
    if (f.h_dq === 'low') {
      issues.push({
        id: `dq-${idx++}`,
        type: 'Low data quality rating',
        severity: 'critical',
        state: f.a_state,
        lga: f.a_lga,
        facility: f.pre_fname,
        team: f.a_team,
        date: f.a_date,
        description: `Facility rated as low data quality by assessment team`,
        recommendation: 'Review with supervisor; consider return visit',
        status: 'new',
      })
    }
    if (f.a_photo_taken === 'No') {
      issues.push({
        id: `dq-${idx++}`,
        type: 'Missing signboard photo',
        severity: 'warning',
        state: f.a_state,
        lga: f.a_lga,
        facility: f.pre_fname,
        team: f.a_team,
        date: f.a_date,
        description: 'No facility signboard photograph was captured',
        recommendation: 'Follow up with team to explain reason',
        status: 'new',
      })
    }
    if (f.c_rate != null && f.c_rate > 1.5) {
      issues.push({
        id: `dq-${idx++}`,
        type: 'High verification ratio',
        severity: 'warning',
        state: f.a_state,
        lga: f.a_lga,
        facility: f.pre_fname,
        team: f.a_team,
        date: f.a_date,
        description: `Verification ratio of ${f.c_rate.toFixed(2)} — register counts significantly exceed reported admissions`,
        recommendation: 'Investigate data sources and counting methodology',
        status: 'new',
      })
    }
    if (f.c_cure != null && f.c_cure >= 0.95 && (f.c_tot_def ?? 0) === 0 && (f.c_exits ?? 0) >= 20) {
      issues.push({
        id: `dq-${idx++}`,
        type: 'Anomalous cure rate',
        severity: 'warning',
        state: f.a_state,
        lga: f.a_lga,
        facility: f.pre_fname,
        team: f.a_team,
        date: f.a_date,
        description: `Cure rate of ${(f.c_cure * 100).toFixed(0)}% with zero defaulters (${f.c_exits} exits)`,
        recommendation: 'Review outcome classification practices',
        status: 'new',
      })
    }
    if (f.e_match === 'no') {
      issues.push({
        id: `dq-${idx++}`,
        type: 'Stock card mismatch',
        severity: 'warning',
        state: f.a_state,
        lga: f.a_lga,
        facility: f.pre_fname,
        team: f.a_team,
        date: f.a_date,
        description: 'Physical RUTF count does not match stock card balance',
        recommendation: 'Review stock management and counting accuracy',
        status: 'new',
      })
    }
  }

  return issues.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1
    if (a.severity !== 'critical' && b.severity === 'critical') return 1
    return a.date.localeCompare(b.date)
  })
}

export default function DataQuality() {
  const { facilities } = useStore()

  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const flags = useMemo(() => dataQualityFlags(facilities), [facilities])
  const issues = useMemo(() => generateIssues(completed), [completed])

  const byType = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of issues) { counts[i.type] = (counts[i.type] ?? 0) + 1 }
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [issues])

  const byTeam = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of issues) { counts[i.team] = (counts[i.team] ?? 0) + 1 }
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [issues])

  return (
    <div>
      <PageHeader title="Data Quality" description="Automated data-quality monitoring across all submissions" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard title="Submissions Assessed" value={completed.length} />
        <KpiCard title="With Flags" value={flags.affectedSubmissions} subtitle={`${completed.length > 0 ? (flags.affectedSubmissions / completed.length * 100).toFixed(0) : 0}% of assessed`} />
        <KpiCard title="Critical Issues" value={flags.critical} color="danger" />
        <KpiCard title="Warnings" value={flags.warning} color="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Issues by Type">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={140} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#DC2626" name="Issues" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Issues by Team">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTeam}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#D97706" name="Issues" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Data Quality Issue Log" subtitle={`${issues.length} issues identified`}>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">Severity</th>
                  <th className="pb-2 pr-3">Type</th>
                  <th className="pb-2 pr-3">Facility</th>
                  <th className="pb-2 pr-3">LGA</th>
                  <th className="pb-2 pr-3">Team</th>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {issues.slice(0, 50).map(issue => (
                  <tr key={issue.id} className="border-b border-border/50">
                    <td className="py-2 pr-3">
                      <span className={issue.severity === 'critical' ? 'badge-danger' : issue.severity === 'warning' ? 'badge-warning' : 'badge-info'}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-medium">{issue.type}</td>
                    <td className="py-2 pr-3">{issue.facility}</td>
                    <td className="py-2 pr-3 text-muted">{getLgaLabel(issue.lga)}</td>
                    <td className="py-2 pr-3 text-muted">{issue.team}</td>
                    <td className="py-2 pr-3 text-muted">{issue.date}</td>
                    <td className="py-2 text-muted max-w-xs truncate">{issue.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
