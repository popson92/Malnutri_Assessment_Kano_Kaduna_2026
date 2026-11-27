import { useMemo, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from 'recharts'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities } from '@/analytics/indicators'
import { getLgaLabel } from '@/config/geo'
import { evaluateAllRules, flagSummary, type QualityFlag } from '@/analytics/qualityRules'
import { detectAllOutliers, type OutlierResult } from '@/analytics/outlierEngine'
import { INDICATORS, type IndicatorDef } from '@/analytics/indicatorRegistry'
import type { MonthlyFieldKey } from '@/analytics/outlierEngine'
import type { FacilityRecord, MonthlyRecord } from '@/types'

type Tab = 'flags' | 'trends' | 'outliers' | 'by-team'

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  high: 'badge-danger',
}

const OUTLIER_INDICATORS = INDICATORS.filter(i =>
  ['imam_admissions', 'verified_admissions', 'cured', 'defaulted', 'rutf_received', 'rutf_dispensed'].includes(i.id)
)

interface IndicatorGroup {
  label: string
  ids: string[]
  color: string[]
}

const INDICATOR_GROUPS: IndicatorGroup[] = [
  {
    label: 'Admissions',
    ids: ['imam_admissions', 'dhis2_admissions', 'verified_admissions', 'readmissions'],
    color: ['#3678B9', '#438AC9', '#65A5DF', '#93C5FD'],
  },
  {
    label: 'Treatment Outcomes',
    ids: ['cured', 'defaulted', 'deaths'],
    color: ['#059669', '#D97706', '#DC2626'],
  },
  {
    label: 'RUTF',
    ids: ['rutf_received', 'rutf_dispensed'],
    color: ['#7C3AED', '#A78BFA'],
  },
]

const ALL_TREND_IDS = INDICATOR_GROUPS.flatMap(g => g.ids)

function getIndicatorColor(id: string): string {
  for (const group of INDICATOR_GROUPS) {
    const idx = group.ids.indexOf(id)
    if (idx >= 0) return group.color[idx]
  }
  return '#94A3B8'
}

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
      <PageHeader title="Data Quality & Outliers" description="Rule-based quality flags, monthly trends, and statistical outlier detection across all facility submissions" />

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
          ['trends', 'Monthly Trends'],
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

      {tab === 'trends' && (
        <MonthlyTrendsTab facilities={facilities} outliers={outliers} />
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

/* ─── Monthly Trends Tab ─── */

interface TrendPoint {
  month: string
  monthIdx: number
  [indicatorId: string]: string | number | null
}

function aggregateMonthlyTrends(facilities: FacilityRecord[], activeIds: string[]): {
  data: TrendPoint[]
  means: Record<string, number>
  medians: Record<string, number>
} {
  const monthMap = new Map<number, { label: string; sums: Record<string, number>; counts: Record<string, number> }>()

  for (const fac of facilities) {
    for (const m of fac.monthlyData) {
      if (!m.m_label) continue
      let entry = monthMap.get(m.m_idx)
      if (!entry) {
        entry = { label: m.m_label, sums: {}, counts: {} }
        monthMap.set(m.m_idx, entry)
      }
      for (const id of activeIds) {
        const ind = INDICATORS.find(ind => ind.id === id)
        if (!ind) continue
        const val = m[ind.sourceField as keyof MonthlyRecord]
        if (val != null && typeof val === 'number') {
          entry.sums[id] = (entry.sums[id] ?? 0) + val
          entry.counts[id] = (entry.counts[id] ?? 0) + 1
        }
      }
    }
  }

  const sorted = [...monthMap.entries()].sort((a, b) => a[0] - b[0])

  const data: TrendPoint[] = sorted.map(([idx, entry]) => {
    const point: TrendPoint = { month: entry.label, monthIdx: idx }
    for (const id of activeIds) {
      point[id] = entry.counts[id] ? Math.round(entry.sums[id] / entry.counts[id]) : null
    }
    return point
  })

  const means: Record<string, number> = {}
  const medians: Record<string, number> = {}
  for (const id of activeIds) {
    const vals = data.map(d => d[id]).filter((v): v is number => v != null && typeof v === 'number')
    if (vals.length > 0) {
      means[id] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      const s = [...vals].sort((a, b) => a - b)
      const mid = Math.floor(s.length / 2)
      medians[id] = s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2)
    }
  }

  return { data, means, medians }
}

function MonthlyTrendsTab({ facilities, outliers }: { facilities: FacilityRecord[]; outliers: OutlierResult[] }) {
  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set(['imam_admissions', 'verified_admissions', 'cured']))
  const [showMean, setShowMean] = useState(false)
  const [showMedian, setShowMedian] = useState(true)

  const toggleIndicator = useCallback((id: string) => {
    setActiveIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleGroup = useCallback((group: IndicatorGroup) => {
    setActiveIds(prev => {
      const next = new Set(prev)
      const allActive = group.ids.every(id => next.has(id))
      for (const id of group.ids) {
        if (allActive) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }, [])

  const activeArray = useMemo(() => [...activeIds], [activeIds])
  const { data, means, medians } = useMemo(
    () => aggregateMonthlyTrends(facilities, activeArray),
    [facilities, activeArray]
  )

  const outlierMarkers = useMemo(() => {
    const markers: { month: string; value: number; indicatorId: string; severity: string }[] = []
    for (const o of outliers) {
      if (!activeIds.has(o.indicatorId)) continue
      markers.push({ month: o.monthLabel, value: o.value, indicatorId: o.indicatorId, severity: o.severity })
    }
    return markers
  }, [outliers, activeIds])

  const trendSummary = useMemo(() => {
    return activeArray.map(id => {
      const ind = INDICATORS.find(i => i.id === id)
      const vals = data.map(d => d[id]).filter((v): v is number => v != null && typeof v === 'number')
      const outlierCount = outliers.filter(o => o.indicatorId === id).length
      return {
        id,
        name: ind?.shortName ?? id,
        unit: ind?.unit ?? '',
        mean: means[id] ?? 0,
        median: medians[id] ?? 0,
        min: vals.length > 0 ? Math.min(...vals) : 0,
        max: vals.length > 0 ? Math.max(...vals) : 0,
        months: vals.length,
        outliers: outlierCount,
      }
    })
  }, [activeArray, data, means, medians, outliers])

  if (facilities.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border p-8 text-center text-sm text-muted">
        No facility data available. Connect to KoboToolbox to see monthly trends.
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Indicator selector */}
      <SectionCard title="Indicator Selection" subtitle="Choose indicators to compare on the trend chart">
        <div className="flex flex-wrap gap-4">
          {INDICATOR_GROUPS.map(group => (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group)}
                className="text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-ink mb-1.5 block"
              >
                {group.label}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {group.ids.map((id, i) => {
                  const ind = INDICATORS.find(ind => ind.id === id)
                  const active = activeIds.has(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleIndicator(id)}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                        active
                          ? 'border-transparent text-white shadow-sm'
                          : 'border-border bg-white text-muted hover:border-primary/30'
                      }`}
                      style={active ? { backgroundColor: group.color[i] } : undefined}
                    >
                      {ind?.shortName ?? id}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 border-t border-border/50 pt-3">
          <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer">
            <input type="checkbox" checked={showMean} onChange={e => setShowMean(e.target.checked)} className="rounded" />
            Show mean
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer">
            <input type="checkbox" checked={showMedian} onChange={e => setShowMedian(e.target.checked)} className="rounded" />
            Show median
          </label>
        </div>
      </SectionCard>

      {/* Combined line chart */}
      <SectionCard title="Monthly Trend Comparison" subtitle={`${activeArray.length} indicator(s) — average across ${facilities.length} facilities`}>
        <div style={{ height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                formatter={(value: number, name: string) => {
                  const ind = INDICATORS.find(i => i.id === name)
                  return [value, ind?.shortName ?? name]
                }}
              />
              <Legend
                verticalAlign="top"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                formatter={(value: string) => {
                  const ind = INDICATORS.find(i => i.id === value)
                  return ind?.shortName ?? value
                }}
              />
              {activeArray.map(id => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={getIndicatorColor(id)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
              {showMean && activeArray.map(id => (
                means[id] != null ? (
                  <ReferenceLine
                    key={`mean-${id}`}
                    y={means[id]}
                    stroke={getIndicatorColor(id)}
                    strokeDasharray="6 4"
                    strokeOpacity={0.5}
                  />
                ) : null
              ))}
              {showMedian && activeArray.map(id => (
                medians[id] != null ? (
                  <ReferenceLine
                    key={`med-${id}`}
                    y={medians[id]}
                    stroke={getIndicatorColor(id)}
                    strokeDasharray="2 2"
                    strokeOpacity={0.4}
                  />
                ) : null
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Trend summary table */}
      {trendSummary.length > 0 && (
        <SectionCard title="Trend Summary" subtitle="Per-indicator statistics across available months">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">Indicator</th>
                  <th className="pb-2 pr-3">Unit</th>
                  <th className="pb-2 pr-3 text-right">Mean</th>
                  <th className="pb-2 pr-3 text-right">Median</th>
                  <th className="pb-2 pr-3 text-right">Min</th>
                  <th className="pb-2 pr-3 text-right">Max</th>
                  <th className="pb-2 pr-3 text-right">Months</th>
                  <th className="pb-2 text-right">Outliers</th>
                </tr>
              </thead>
              <tbody>
                {trendSummary.map(row => (
                  <tr key={row.id} className="border-b border-border/50">
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getIndicatorColor(row.id) }} />
                        <span className="font-medium">{row.name}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-muted">{row.unit}</td>
                    <td className="py-2 pr-3 text-right">{row.mean}</td>
                    <td className="py-2 pr-3 text-right">{row.median}</td>
                    <td className="py-2 pr-3 text-right text-muted">{row.min}</td>
                    <td className="py-2 pr-3 text-right text-muted">{row.max}</td>
                    <td className="py-2 pr-3 text-right">{row.months}</td>
                    <td className="py-2 text-right">
                      {row.outliers > 0 ? (
                        <span className="badge-warning">{row.outliers}</span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

/* ─── Flag Table with Drill-down ─── */

function FlagTable({ flags }: { flags: QualityFlag[] }) {
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [selectedFlag, setSelectedFlag] = useState<QualityFlag | null>(null)
  const filtered = severityFilter === 'all' ? flags : flags.filter(f => f.severity === severityFilter)

  return (
    <>
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
                <tr
                  key={f.id}
                  className="border-b border-border/50 cursor-pointer hover:bg-pale-blue/40 transition-colors"
                  onClick={() => setSelectedFlag(f)}
                >
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
        {filtered.length > 100 && (
          <p className="mt-2 text-[10px] text-muted text-center">Showing first 100 of {filtered.length} flags</p>
        )}
      </SectionCard>

      {/* Drill-down panel */}
      {selectedFlag && (
        <FlagDetailPanel flag={selectedFlag} allFlags={flags} onClose={() => setSelectedFlag(null)} />
      )}
    </>
  )
}

function FlagDetailPanel({ flag, allFlags, onClose }: { flag: QualityFlag; allFlags: QualityFlag[]; onClose: () => void }) {
  const facilityFlags = allFlags.filter(f => f.facilityCode === flag.facilityCode)
  const sameFacility = facilityFlags.filter(f => f.id !== flag.id)

  return (
    <div className="mt-4 rounded-xl border border-primary/30 bg-white shadow-lg overflow-hidden">
      <div className="flex items-center justify-between bg-pale-blue px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{flag.facilityName}</h3>
          <p className="text-[11px] text-muted">{getLgaLabel(flag.lga)} &middot; {flag.state} &middot; {flag.team}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/60 text-muted">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Selected flag detail */}
        <div className="rounded-lg border border-border/60 p-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-muted mr-2">{flag.ruleId}</span>
              <span className={SEVERITY_BADGE[flag.severity]}>{flag.severity}</span>
            </div>
            {flag.monthLabel && <span className="text-[11px] text-muted">{flag.monthLabel}</span>}
          </div>
          <p className="mt-2 text-xs text-ink">{flag.explanation}</p>
          {flag.expected != null && (
            <div className="mt-2 flex gap-4 text-[11px]">
              <span>Observed: <strong>{flag.value}</strong></span>
              <span>Expected: <strong>{flag.expected}</strong></span>
              {flag.deviation != null && <span>Deviation: <strong>{flag.deviation}%</strong></span>}
            </div>
          )}
          <div className="mt-2 rounded bg-blue-50 px-3 py-2">
            <p className="text-[11px] text-blue-800"><strong>Recommendation:</strong> {flag.recommendation}</p>
          </div>
        </div>

        {/* Other flags for same facility */}
        {sameFacility.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted mb-2">
              {sameFacility.length} other flag{sameFacility.length !== 1 ? 's' : ''} for this facility
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {sameFacility.map(f => (
                <div key={f.id} className="flex items-center gap-2 rounded border border-border/40 px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-[10px] text-muted">{f.ruleId}</span>
                  <span className={SEVERITY_BADGE[f.severity]}>{f.severity}</span>
                  <span className="flex-1 truncate text-muted">{f.explanation}</span>
                  {f.monthLabel && <span className="text-muted">{f.monthLabel}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Outlier Table ─── */

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
