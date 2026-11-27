import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, ReferenceLine } from 'recharts'
import { PageHeader, SectionCard, KpiCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities, verificationRatio, rutfDiscrepancySummary } from '@/analytics/indicators'
import { evaluateAllRules, flagSummary } from '@/analytics/qualityRules'
import { getLgaLabel } from '@/config/geo'
import { ClipboardList, CheckCircle, Package, AlertTriangle, TrendingUp } from 'lucide-react'

const QUESTIONS = [
  { id: 1, short: 'Admissions Verified', title: 'How many SAM admissions are reported, and how many are verified?' },
  { id: 2, short: 'Treatment Compliance', title: 'How many verified admissions received protocol-compliant RUTF treatment?' },
  { id: 3, short: 'Divergence', title: 'Where do admissions and RUTF flows diverge?' },
  { id: 4, short: 'Explanations', title: 'What explains the divergence?' },
  { id: 5, short: 'Expansion', title: 'Where would additional funding expand effective treatment?' },
] as const

export default function AssessmentFindings() {
  const { facilities, caregivers } = useStore()
  const [activeQ, setActiveQ] = useState(1)
  const completed = useMemo(() => completedFacilities(facilities), [facilities])
  const vRatio = useMemo(() => verificationRatio(facilities), [facilities])
  const rutf = useMemo(() => rutfDiscrepancySummary(facilities), [facilities])
  const flags = useMemo(() => evaluateAllRules(facilities), [facilities])
  const summary = useMemo(() => flagSummary(flags), [flags])

  const totalRep = completed.reduce((s, f) => s + (f.c_tot_rep ?? 0), 0)
  const totalVer = completed.reduce((s, f) => s + (f.c_tot_ver ?? 0), 0)
  const totalImam = completed.reduce((s, f) => s + (f.c_tot_imam ?? 0), 0)
  const totalDhis2 = completed.reduce((s, f) => s + (f.c_tot_dhis2 ?? 0), 0)
  const totalRevRecords = completed.reduce((s, f) => s + (f.d_rev ?? 0), 0)
  const totalValid = completed.reduce((s, f) => s + (f.d_valid ?? 0), 0)
  const totalInvalid = completed.reduce((s, f) => s + (f.d_invalid ?? 0), 0)
  const totalUnver = completed.reduce((s, f) => s + (f.d_unver ?? 0), 0)
  const totalAlt = completed.reduce((s, f) => s + (f.d_alt ?? 0), 0)
  const totalComorb = completed.reduce((s, f) => s + (f.d_comorb ?? 0), 0)
  const totalCured = completed.reduce((s, f) => s + (f.c_tot_cured ?? 0), 0)
  const totalDef = completed.reduce((s, f) => s + (f.c_tot_def ?? 0), 0)
  const totalDied = completed.reduce((s, f) => s + (f.c_tot_died ?? 0), 0)
  const totalExits = completed.reduce((s, f) => s + (f.c_exits ?? 0), 0)
  const stockoutFacilities = completed.filter(f => (f.c_stock_months ?? 0) > 0).length

  const verificationScatter = useMemo(() =>
    completed
      .filter(f => f.c_tot_imam != null && f.c_tot_ver != null)
      .map(f => ({
        name: f.pre_fname,
        imam: f.c_tot_imam ?? 0,
        verified: f.c_tot_ver ?? 0,
        ratio: f.c_rate ?? 0,
      }))
  , [completed])

  const recordClassification = useMemo(() => [
    { name: 'Valid', value: totalValid, color: '#059669' },
    { name: 'Invalid', value: totalInvalid, color: '#DC2626' },
    { name: 'Unverifiable', value: totalUnver, color: '#D97706' },
    { name: 'Alternative', value: totalAlt, color: '#6366F1' },
    { name: 'Comorbidity', value: totalComorb, color: '#EC4899' },
  ].filter(d => d.value > 0), [totalValid, totalInvalid, totalUnver, totalAlt, totalComorb])

  const outcomeBreakdown = useMemo(() => [
    { name: 'Cured', value: totalCured, color: '#059669' },
    { name: 'Defaulted', value: totalDef, color: '#D97706' },
    { name: 'Died', value: totalDied, color: '#DC2626' },
    { name: 'Other Exits', value: Math.max(0, totalExits - totalCured - totalDef - totalDied), color: '#94A3B8' },
  ].filter(d => d.value > 0), [totalCured, totalDef, totalDied, totalExits])

  const rutfScatter = useMemo(() =>
    completed
      .filter(f => f.c_tot_ver != null && f.c_rdisp != null && f.c_rdisp > 0)
      .map(f => ({
        name: f.pre_fname,
        admissions: f.c_tot_ver ?? 0,
        dispensed: f.c_rdisp ?? 0,
        unexplained: f.e_unexp ?? 0,
      }))
  , [completed])

  const challengeData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const f of completed) {
      for (const m of f.h_mech) {
        counts[m] = (counts[m] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: completed.length > 0 ? (value / completed.length * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [completed])

  const funcDist = useMemo(() => {
    const fully = completed.filter(f => f.h_func_cls === 'fully').length
    const partially = completed.filter(f => f.h_func_cls === 'partially').length
    const non = completed.filter(f => f.h_func_cls === 'non').length
    return [
      { name: 'Fully functional', value: fully, color: '#059669' },
      { name: 'Partially functional', value: partially, color: '#D97706' },
      { name: 'Non-functional', value: non, color: '#DC2626' },
    ].filter(d => d.value > 0)
  }, [completed])

  const expansionData = useMemo(() => {
    const lgaMap = new Map<string, { lga: string; state: string; total: number; completed: number; functional: number; stockouts: number; trained: number; trainedCount: number }>()
    for (const f of completed) {
      let lg = lgaMap.get(f.a_lga)
      if (!lg) {
        lg = { lga: f.a_lga, state: f.a_state, total: 0, completed: 0, functional: 0, stockouts: 0, trained: 0, trainedCount: 0 }
        lgaMap.set(f.a_lga, lg)
      }
      lg.total++
      lg.completed++
      if (f.h_func_cls === 'fully') lg.functional++
      if ((f.c_stock_months ?? 0) > 0) lg.stockouts++
      if (f.b9 != null) { lg.trained += f.b9; lg.trainedCount++ }
    }
    return [...lgaMap.values()]
      .map(l => ({
        lgaLabel: getLgaLabel(l.lga),
        state: l.state,
        facilities: l.total,
        functionalPct: l.total > 0 ? (l.functional / l.total * 100) : 0,
        stockoutPct: l.total > 0 ? (l.stockouts / l.total * 100) : 0,
        avgTrained: l.trainedCount > 0 ? (l.trained / l.trainedCount) : 0,
      }))
      .sort((a, b) => b.functionalPct - a.functionalPct)
  }, [completed])

  return (
    <div>
      <PageHeader
        title="Assessment Findings"
        description="Analytical findings organised around the five key assessment questions"
      />

      <div className="mb-4 rounded-xl bg-pale-blue border border-blue-200 p-4">
        <p className="text-xs text-primary font-medium">
          Of the children Kano and Kaduna report as treated for SAM, how many were genuine SAM cases who received appropriate treatment?
        </p>
        <p className="text-[10px] text-muted mt-1">
          Results below are based on {completed.length} completed facility assessments from pilot data. These are observed sample results, not formal weighted estimates.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mb-6">
        {QUESTIONS.map(q => (
          <button key={q.id} onClick={() => setActiveQ(q.id)} className={`tab-btn text-xs ${activeQ === q.id ? 'tab-btn-active' : ''}`}>
            Q{q.id}: {q.short}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">Question {activeQ}: {QUESTIONS[activeQ - 1].title}</h3>
      </div>

      {activeQ === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <KpiCard title="IMAM Admissions" value={totalImam.toLocaleString()} icon={<ClipboardList size={18} />} />
            <KpiCard title="DHIS2 Admissions" value={totalDhis2.toLocaleString()} icon={<ClipboardList size={18} />} />
            <KpiCard title="Verified Admissions" value={totalVer.toLocaleString()} icon={<CheckCircle size={18} />} rail="success" />
            <KpiCard title="Verification Ratio" value={vRatio ? `${(vRatio * 100).toFixed(1)}%` : '—'} icon={<TrendingUp size={18} />} rail="primary" />
            <KpiCard title="Quality Flags" value={summary.total} subtitle={`${summary.critical} critical`} icon={<AlertTriangle size={18} />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Reported vs Verified Admissions" subtitle="Each dot is a facility; diagonal = perfect match">
              <div className="h-64">
                {verificationScatter.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                      <XAxis type="number" dataKey="imam" name="IMAM Reported" tick={{ fontSize: 10 }} label={{ value: 'IMAM Reported', position: 'bottom', fontSize: 10 }} />
                      <YAxis type="number" dataKey="verified" name="Register Verified" tick={{ fontSize: 10 }} label={{ value: 'Verified', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <ZAxis range={[30, 30]} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => v.toLocaleString()} />
                      <ReferenceLine segment={[{ x: 0, y: 0 }, { x: Math.max(...verificationScatter.map(d => Math.max(d.imam, d.verified)), 100), y: Math.max(...verificationScatter.map(d => Math.max(d.imam, d.verified)), 100) }]} stroke="#94A3B8" strokeDasharray="5 5" />
                      <Scatter data={verificationScatter} fill="#3678B9" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted flex items-center justify-center h-full">No verification data available</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Admissions Source Comparison" subtitle="IMAM register vs DHIS2 vs Register-verified">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'IMAM Register', value: totalImam },
                    { name: 'DHIS2', value: totalDhis2 },
                    { name: 'Register Verified', value: totalVer },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#3678B9" name="Admissions" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeQ === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <KpiCard title="Records Reviewed" value={totalRevRecords.toLocaleString()} icon={<ClipboardList size={18} />} />
            <KpiCard title="Valid Records" value={totalValid.toLocaleString()} icon={<CheckCircle size={18} />} rail="success" />
            <KpiCard title="Validation Rate" value={totalRevRecords > 0 ? `${(totalValid / totalRevRecords * 100).toFixed(1)}%` : '—'} icon={<TrendingUp size={18} />} />
            <KpiCard title="Cure Rate" value={totalExits > 0 ? `${(totalCured / totalExits * 100).toFixed(1)}%` : '—'} rail="success" />
            <KpiCard title="Default Rate" value={totalExits > 0 ? `${(totalDef / totalExits * 100).toFixed(1)}%` : '—'} rail="warning" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Patient Record Classification" subtitle="Verification status of reviewed records">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recordClassification} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" name="Records" radius={[0, 4, 4, 0]}>
                      {recordClassification.map((d, i) => (
                        <Bar key={i} dataKey="value" fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Treatment Outcomes" subtitle="Discharge classification of exits">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outcomeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" name="Exits" radius={[4, 4, 0, 0]}>
                      {outcomeBreakdown.map((d, i) => (
                        <Bar key={i} dataKey="value" fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeQ === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard title="RUTF Mismatched" value={rutf.mismatched} icon={<AlertTriangle size={18} />} rail="warning" />
            <KpiCard title="RUTF Matched" value={rutf.matched} icon={<CheckCircle size={18} />} rail="success" />
            <KpiCard title="Stockout Facilities" value={stockoutFacilities} icon={<Package size={18} />} rail="danger" />
            <KpiCard title="Surplus Facilities" value={rutf.positive} icon={<TrendingUp size={18} />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Admissions vs RUTF Dispensed" subtitle="Each dot is a facility; pattern indicates commodity alignment">
              <div className="h-64">
                {rutfScatter.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                      <XAxis type="number" dataKey="admissions" name="Verified Admissions" tick={{ fontSize: 10 }} />
                      <YAxis type="number" dataKey="dispensed" name="RUTF Dispensed" tick={{ fontSize: 10 }} />
                      <ZAxis range={[30, 30]} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Scatter data={rutfScatter} fill="#D97706" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted flex items-center justify-center h-full">No RUTF dispensing data available</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Commodity Accountability" subtitle="RUTF stock match and unexplained balance">
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-2xl font-bold text-green-700">{rutf.matched}</p>
                    <p className="text-[10px] text-green-600 mt-1">Physical count matches records</p>
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-2xl font-bold text-red-700">{rutf.mismatched}</p>
                    <p className="text-[10px] text-red-600 mt-1">Physical count does not match</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-lg font-bold text-ink">{rutf.positive}</p>
                    <p className="text-[10px] text-muted mt-1">Surplus (more physical)</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-lg font-bold text-ink">{rutf.negative}</p>
                    <p className="text-[10px] text-muted mt-1">Deficit (less physical)</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeQ === 4 && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Health Worker Reported Challenges" subtitle="Challenges affecting SAM treatment delivery">
              <div className="h-64">
                {challengeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={challengeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} width={140} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v} facilities`, 'Count']} />
                      <Bar dataKey="value" fill="#65A5DF" name="Facilities" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted flex items-center justify-center h-full">No challenge data available</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Facility Functionality" subtitle="Assessment-team classification of treatment site status">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funcDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DFE7F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" name="Facilities" radius={[4, 4, 0, 0]}>
                      {funcDist.map((d, i) => (
                        <Bar key={i} dataKey="value" fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Contributing Factors Summary">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 py-2">
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <p className="text-lg font-bold text-ink">{stockoutFacilities}</p>
                <p className="text-[10px] text-muted">Facilities with stockout months</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <p className="text-lg font-bold text-ink">{completed.filter(f => f.h_dq === 'low').length}</p>
                <p className="text-[10px] text-muted">Low data quality facilities</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <p className="text-lg font-bold text-ink">{completed.filter(f => f.h_func_cls === 'non').length}</p>
                <p className="text-[10px] text-muted">Non-functional sites</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3 text-center">
                <p className="text-lg font-bold text-ink">{caregivers.filter(c => c.c_contact === 'no' || c.c_contact === 'untraceable').length}</p>
                <p className="text-[10px] text-muted">Unreachable caregivers</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeQ === 5 && (
        <div className="space-y-6">
          <SectionCard title="LGA Opportunity Profiles" subtitle="Functionality, stockout rate and staffing by LGA">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-3">LGA</th>
                    <th className="pb-2 pr-3">State</th>
                    <th className="pb-2 pr-3 text-right">Facilities</th>
                    <th className="pb-2 pr-3 text-right">Functional %</th>
                    <th className="pb-2 pr-3 text-right">Stockout %</th>
                    <th className="pb-2 text-right">Avg Trained Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {expansionData.map(l => (
                    <tr key={l.lgaLabel} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{l.lgaLabel}</td>
                      <td className="py-2 pr-3 text-muted capitalize">{l.state}</td>
                      <td className="py-2 pr-3 text-right">{l.facilities}</td>
                      <td className="py-2 pr-3 text-right">
                        <span className={l.functionalPct >= 80 ? 'text-green-600' : l.functionalPct >= 50 ? 'text-amber-600' : 'text-red-600'}>
                          {l.functionalPct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <span className={l.stockoutPct > 50 ? 'text-red-600' : l.stockoutPct > 0 ? 'text-amber-600' : 'text-green-600'}>
                          {l.stockoutPct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2 text-right">{l.avgTrained > 0 ? l.avgTrained.toFixed(1) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="rounded-xl bg-pale-blue border border-blue-200 p-4">
            <p className="text-xs text-muted">
              Formal expansion opportunity classification requires approved thresholds for functionality, commodity readiness,
              and staffing levels. The profiles above provide the data inputs; classification will be applied once thresholds
              are confirmed with the assessment team.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
