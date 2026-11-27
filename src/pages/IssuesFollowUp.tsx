import { useMemo, useState } from 'react'
import { PageHeader, KpiCard, SectionCard, StatusBadge } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities, facilitiesRequiringFollowUp } from '@/analytics/indicators'
import { getLgaLabel } from '@/config/geo'
import { evaluateAllRules, flagSummary, type QualityFlag } from '@/analytics/qualityRules'

type View = 'action' | 'all-flags'

export default function IssuesFollowUp() {
  const { facilities } = useStore()
  const [view, setView] = useState<View>('action')
  const [selectedFlag, setSelectedFlag] = useState<QualityFlag | null>(null)

  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const followUp = useMemo(() => facilitiesRequiringFollowUp(facilities), [facilities])
  const qualityFlags = useMemo(() => evaluateAllRules(facilities), [facilities])
  const summary = useMemo(() => flagSummary(qualityFlags), [qualityFlags])

  const partial = facilities.filter(f => f.a_outcome === 'partial')
  const lowDq = completed.filter(f => f.h_dq === 'low')
  const stockMismatch = completed.filter(f => f.e_match === 'no')
  const noPhoto = completed.filter(f => f.a_photo_taken === 'No')
  const replaced = facilities.filter(f => f.a_repl === 'yes')

  const criticalFlags = qualityFlags.filter(f => f.severity === 'critical')
  const warningFlags = qualityFlags.filter(f => f.severity === 'warning')

  return (
    <div>
      <PageHeader title="Flags & Follow-up" description="Actionable flags, return visit tracking and quality issue resolution" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard title="Total Follow-up" value={followUp.length} color={followUp.length > 0 ? 'warning' : 'default'} />
        <KpiCard title="Partial Visits" value={partial.length} />
        <KpiCard title="Critical Flags" value={summary.critical} color={summary.critical > 0 ? 'danger' : 'default'} />
        <KpiCard title="Warning Flags" value={summary.warning} color="warning" />
        <KpiCard title="Stock Mismatch" value={stockMismatch.length} />
        <KpiCard title="Replacements" value={replaced.length} />
      </div>

      <div className="mt-6 flex gap-1 border-b border-border">
        {([
          ['action', 'Action Required'],
          ['all-flags', 'All Flags'],
        ] as [View, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setView(key)} className={view === key ? 'tab-btn tab-btn-active' : 'tab-btn'}>
            {label}
          </button>
        ))}
      </div>

      {view === 'action' && (
        <>
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
        </>
      )}

      {view === 'all-flags' && (
        <div className="mt-6">
          <SectionCard title="All Quality Flags" subtitle={`${qualityFlags.length} flags from automated quality rules`}>
            <div className="overflow-x-auto max-h-[32rem]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-3">Rule</th>
                    <th className="pb-2 pr-3">Severity</th>
                    <th className="pb-2 pr-3">Facility</th>
                    <th className="pb-2 pr-3">LGA</th>
                    <th className="pb-2 pr-3">Team</th>
                    <th className="pb-2 pr-3">Month</th>
                    <th className="pb-2">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityFlags.map(f => (
                    <tr key={f.id} className="border-b border-border/50 cursor-pointer hover:bg-pale-blue/40 transition-colors" onClick={() => setSelectedFlag(f)}>
                      <td className="py-2 pr-3"><span className="font-mono text-[10px]">{f.ruleId}</span></td>
                      <td className="py-2 pr-3">
                        <span className={f.severity === 'critical' ? 'badge-danger' : f.severity === 'warning' ? 'badge-warning' : 'badge-info'}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="py-2 pr-3 font-medium">{f.facilityName}</td>
                      <td className="py-2 pr-3 text-muted">{getLgaLabel(f.lga)}</td>
                      <td className="py-2 pr-3 text-muted">{f.team}</td>
                      <td className="py-2 pr-3 text-muted">{f.monthLabel ?? '—'}</td>
                      <td className="py-2 text-muted max-w-xs truncate" title={f.recommendation}>{f.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {selectedFlag && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-white shadow-lg overflow-hidden">
              <div className="flex items-center justify-between bg-pale-blue px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{selectedFlag.facilityName}</h3>
                  <p className="text-[11px] text-muted">{getLgaLabel(selectedFlag.lga)} &middot; {selectedFlag.state} &middot; {selectedFlag.team}</p>
                </div>
                <button onClick={() => setSelectedFlag(null)} className="rounded-lg p-1.5 hover:bg-white/60 text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-muted mr-2">{selectedFlag.ruleId}</span>
                      <span className={selectedFlag.severity === 'critical' ? 'badge-danger' : selectedFlag.severity === 'warning' ? 'badge-warning' : 'badge-info'}>{selectedFlag.severity}</span>
                    </div>
                    {selectedFlag.monthLabel && <span className="text-[11px] text-muted">{selectedFlag.monthLabel}</span>}
                  </div>
                  <p className="mt-2 text-xs text-ink">{selectedFlag.explanation}</p>
                  <div className="mt-2 rounded bg-blue-50 px-3 py-2">
                    <p className="text-[11px] text-blue-800"><strong>Recommendation:</strong> {selectedFlag.recommendation}</p>
                  </div>
                </div>
                {qualityFlags.filter(f => f.facilityCode === selectedFlag.facilityCode && f.id !== selectedFlag.id).length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted mb-1">Other flags for this facility</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {qualityFlags.filter(f => f.facilityCode === selectedFlag.facilityCode && f.id !== selectedFlag.id).map(f => (
                        <div key={f.id} className="flex items-center gap-2 rounded border border-border/40 px-2.5 py-1.5 text-[11px] cursor-pointer hover:bg-pale-blue/30" onClick={() => setSelectedFlag(f)}>
                          <span className="font-mono text-[10px] text-muted">{f.ruleId}</span>
                          <span className={f.severity === 'critical' ? 'badge-danger' : f.severity === 'warning' ? 'badge-warning' : 'badge-info'}>{f.severity}</span>
                          <span className="flex-1 truncate text-muted">{f.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
