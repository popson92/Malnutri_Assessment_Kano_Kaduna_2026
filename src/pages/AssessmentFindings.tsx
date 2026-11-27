import { useState, useMemo } from 'react'
import { PageHeader, SectionCard, KpiCard } from '@/components/ui'
import { useStore } from '@/store'
import { completedFacilities, verificationRatio, rutfDiscrepancySummary } from '@/analytics/indicators'
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

  const totalRep = completed.reduce((s, f) => s + (f.c_tot_rep ?? 0), 0)
  const totalVer = completed.reduce((s, f) => s + (f.c_tot_ver ?? 0), 0)
  const totalRevRecords = completed.reduce((s, f) => s + (f.d_rev ?? 0), 0)
  const totalValid = completed.reduce((s, f) => s + (f.d_valid ?? 0), 0)
  const totalRutfTreated = completed.filter(f => f.d_valid != null && f.d_valid > 0).length
  const stockoutFacilities = completed.filter(f => (f.c_stock_months ?? 0) > 0).length

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

      {/* Question tabs */}
      <div className="flex flex-wrap gap-1 mb-6">
        {QUESTIONS.map(q => (
          <button
            key={q.id}
            onClick={() => setActiveQ(q.id)}
            className={`tab-btn text-xs ${activeQ === q.id ? 'tab-btn-active' : ''}`}
          >
            Q{q.id}: {q.short}
          </button>
        ))}
      </div>

      {/* Active question */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">
          Question {activeQ}: {QUESTIONS[activeQ - 1].title}
        </h3>
      </div>

      {activeQ === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard title="Reported Admissions" value={totalRep.toLocaleString()} icon={<ClipboardList size={18} />} />
            <KpiCard title="Verified Admissions" value={totalVer.toLocaleString()} icon={<CheckCircle size={18} />} rail="success" />
            <KpiCard title="Verification Ratio" value={vRatio ? `${(vRatio * 100).toFixed(1)}%` : '—'} icon={<TrendingUp size={18} />} rail="primary" />
            <KpiCard title="Facilities Assessed" value={completed.length} icon={<ClipboardList size={18} />} />
          </div>
          <SectionCard title="Reported vs Verified Admissions" subtitle="By completed facility">
            <p className="text-xs text-muted">Detailed verification charts will be rendered here with full facility-level comparison data.</p>
          </SectionCard>
        </div>
      )}

      {activeQ === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard title="Records Reviewed" value={totalRevRecords.toLocaleString()} icon={<ClipboardList size={18} />} />
            <KpiCard title="Valid Records" value={totalValid.toLocaleString()} icon={<CheckCircle size={18} />} rail="success" />
            <KpiCard title="Fac. with Valid Records" value={totalRutfTreated} icon={<Package size={18} />} rail="primary" />
            <KpiCard title="Validation Rate" value={totalRevRecords > 0 ? `${(totalValid / totalRevRecords * 100).toFixed(1)}%` : '—'} icon={<TrendingUp size={18} />} />
          </div>
          <SectionCard title="Patient Record Verification" subtitle="Classification of reviewed records">
            <p className="text-xs text-muted">Record validation breakdown and treatment modality analysis will be shown here.</p>
          </SectionCard>
        </div>
      )}

      {activeQ === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard title="RUTF Discrepancies" value={rutf.mismatched} icon={<AlertTriangle size={18} />} rail="warning" />
            <KpiCard title="RUTF Matched" value={rutf.matched} icon={<CheckCircle size={18} />} rail="success" />
            <KpiCard title="Stockout Facilities" value={stockoutFacilities} icon={<Package size={18} />} rail="danger" />
            <KpiCard title="Positive Unexplained" value={rutf.positive} icon={<TrendingUp size={18} />} />
          </div>
          <SectionCard title="Admissions vs RUTF-Implied Courses" subtitle="Facility-level comparison">
            <p className="text-xs text-muted">Commodity flow analysis and discrepancy mapping will be rendered here.</p>
          </SectionCard>
        </div>
      )}

      {activeQ === 4 && (
        <SectionCard title="Explanatory Factors" subtitle="Health worker and assessment-team reported explanations">
          <p className="text-xs text-muted">
            Cross-tabulations linking health worker challenges, assessment-team observations, and caregiver verification findings to observed discrepancies.
            This section will be populated as Health Worker Perspectives data is fully analysed.
          </p>
        </SectionCard>
      )}

      {activeQ === 5 && (
        <SectionCard title="Expansion Opportunity Profiles" subtitle="LGA-level opportunity classification">
          <p className="text-xs text-muted">
            LGA opportunity profiles based on service availability, functionality, staffing, commodity readiness and access constraints.
            Classification requires approved thresholds and additional data sources not yet confirmed.
          </p>
        </SectionCard>
      )}
    </div>
  )
}
