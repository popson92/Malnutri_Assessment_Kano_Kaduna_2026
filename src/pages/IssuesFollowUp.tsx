import { useMemo } from 'react'
import { PageHeader, KpiCard, SectionCard, StatusBadge } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities, facilitiesRequiringFollowUp } from '@/analytics/indicators'
import { getLgaLabel } from '@/config/geo'

export default function IssuesFollowUp() {
  const { facilities } = useStore()

  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const followUp = useMemo(() => facilitiesRequiringFollowUp(facilities), [facilities])

  const partial = facilities.filter(f => f.a_outcome === 'partial')
  const lowDq = completed.filter(f => f.h_dq === 'low')
  const stockMismatch = completed.filter(f => f.e_match === 'no')
  const highRatio = completed.filter(f => f.c_rate != null && f.c_rate > 1.5)
  const noPhoto = completed.filter(f => f.a_photo_taken === 'No')
  const replaced = facilities.filter(f => f.a_repl === 'yes')

  return (
    <div>
      <PageHeader title="Issues & Follow-up" description="Facilities requiring attention, return visits and issue tracking" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard title="Total Follow-up" value={followUp.length} color={followUp.length > 0 ? 'warning' : 'default'} />
        <KpiCard title="Partial Visits" value={partial.length} />
        <KpiCard title="Low DQ Rating" value={lowDq.length} color={lowDq.length > 0 ? 'danger' : 'default'} />
        <KpiCard title="Stock Mismatch" value={stockMismatch.length} />
        <KpiCard title="High V. Ratio" value={highRatio.length} />
        <KpiCard title="Replacements" value={replaced.length} />
      </div>

      {partial.length > 0 && (
        <div className="mt-6">
          <SectionCard title="Pending Return Visits" subtitle="Partially completed facilities requiring follow-up">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-3">Facility</th>
                    <th className="pb-2 pr-3">LGA</th>
                    <th className="pb-2 pr-3">State</th>
                    <th className="pb-2 pr-3">Team</th>
                    <th className="pb-2 pr-3">Visit Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {partial.map(f => (
                    <tr key={f._uuid} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{f.pre_fname}</td>
                      <td className="py-2 pr-3 text-muted">{getLgaLabel(f.a_lga)}</td>
                      <td className="py-2 pr-3 text-muted capitalize">{f.a_state}</td>
                      <td className="py-2 pr-3 text-muted">{f.a_team}</td>
                      <td className="py-2 pr-3 text-muted">{f.a_date}</td>
                      <td className="py-2"><StatusBadge status="partial" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {lowDq.length > 0 && (
        <div className="mt-6">
          <SectionCard title="Low Data Quality Facilities" subtitle="Facilities rated low data quality by assessment teams">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-3">Facility</th>
                    <th className="pb-2 pr-3">LGA</th>
                    <th className="pb-2 pr-3">Team</th>
                    <th className="pb-2 pr-3 text-right">V. Ratio</th>
                    <th className="pb-2 pr-3 text-right">Records</th>
                    <th className="pb-2 pr-3 text-right">Valid</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {lowDq.map(f => (
                    <tr key={f._uuid} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{f.pre_fname}</td>
                      <td className="py-2 pr-3 text-muted">{getLgaLabel(f.a_lga)}</td>
                      <td className="py-2 pr-3 text-muted">{f.a_team}</td>
                      <td className="py-2 pr-3 text-right">{f.c_rate?.toFixed(2) ?? '—'}</td>
                      <td className="py-2 pr-3 text-right">{f.d_rev ?? '—'}</td>
                      <td className="py-2 pr-3 text-right">{f.d_valid ?? '—'}</td>
                      <td className="py-2 text-muted">{f.a_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {stockMismatch.length > 0 && (
        <div className="mt-6">
          <SectionCard title="Stock Card Mismatches" subtitle="Facilities where physical count does not match stock card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-3">Facility</th>
                    <th className="pb-2 pr-3">LGA</th>
                    <th className="pb-2 pr-3 text-right">Received</th>
                    <th className="pb-2 pr-3 text-right">Dispensed</th>
                    <th className="pb-2 pr-3 text-right">Physical</th>
                    <th className="pb-2 pr-3 text-right">Unexplained</th>
                    <th className="pb-2">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMismatch.map(f => (
                    <tr key={f._uuid} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{f.pre_fname}</td>
                      <td className="py-2 pr-3 text-muted">{getLgaLabel(f.a_lga)}</td>
                      <td className="py-2 pr-3 text-right">{f.c_rrec ?? '—'}</td>
                      <td className="py-2 pr-3 text-right">{f.c_rdisp ?? '—'}</td>
                      <td className="py-2 pr-3 text-right">{f.e_phys ?? '—'}</td>
                      <td className="py-2 pr-3 text-right font-medium text-danger">{f.e_unexp ?? '—'}</td>
                      <td className="py-2 text-muted">{f.a_team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {noPhoto.length > 0 && (
        <div className="mt-6">
          <SectionCard title="Missing Signboard Photos" subtitle={`${noPhoto.length} facilities without photograph`}>
            <div className="flex flex-wrap gap-2">
              {noPhoto.map(f => (
                <span key={f._uuid} className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs">
                  {f.pre_fname} <span className="text-muted">({f.a_team})</span>
                </span>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
