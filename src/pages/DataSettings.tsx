import { PageHeader, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { SAMPLING_TARGETS } from '@/config/geo'
import { REFERENCE_MONTHS, DEFAULT_PARAMS } from '@/config/fieldMappings'

export default function DataSettings() {
  const { syncStatus } = useStore()
  const dataMode = syncStatus.dataMode === 'development' ? 'dev' : syncStatus.dataMode

  return (
    <div>
      <PageHeader title="Data & Settings" description="Data source configuration, sync status and system parameters" />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Data Mode">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${dataMode === 'production' ? 'bg-success' : dataMode === 'testing' ? 'bg-amber-500' : 'bg-primary'}`} />
              <span className="text-sm font-medium capitalize">{dataMode}</span>
            </div>
            <p className="text-xs text-muted">
              {dataMode === 'dev' && 'Using locally generated development fixtures. No external API calls are made.'}
              {dataMode === 'testing' && 'Using test data from KoboToolbox API with known dummy submissions.'}
              {dataMode === 'production' && 'Connected to live KoboToolbox submissions. Data is real and confidential.'}
            </p>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs">
              <p className="font-medium text-blue-800">To switch data modes:</p>
              <p className="mt-1 text-blue-700">Set <code className="bg-blue-100 px-1 rounded">DATA_MODE</code> in your <code className="bg-blue-100 px-1 rounded">.env</code> file to <code className="bg-blue-100 px-1 rounded">dev</code>, <code className="bg-blue-100 px-1 rounded">testing</code>, or <code className="bg-blue-100 px-1 rounded">production</code> and restart the application.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Sync Status">
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted">Last Sync:</span><p className="font-medium">{syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}</p></div>
              <div><span className="text-muted">Status:</span><p className={syncStatus.connected ? 'text-success' : 'text-muted'}>{syncStatus.connected ? 'Connected' : 'Idle'}</p></div>
              <div><span className="text-muted">Facility Submissions:</span><p className="font-medium">{syncStatus.facilityCount}</p></div>
              <div><span className="text-muted">Caregiver Submissions:</span><p className="font-medium">{syncStatus.caregiverCount}</p></div>
            </div>
            {syncStatus.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-red-800 font-medium">Sync Error</p>
                <p className="text-red-600 mt-1">{syncStatus.error}</p>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Sampling Parameters">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="pb-2 pr-4">Parameter</th>
                  <th className="pb-2 pr-4 text-right">Kano</th>
                  <th className="pb-2 pr-4 text-right">Kaduna</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">LGAs</td>
                  <td className="py-2 pr-4 text-right">{SAMPLING_TARGETS.kano.lgas}</td>
                  <td className="py-2 pr-4 text-right">{SAMPLING_TARGETS.kaduna.lgas}</td>
                  <td className="py-2 text-right font-medium">{SAMPLING_TARGETS.total.lgas}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">Facility Target</td>
                  <td className="py-2 pr-4 text-right">{SAMPLING_TARGETS.kano.facilities}</td>
                  <td className="py-2 pr-4 text-right">{SAMPLING_TARGETS.kaduna.facilities}</td>
                  <td className="py-2 text-right font-medium">{SAMPLING_TARGETS.total.facilities}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">Caregiver Target</td>
                  <td className="py-2 pr-4 text-right">{SAMPLING_TARGETS.kano.facilities * 3}</td>
                  <td className="py-2 pr-4 text-right">{SAMPLING_TARGETS.kaduna.facilities * 3}</td>
                  <td className="py-2 text-right font-medium">{SAMPLING_TARGETS.total.facilities * 3}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="RUTF Parameters">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">Sachets per carton</span>
              <span className="font-medium">{DEFAULT_PARAMS.sachetsPerCarton}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">Sachets per treatment course</span>
              <span className="font-medium">{DEFAULT_PARAMS.sachetsPerCourse}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">Wastage allowance</span>
              <span className="font-medium">{(DEFAULT_PARAMS.wastageAllowance * 100).toFixed(0)}%</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Reference Period">
          <div className="space-y-2 text-xs">
            <p className="text-muted">{REFERENCE_MONTHS.length} months: {REFERENCE_MONTHS[0]} to {REFERENCE_MONTHS[REFERENCE_MONTHS.length - 1]}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {REFERENCE_MONTHS.map(m => (
                <span key={m} className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">{m}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="KoboToolbox Configuration">
          <div className="space-y-2 text-xs">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-amber-800 font-medium">Credentials are stored in a local .env file (Git-ignored)</p>
              <p className="mt-1 text-amber-700">The API token is never exposed in browser code. All KoboToolbox API calls are proxied through Netlify Functions.</p>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted">Base URL</span>
                <span className="font-medium">{syncStatus.lastSync ? '(configured)' : 'Not configured'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted">Facility Asset</span>
                <span className="font-medium">{syncStatus.lastSync ? '(configured)' : 'Not configured'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted">Caregiver Asset</span>
                <span className="font-medium">{syncStatus.lastSync ? '(configured)' : 'Not configured'}</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
