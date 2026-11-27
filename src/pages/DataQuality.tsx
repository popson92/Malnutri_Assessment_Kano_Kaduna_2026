import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities } from '@/analytics/indicators'
import { getLgaLabel } from '@/config/geo'
import { evaluateAllRules, flagSummary, type QualityFlag } from '@/analytics/qualityRules'
import { detectAllOutliers, type OutlierResult } from '@/analytics/outlierEngine'
import { INDICATORS } from '@/analytics/indicatorRegistry'
import type { MonthlyFieldKey } from '@/analytics/outlierEngine'

type Tab = 'flags' | 'outliers' | 'by-team'

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  high: 'badge-danger',
}

const OUTLIER_INDICATORS = INDICATORS.filter(i =>
  ['imam_admissions', 'verified_admissions', 'cured', 'defaulted', 'rutf_received', 'rutf_dispensed'].includes(i.id)
)

export default function DataQuality() {
  const { facilities } = useStore()
  const [tab, setTab] = useState<Tab>('flags')

  const completed = useMemo(() => completedFacilities(facilities), [facilities])

  const qualityFlags = useMemo(() => evaluateAllRules(facilities), [facilities])
  const summary = useMemo(() => flagSummary(qualityFlags), [qualityFlags])

  const outliers = useMemo(() => {
    const all: OutlierResult[] = []
    for (const ind of OUTLIER_INDICATORS) {
      all.push(...detectAllOutliers(facilities, ind.id, ind.sourceField as MonthlyFieldKey))
    }
    return all.sort((a, b) => {
      const sev = { high: 0, warning: 1, info: 2 }
      return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2)
    })
  }, [facilities])

  const byRule = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const f of qualityFlags) { counts[f.ruleName] = (counts[f.ruleName] ?? 0) + 1 }
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [qualityFlags])

  const byTeam = useMemo(() => {
    const counts: Record<string, { critical: number; warning: number; info: number }> = {}
    for (const f of qualityFlags) {
      if (!counts[f.team]) counts[f.team] = { critical: 0, warning: 0, info: 0 }
      counts[f.team][f.severity]++
    }
    return Object.entries(counts)
      .map(([name, v]) => ({ name, ...v, total: v.critical + v.warning + v.info }))
      .sort((a, b) => b.total - a.total)
  }, [qualityFlags])

  const outlierByIndicator = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const o of outliers) {
      const ind = INDICATORS.find(i => i.id === o.indicatorId)
      const label = ind?.shortName ?? o.indicatorId
      counts[label] = (counts[label] ?? 0) + 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [outliers])

  return (
    <div>
      <PageHeader title="Data Quality & Outliers" description="Rule-based quality flags and statistical outlier detection across all facility submissions" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard title="Facilities Assessed" value={completed.length} />
        <KpiCard title="Total Flags" value={summary.total} subtitle={`${summary.affectedFacilities} facilities`} />
        <KpiCard title="Critical" value={summary.critical} color="danger" />
        <KpiCard title="Warnings" value={summary.warning} color="warning" />
        <KpiCard title="Outlier Months" value={outliers.length} subtitle={`${outliers.filter(o => o.severity === 'high').length} high severity`} />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border">
        {([
          ['flags', 'Quality Flags'],
          ['outliers', 'Outlier Detection'],
          ['by-team', 'Team Analysis'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={tab === key ? 'tab-btn tab-btn-active' : 'tab-btn'}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'flags' && (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Flags by Rule">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byRule} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} width={180} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#DC2626" name="Flags" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Quality Rules Reference" subtitle="8 automated consistency and completeness checks">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {byRule.map(r => {
                  const sample = qualityFlags.find(f => f.ruleName === r.name)
                  return (
                    <div key={r.name} className="flex items-start gap-2 rounded-lg border border-border/60 px-3 py-2">
                      <span className={`mt-0.5 ${SEVERITY_BADGE[sample?.severity ?? 'info']}`}>
                        {sample?.ruleId}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink">{r.name}</p>
                        <p className="text-[11px] text-muted mt-0.5">{sample?.recommendation}</p>
                      </div>
                      <span className="text-xs font-semibold text-ink">{r.value}</span>
                    </div>
                  )
                })}
              </div>
            </SectionCard>
          </div>

          <div className="mt-6">
            <FlagTable flags={qualityFlags} />
          </div>
        </>
      )}

      {tab === 'outliers' && (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Outliers by Indicator">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outlierByIndicator} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={140} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#D97706" name="Outlier months" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Detection Method" subtitle="Modified Z-score (MAD-based), threshold 3.5">
              <div className="space-y-3 py-2">
                <div className="rounded-lg bg-pale-blue/50 px-4 py-3">
                  <p className="text-xs font-medium text-ink">How outliers are detected</p>
                  <p className="text-[11px] text-muted mt-1">
                    For each facility, monthly values are compared against the facility&apos;s own distribution
                    using the Modified Z-score (MAD-based) method. Values with |Modified Z| &gt; 3.5 are flagged.
                    Facilities need at least 8 months of data for detection.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border border-border/60 p-2">
                    <p className="text-lg font-bold text-red-600">{outliers.filter(o => o.severity === 'high').length}</p>
                    <p className="text-[10px] text-muted">High (|Z| &gt; 5)</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-2">
                    <p className="text-lg font-bold text-amber-600">{outliers.filter(o => o.severity === 'warning').length}</p>
                    <p className="text-[10px] text-muted">Warning (|Z| &gt; 3.5)</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-2">
                    <p className="text-lg font-bold text-blue-600">{outliers.filter(o => o.severity === 'info').length}</p>
                    <p className="text-[10px] text-muted">Info</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="mt-6">
            <OutlierTable outliers={outliers} />
          </div>
        </>
      )}

      {tab === 'by-team' && (
        <>
          <div className="mt-6">
            <SectionCard title="Quality Flags by Team" subtitle="Distribution of flag severity across assessment teams">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTeam}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="critical" stackId="a" fill="#DC2626" name="Critical" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="warning" stackId="a" fill="#D97706" name="Warning" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="info" stackId="a" fill="#3678B9" name="Info" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="mt-6">
            <SectionCard title="Team Summary">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-muted">
                      <th className="pb-2 pr-3">Team</th>
                      <th className="pb-2 pr-3 text-right">Critical</th>
                      <th className="pb-2 pr-3 text-right">Warning</th>
                      <th className="pb-2 pr-3 text-right">Info</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byTeam.map(t => (
                      <tr key={t.name} className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium">{t.name}</td>
                        <td className="py-2 pr-3 text-right"><span className={t.critical > 0 ? 'text-red-600 font-semibold' : 'text-muted'}>{t.critical}</span></td>
                        <td className="py-2 pr-3 text-right"><span className={t.warning > 0 ? 'text-amber-600 font-semibold' : 'text-muted'}>{t.warning}</span></td>
                        <td className="py-2 pr-3 text-right text-muted">{t.info}</td>
                        <td className="py-2 text-right font-semibold">{t.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}

function FlagTable({ flags }: { flags: QualityFlag[] }) {
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const filtered = severityFilter === 'all' ? flags : flags.filter(f => f.severity === severityFilter)

  return (
    <SectionCard title="Quality Flag Log" subtitle={`${filtered.length} of ${flags.length} flags shown`}>
      <div className="mb-3 flex gap-2">
        {['all', 'critical', 'warning', 'info'].map(s => (
          <button key={s} onClick={() => setSeverityFilter(s)}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              severityFilter === s ? 'bg-primary text-white' : 'bg-pale-blue text-muted hover:text-ink'
            }`}>
            {s === 'all' ? `All (${flags.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${flags.filter(f => f.severity === s).length})`}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b text-left text-muted">
              <th className="pb-2 pr-3">Rule</th>
              <th className="pb-2 pr-3">Severity</th>
              <th className="pb-2 pr-3">Facility</th>
              <th className="pb-2 pr-3">LGA</th>
              <th className="pb-2 pr-3">Month</th>
              <th className="pb-2 pr-3">Value</th>
              <th className="pb-2">Explanation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(f => (
              <tr key={f.id} className="border-b border-border/50">
                <td className="py-2 pr-3"><span className="font-mono text-[10px]">{f.ruleId}</span></td>
                <td className="py-2 pr-3"><span className={SEVERITY_BADGE[f.severity]}>{f.severity}</span></td>
                <td className="py-2 pr-3 font-medium">{f.facilityName}</td>
                <td className="py-2 pr-3 text-muted">{getLgaLabel(f.lga)}</td>
                <td className="py-2 pr-3 text-muted">{f.monthLabel ?? '—'}</td>
                <td className="py-2 pr-3 text-muted">{f.value != null ? String(f.value) : '—'}</td>
                <td className="py-2 text-muted max-w-xs truncate" title={f.explanation}>{f.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

function OutlierTable({ outliers }: { outliers: OutlierResult[] }) {
  return (
    <SectionCard title="Outlier Detail" subtitle={`${outliers.length} outlier facility-months detected`}>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b text-left text-muted">
              <th className="pb-2 pr-3">Severity</th>
              <th className="pb-2 pr-3">Indicator</th>
              <th className="pb-2 pr-3">Facility</th>
              <th className="pb-2 pr-3">LGA</th>
              <th className="pb-2 pr-3">Month</th>
              <th className="pb-2 pr-3 text-right">Value</th>
              <th className="pb-2 pr-3 text-right">Median</th>
              <th className="pb-2 pr-3 text-right">Mod. Z</th>
              <th className="pb-2 text-right">N</th>
            </tr>
          </thead>
          <tbody>
            {outliers.slice(0, 100).map((o, i) => {
              const ind = INDICATORS.find(ind => ind.id === o.indicatorId)
              return (
                <tr key={`${o.facilityCode}-${o.indicatorId}-${o.monthIdx}-${i}`} className="border-b border-border/50">
                  <td className="py-2 pr-3">
                    <span className={o.severity === 'high' ? 'badge-danger' : o.severity === 'warning' ? 'badge-warning' : 'badge-info'}>
                      {o.severity}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-medium">{ind?.shortName ?? o.indicatorId}</td>
                  <td className="py-2 pr-3">{o.facilityName}</td>
                  <td className="py-2 pr-3 text-muted">{getLgaLabel(o.lga)}</td>
                  <td className="py-2 pr-3 text-muted">{o.monthLabel}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{o.value}</td>
                  <td className="py-2 pr-3 text-right text-muted">{o.median.toFixed(1)}</td>
                  <td className="py-2 pr-3 text-right">
                    <span className={o.modifiedZScore != null && Math.abs(o.modifiedZScore) > 5 ? 'text-red-600 font-semibold' : 'text-amber-600'}>
                      {o.modifiedZScore != null ? o.modifiedZScore.toFixed(2) : '—'}
                    </span>
                  </td>
                  <td className="py-2 text-right text-muted">{o.n}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
