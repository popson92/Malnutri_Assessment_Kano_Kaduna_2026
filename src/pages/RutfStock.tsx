import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities, rutfDiscrepancySummary } from '@/analytics/indicators'
import { getLgaLabel } from '@/config/geo'

export default function RutfStock() {
  const { facilities } = useStore()

  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const discrepancy = useMemo(() => rutfDiscrepancySummary(facilities), [facilities])

  const withStockData = completed.filter(f => f.e1 === 'yes_sighted')
  const stockOutMonths = completed.reduce((s, f) => s + (f.c_stock_months ?? 0), 0)
  const totalMonthsReviewed = completed.reduce((s, f) => s + (f.c_months_avail ?? 0), 0)
  const stockOutRate = totalMonthsReviewed > 0 ? stockOutMonths / totalMonthsReviewed : 0

  const matchData = [
    { name: 'Matched', value: discrepancy.matched, color: '#059669' },
    { name: 'Mismatched', value: discrepancy.mismatched, color: '#DC2626' },
  ].filter(d => d.value > 0)

  const discrepancyDistribution = useMemo(() => {
    const bins = [
      { name: 'Large deficit (< -500)', count: 0 },
      { name: 'Deficit (-500 to -1)', count: 0 },
      { name: 'Balanced (-1 to 1)', count: 0 },
      { name: 'Surplus (1 to 500)', count: 0 },
      { name: 'Large surplus (> 500)', count: 0 },
    ]
    for (const f of completed) {
      if (f.e_unexp == null) continue
      if (f.e_unexp < -500) bins[0].count++
      else if (f.e_unexp < -1) bins[1].count++
      else if (f.e_unexp <= 1) bins[2].count++
      else if (f.e_unexp <= 500) bins[3].count++
      else bins[4].count++
    }
    return bins
  }, [completed])

  const topDiscrepancies = useMemo(() =>
    completed
      .filter(f => f.e_unexp != null)
      .sort((a, b) => Math.abs(b.e_unexp ?? 0) - Math.abs(a.e_unexp ?? 0))
      .slice(0, 15)
  , [completed])

  return (
    <div>
      <PageHeader title="RUTF & Stock" description="RUTF stock accountability, physical verification and stockout monitoring" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard title="Stock Cards Sighted" value={withStockData.length} subtitle={`of ${completed.length} completed`} />
        <KpiCard title="Physical Match" value={discrepancy.matched} subtitle={`${discrepancy.mismatched} mismatched`} color={discrepancy.mismatched > 0 ? 'warning' : 'success'} />
        <KpiCard title="Surplus Facilities" value={discrepancy.positive} />
        <KpiCard title="Deficit Facilities" value={discrepancy.negative} color={discrepancy.negative > 0 ? 'danger' : 'default'} />
        <KpiCard title="Stockout Rate" value={`${(stockOutRate * 100).toFixed(1)}%`} subtitle="Facility-months with stockout" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Physical Count vs Stock Card">
          <div className="h-64 flex items-center justify-center">
            {matchData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={matchData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {matchData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted">No stock verification data available</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="RUTF Discrepancy Distribution" subtitle="Sachets unexplained (physical - dispensed)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discrepancyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#D97706" name="Facilities" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Largest RUTF Discrepancies" subtitle="Facilities with highest unexplained RUTF differences">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">Facility</th>
                  <th className="pb-2 pr-3">LGA</th>
                  <th className="pb-2 pr-3 text-right">Received</th>
                  <th className="pb-2 pr-3 text-right">Dispensed</th>
                  <th className="pb-2 pr-3 text-right">Physical</th>
                  <th className="pb-2 pr-3 text-right">Unexplained</th>
                  <th className="pb-2 pr-3">Match</th>
                  <th className="pb-2">Team</th>
                </tr>
              </thead>
              <tbody>
                {topDiscrepancies.map(f => (
                  <tr key={f._uuid} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium">{f.pre_fname}</td>
                    <td className="py-2 pr-3 text-muted">{getLgaLabel(f.a_lga)}</td>
                    <td className="py-2 pr-3 text-right">{f.c_rrec ?? '—'}</td>
                    <td className="py-2 pr-3 text-right">{f.c_rdisp ?? '—'}</td>
                    <td className="py-2 pr-3 text-right">{f.e_phys ?? '—'}</td>
                    <td className="py-2 pr-3 text-right font-medium">
                      <span className={(f.e_unexp ?? 0) < 0 ? 'text-danger' : (f.e_unexp ?? 0) > 0 ? 'text-amber-600' : ''}>
                        {f.e_unexp ?? '—'}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={f.e_match === 'yes' ? 'badge-success' : 'badge-danger'}>
                        {f.e_match === 'yes' ? 'Match' : 'Mismatch'}
                      </span>
                    </td>
                    <td className="py-2 text-muted">{f.a_team}</td>
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
