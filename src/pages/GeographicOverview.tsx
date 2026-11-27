import { useMemo } from 'react'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { lgaSummaries } from '@/analytics/indicators'
import { LGA_MAPPINGS, SAMPLING_TARGETS } from '@/config/geo'

export default function GeographicOverview() {
  const { facilities, caregivers } = useStore()

  const lgaData = useMemo(() => lgaSummaries(facilities, caregivers), [facilities, caregivers])
  const lgasWithVisits = lgaData.filter(l => l.visited > 0)
  const lgasCovered = lgasWithVisits.length
  const lgasWithCompleted = lgaData.filter(l => l.completed > 0).length

  const kanoLgas = lgaData.filter(l => l.state === 'kano').sort((a, b) => b.completed - a.completed)
  const kadunaLgas = lgaData.filter(l => l.state === 'kaduna').sort((a, b) => b.completed - a.completed)

  return (
    <div>
      <PageHeader title="Geographic Overview" description="LGA-level coverage and geographic distribution of fieldwork" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard title="Total LGAs" value={LGA_MAPPINGS.length} />
        <KpiCard title="LGAs Visited" value={lgasCovered} subtitle={`${(lgasCovered / LGA_MAPPINGS.length * 100).toFixed(0)}% coverage`} />
        <KpiCard title="LGAs with Completions" value={lgasWithCompleted} color="success" />
        <KpiCard title="LGAs Pending" value={LGA_MAPPINGS.length - lgasCovered} color={LGA_MAPPINGS.length - lgasCovered > 0 ? 'warning' : 'default'} />
      </div>

      <div className="mt-6">
        <SectionCard title="Map View" subtitle="Interactive LGA choropleth map will render when boundary GeoJSON is loaded">
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <div className="text-center text-muted">
              <p className="text-sm font-medium">Map loading...</p>
              <p className="text-xs mt-1">Boundary GeoJSON will be processed from the shapefile during Phase 3</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Kano State LGAs" subtitle={`${SAMPLING_TARGETS.kano.lgas} LGAs, ${SAMPLING_TARGETS.kano.facilities} facility target`}>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">LGA</th>
                  <th className="pb-2 pr-3 text-right">Target</th>
                  <th className="pb-2 pr-3 text-right">Visited</th>
                  <th className="pb-2 pr-3 text-right">Completed</th>
                  <th className="pb-2 pr-3 text-right">CG Done</th>
                  <th className="pb-2 text-right">Flags</th>
                </tr>
              </thead>
              <tbody>
                {kanoLgas.map(l => (
                  <tr key={l.lga} className="border-b border-border/50">
                    <td className="py-1.5 pr-3 font-medium">{l.lgaLabel}</td>
                    <td className="py-1.5 pr-3 text-right text-muted">{l.sampled}</td>
                    <td className="py-1.5 pr-3 text-right">{l.visited}</td>
                    <td className="py-1.5 pr-3 text-right text-success">{l.completed}</td>
                    <td className="py-1.5 pr-3 text-right">{l.caregiverCompleted}</td>
                    <td className="py-1.5 text-right">{l.qualityFlags > 0 ? <span className="text-danger">{l.qualityFlags}</span> : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Kaduna State LGAs" subtitle={`${SAMPLING_TARGETS.kaduna.lgas} LGAs, ${SAMPLING_TARGETS.kaduna.facilities} facility target`}>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-3">LGA</th>
                  <th className="pb-2 pr-3 text-right">Target</th>
                  <th className="pb-2 pr-3 text-right">Visited</th>
                  <th className="pb-2 pr-3 text-right">Completed</th>
                  <th className="pb-2 pr-3 text-right">CG Done</th>
                  <th className="pb-2 text-right">Flags</th>
                </tr>
              </thead>
              <tbody>
                {kadunaLgas.map(l => (
                  <tr key={l.lga} className="border-b border-border/50">
                    <td className="py-1.5 pr-3 font-medium">{l.lgaLabel}</td>
                    <td className="py-1.5 pr-3 text-right text-muted">{l.sampled}</td>
                    <td className="py-1.5 pr-3 text-right">{l.visited}</td>
                    <td className="py-1.5 pr-3 text-right text-success">{l.completed}</td>
                    <td className="py-1.5 pr-3 text-right">{l.caregiverCompleted}</td>
                    <td className="py-1.5 text-right">{l.qualityFlags > 0 ? <span className="text-danger">{l.qualityFlags}</span> : '0'}</td>
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
