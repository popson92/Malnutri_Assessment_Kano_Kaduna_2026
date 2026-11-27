import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities, verificationRatio, avgRegisterAvailability } from '@/analytics/indicators'
import { getLgaLabel } from '@/config/geo'

export default function RegisterVerification() {
  const { facilities } = useStore()

  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const vRatio = useMemo(() => verificationRatio(facilities), [facilities])
  const avgAvail = useMemo(() => avgRegisterAvailability(facilities), [facilities])

  const withRegisters = completed.filter(f => f.c_months_avail != null)
  const fullAvail = withRegisters.filter(f => (f.c_months_avail ?? 0) >= 20).length
  const lowAvail = withRegisters.filter(f => (f.c_months_avail ?? 0) < 12).length

  const ratioDistribution = useMemo(() => {
    const bins = [
      { name: '< 0.5', min: 0, max: 0.5, count: 0 },
      { name: '0.5–0.8', min: 0.5, max: 0.8, count: 0 },
      { name: '0.8–1.0', min: 0.8, max: 1.0, count: 0 },
      { name: '1.0–1.2', min: 1.0, max: 1.2, count: 0 },
      { name: '1.2–1.5', min: 1.2, max: 1.5, count: 0 },
      { name: '> 1.5', min: 1.5, max: 999, count: 0 },
    ]
    for (const f of completed) {
      if (f.c_rate == null) continue
      const bin = bins.find(b => f.c_rate! >= b.min && f.c_rate! < b.max)
      if (bin) bin.count++
    }
    return bins
  }, [completed])

  const imamVsDhis2 = useMemo(() =>
    completed
      .filter(f => f.c_tot_imam != null && f.c_tot_dhis2 != null)
      .map(f => ({
        name: f.pre_fname,
        imam: f.c_tot_imam,
        dhis2: f.c_tot_dhis2,
        diff: (f.c_tot_dhis2 ?? 0) - (f.c_tot_imam ?? 0),
      }))
  , [completed])

  const availDistribution = useMemo(() => {
    const bins = Array.from({ length: 5 }, (_, i) => ({
      name: `${i * 5}–${(i + 1) * 5}`,
      count: 0,
    }))
    for (const f of withRegisters) {
      const idx = Math.min(Math.floor((f.c_months_avail ?? 0) / 5), 4)
      bins[idx].count++
    }
    return bins
  }, [withRegisters])

  const topDiscrepancies = useMemo(() =>
    completed
      .filter(f => f.c_rate != null)
      .sort((a, b) => Math.abs((b.c_rate ?? 1) - 1) - Math.abs((a.c_rate ?? 1) - 1))
      .slice(0, 15)
  , [completed])

  return (
    <div>
      <PageHeader title="Register Verification" description="Register availability, admission verification ratios, and data-source concordance" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard title="Facilities Reviewed" value={completed.length} />
        <KpiCard title="Verification Ratio" value={vRatio != null ? vRatio.toFixed(2) : '—'} subtitle="Verified / Reported" />
        <KpiCard title="Avg Months Available" value={avgAvail != null ? avgAvail.toFixed(1) : '—'} subtitle="Out of 24" />
        <KpiCard title="Full Availability" value={fullAvail} subtitle="20+ months" color="success" />
        <KpiCard title="Low Availability" value={lowAvail} subtitle="< 12 months" color={lowAvail > 0 ? 'danger' : 'default'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Verification Ratio Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratioDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#8BB8D4" name="Facilities" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Register Availability Distribution" subtitle="Months with registers available (of 24)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={availDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#059669" name="Facilities" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="IMAM vs DHIS2 Totals" subtitle="Scatter: each dot is a facility">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" dataKey="imam" name="IMAM" tick={{ fontSize: 10 }} label={{ value: 'IMAM Register', fontSize: 10, position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" dataKey="dhis2" name="DHIS2" tick={{ fontSize: 10 }} label={{ value: 'DHIS2', fontSize: 10, angle: -90, position: 'insideLeft' }} />
                <ZAxis range={[30, 30]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value: number, name: string) => [value, name]} />
                <Scatter data={imamVsDhis2} fill="#5A9BBF" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">Points on the diagonal indicate agreement between data sources</p>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Largest Verification Discrepancies" subtitle="Facilities with ratios furthest from 1.0">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">Facility</th>
                  <th className="pb-2 pr-3">LGA</th>
                  <th className="pb-2 pr-3 text-right">Reported</th>
                  <th className="pb-2 pr-3 text-right">Verified</th>
                  <th className="pb-2 pr-3 text-right">Ratio</th>
                  <th className="pb-2 pr-3 text-right">Months Avail</th>
                  <th className="pb-2">Team</th>
                </tr>
              </thead>
              <tbody>
                {topDiscrepancies.map(f => (
                  <tr key={f._uuid} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium">{f.pre_fname}</td>
                    <td className="py-2 pr-3 text-muted">{getLgaLabel(f.a_lga)}</td>
                    <td className="py-2 pr-3 text-right">{f.c_tot_rep ?? '—'}</td>
                    <td className="py-2 pr-3 text-right">{f.c_tot_ver ?? '—'}</td>
                    <td className="py-2 pr-3 text-right font-medium">
                      <span className={f.c_rate != null && (f.c_rate < 0.8 || f.c_rate > 1.2) ? 'text-danger' : ''}>
                        {f.c_rate?.toFixed(2) ?? '—'}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{f.c_months_avail ?? '—'}</td>
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
