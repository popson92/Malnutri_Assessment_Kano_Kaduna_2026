import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader, SectionCard, KpiCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities } from '@/analytics/indicators'
import { Building2, UserCog, AlertTriangle, Package } from 'lucide-react'

const FUNCTIONALITY_LABELS: Record<string, string> = {
  fully: 'Fully functional',
  partially: 'Partially functional',
  non: 'Non-functional',
}
const FUNC_COLORS: Record<string, string> = {
  fully: '#059669',
  partially: '#D97706',
  non: '#DC2626',
}

export default function HealthWorkerPerspectives() {
  const { facilities } = useStore()
  const completed = useMemo(() => completedFacilities(facilities), [facilities])

  const funcDist = useMemo(() => {
    const counts: Record<string, number> = { fully: 0, partially: 0, non: 0 }
    for (const f of completed) {
      const cls = f.h_func_cls ?? f.b27
      if (cls && cls in counts) counts[cls]++
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: FUNCTIONALITY_LABELS[key] ?? key,
      value,
      fill: FUNC_COLORS[key] ?? '#94A3B8',
    }))
  }, [completed])

  const mechCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of completed) {
      for (const m of f.h_mech) {
        counts.set(m, (counts.get(m) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name: name.replace(/_/g, ' '),
        count,
        pct: completed.length > 0 ? Math.round(count / completed.length * 100) : 0,
      }))
  }, [completed])

  const dqDist = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0 }
    for (const f of completed) {
      if (f.h_dq && f.h_dq in counts) counts[f.h_dq]++
    }
    return counts
  }, [completed])

  const trainedStaff = useMemo(() => {
    const vals = completed.filter(f => f.b9 != null).map(f => f.b9!)
    if (vals.length === 0) return { median: null, mean: null, count: 0 }
    vals.sort((a, b) => a - b)
    const mid = Math.floor(vals.length / 2)
    return {
      median: vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2,
      mean: vals.reduce((s, v) => s + v, 0) / vals.length,
      count: vals.length,
    }
  }, [completed])

  const fullyFunctional = funcDist.find(d => d.name === 'Fully functional')?.value ?? 0

  return (
    <div>
      <PageHeader
        title="Health Worker Perspectives"
        description="Facility respondent perspectives on service delivery, challenges, and operational constraints"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <KpiCard title="Facilities Assessed" value={completed.length} icon={<Building2 size={18} />} />
        <KpiCard
          title="Fully Functional"
          value={fullyFunctional}
          subtitle={completed.length > 0 ? `${Math.round(fullyFunctional / completed.length * 100)}%` : '—'}
          icon={<UserCog size={18} />}
          rail="success"
        />
        <KpiCard
          title="Median Trained Staff"
          value={trainedStaff.median != null ? trainedStaff.median : '—'}
          subtitle={`${trainedStaff.count} facilities reporting`}
          icon={<UserCog size={18} />}
          rail="primary"
        />
        <KpiCard
          title="Low Data Quality"
          value={dqDist.low}
          subtitle={`${dqDist.high} high, ${dqDist.medium} medium`}
          icon={<AlertTriangle size={18} />}
          color={dqDist.low > 0 ? 'danger' : 'default'}
          rail="danger"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Functionality */}
        <SectionCard title="Facility Functionality" subtitle="Assessment-team classification">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funcDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" name="Facilities" radius={[0, 4, 4, 0]}>
                  {funcDist.map((entry, i) => (
                    <Bar key={i} dataKey="value" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Health Worker Challenges */}
        <SectionCard
          title="Reported Challenges"
          subtitle={`From ${completed.length} assessed facilities`}
        >
          {mechCounts.length === 0 ? (
            <p className="text-xs text-muted">No challenge data reported yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mechCounts.map(m => (
                <div key={m.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink capitalize">{m.name}</span>
                    <span className="text-muted">{m.count} ({m.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-pale-blue overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Data Quality Distribution */}
        <SectionCard title="Data Quality Classification" subtitle="Assessment-team ratings">
          <div className="grid grid-cols-3 gap-4">
            {(['high', 'medium', 'low'] as const).map(level => {
              const colorMap = { high: 'text-success', medium: 'text-warning', low: 'text-danger' }
              const bgMap = { high: 'bg-emerald-50', medium: 'bg-amber-50', low: 'bg-red-50' }
              return (
                <div key={level} className={`${bgMap[level]} rounded-lg p-3 text-center`}>
                  <p className={`text-2xl font-bold ${colorMap[level]}`}>{dqDist[level]}</p>
                  <p className="text-[10px] font-medium text-muted uppercase mt-1">{level}</p>
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* Service Availability */}
        <SectionCard title="Service Availability" subtitle="SAM treatment service status">
          {(() => {
            const open = completed.filter(f => f.b1 === 'open' || f.b1 === 'yes').length
            const partial = completed.filter(f => f.b1 === 'partially').length
            const closed = completed.filter(f => f.b1 === 'no').length
            return (
              <div className="space-y-3">
                {[
                  { label: 'Open / Active', value: open, color: 'bg-success' },
                  { label: 'Partially available', value: partial, color: 'bg-warning' },
                  { label: 'Not available', value: closed, color: 'bg-danger' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-xs flex-1">{item.label}</span>
                    <span className="text-sm font-semibold text-ink">{item.value}</span>
                    <span className="text-xs text-muted w-12 text-right">
                      {completed.length > 0 ? `${Math.round(item.value / completed.length * 100)}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )
          })()}
        </SectionCard>
      </div>
    </div>
  )
}
