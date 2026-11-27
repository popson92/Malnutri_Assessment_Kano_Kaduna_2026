import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader, SectionCard, KpiCard } from '@/components/ui'
import { useStore } from '@/store'
import { lgaSummaries, completedFacilities } from '@/analytics/indicators'
import { Layers, Building2, Users, CheckCircle, AlertTriangle, Package } from 'lucide-react'

export default function LgaDeepDive() {
  const { facilities, caregivers, filters, setFilter } = useStore()
  const lgaData = useMemo(() => lgaSummaries(facilities, caregivers), [facilities, caregivers])
  const completed = useMemo(() => completedFacilities(facilities), [facilities])

  const selectedLga = filters.lga
  const lgaProfile = selectedLga ? lgaData.find(l => l.lga === selectedLga) : null

  const sortedLgas = useMemo(() =>
    [...lgaData].sort((a, b) => b.completed - a.completed).filter(l => l.sampled > 0),
  [lgaData])

  const lgaFacilities = useMemo(() =>
    selectedLga ? completed.filter(f => f.a_lga === selectedLga) : [],
  [completed, selectedLga])

  if (!selectedLga) {
    return (
      <div>
        <PageHeader
          title="LGA Deep Dive"
          description="Select an LGA from the filter bar or the table below for a comprehensive profile"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
          <KpiCard title="Total LGAs" value={lgaData.filter(l => l.sampled > 0).length} icon={<Layers size={18} />} />
          <KpiCard title="LGAs Reached" value={lgaData.filter(l => l.visited > 0).length} icon={<CheckCircle size={18} />} rail="success" />
          <KpiCard title="Fully Complete" value={lgaData.filter(l => l.completed >= l.sampled && l.sampled > 0).length} icon={<Building2 size={18} />} rail="primary" />
          <KpiCard title="With Flags" value={lgaData.filter(l => l.qualityFlags > 0).length} icon={<AlertTriangle size={18} />} rail="warning" />
        </div>

        <SectionCard title="LGA Completion Overview" subtitle="Click an LGA to view its full profile">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">State</th>
                  <th className="pb-2 pr-3">LGA</th>
                  <th className="pb-2 pr-3 text-right">Target</th>
                  <th className="pb-2 pr-3 text-right">Visited</th>
                  <th className="pb-2 pr-3 text-right">Completed</th>
                  <th className="pb-2 pr-3 text-right">%</th>
                  <th className="pb-2 pr-3 text-right">CG Done</th>
                  <th className="pb-2 text-right">Flags</th>
                </tr>
              </thead>
              <tbody>
                {sortedLgas.map(l => (
                  <tr
                    key={l.lga}
                    className="border-b border-border/50 cursor-pointer hover:bg-pale-blue transition-colors"
                    onClick={() => setFilter('lga', l.lga)}
                  >
                    <td className="py-2 pr-3 capitalize">{l.state}</td>
                    <td className="py-2 pr-3 font-medium">{l.lgaLabel}</td>
                    <td className="py-2 pr-3 text-right">{l.sampled}</td>
                    <td className="py-2 pr-3 text-right">{l.visited}</td>
                    <td className="py-2 pr-3 text-right">{l.completed}</td>
                    <td className="py-2 pr-3 text-right">
                      {l.sampled > 0 ? `${Math.round(l.completed / l.sampled * 100)}%` : '—'}
                    </td>
                    <td className="py-2 pr-3 text-right">{l.caregiverCompleted}</td>
                    <td className="py-2 text-right">
                      {l.qualityFlags > 0 ? (
                        <span className="badge-warning">{l.qualityFlags}</span>
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
      </div>
    )
  }

  // LGA profile view
  const totalRep = lgaFacilities.reduce((s, f) => s + (f.c_tot_rep ?? 0), 0)
  const totalVer = lgaFacilities.reduce((s, f) => s + (f.c_tot_ver ?? 0), 0)
  const stockoutFacs = lgaFacilities.filter(f => (f.c_stock_months ?? 0) > 0).length
  const lowDq = lgaFacilities.filter(f => f.h_dq === 'low').length

  return (
    <div>
      <PageHeader
        title={`${lgaProfile?.lgaLabel ?? selectedLga} — LGA Profile`}
        description={`${lgaProfile?.state ?? ''} State · Detailed LGA-level assessment profile`}
        action={
          <button
            onClick={() => setFilter('lga', null)}
            className="text-xs text-primary hover:underline"
          >
            ← All LGAs
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <KpiCard title="Target" value={lgaProfile?.sampled ?? 0} icon={<Building2 size={18} />} />
        <KpiCard title="Completed" value={lgaProfile?.completed ?? 0} icon={<CheckCircle size={18} />} rail="success" />
        <KpiCard title="Reported Admissions" value={totalRep.toLocaleString()} icon={<Users size={18} />} />
        <KpiCard title="Verified Admissions" value={totalVer.toLocaleString()} icon={<CheckCircle size={18} />} rail="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Facility Completion" subtitle="Facilities in this LGA">
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">Facility</th>
                  <th className="pb-2 pr-3">Team</th>
                  <th className="pb-2 pr-3">Outcome</th>
                  <th className="pb-2 pr-3 text-right">Reported</th>
                  <th className="pb-2 text-right">Verified</th>
                </tr>
              </thead>
              <tbody>
                {lgaFacilities.map(f => (
                  <tr key={f._uuid} className="border-b border-border/50">
                    <td className="py-1.5 pr-3 font-medium">{f.pre_fname}</td>
                    <td className="py-1.5 pr-3 text-muted">{f.a_team}</td>
                    <td className="py-1.5 pr-3">
                      <span className={f.a_outcome === 'completed' ? 'badge-success' : 'badge-warning'}>
                        {f.a_outcome}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3 text-right">{f.c_tot_rep ?? '—'}</td>
                    <td className="py-1.5 text-right">{f.c_tot_ver ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="LGA Summary">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">Stockout facilities</span>
              <span className="font-medium">{stockoutFacs}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">Low data quality</span>
              <span className={`font-medium ${lowDq > 0 ? 'text-danger' : ''}`}>{lowDq}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">Caregiver interviews</span>
              <span className="font-medium">{lgaProfile?.caregiverCompleted ?? 0} / {lgaProfile?.caregiverTarget ?? 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">Replacements</span>
              <span className="font-medium">{lgaProfile?.replacements ?? 0}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
