import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PageHeader, KpiCard, SectionCard } from '@/components/ui'
import { useStore } from '@/store'
import { SAMPLING_TARGETS, CAREGIVER_TARGET_PER_FACILITY } from '@/config/geo'
import { completedCaregiverInterviews, caregiverTarget } from '@/analytics/indicators'

const CAT_LABELS: Record<string, string> = {
  completed: 'Completed/Discharged', active: 'Active',
  defaulted_referred: 'Defaulted/Referred', substitute: 'Substitute',
}
const CAT_COLORS = ['#059669', '#5A9BBF', '#D97706', '#8BB8D4']
const CONTACT_COLORS: Record<string, string> = { yes: '#059669', no: '#DC2626', untraceable: '#94A3B8' }
const BAR_COLORS = ['#none', '#distance', '#cost', '#stockout', '#staff', '#duties', '#belief', '#other']

export default function CaregiverInterviews() {
  const { caregivers, filters } = useStore()

  const completed = useMemo(() => completedCaregiverInterviews(caregivers), [caregivers])
  const target = useMemo(() => caregiverTarget(filters.state ?? undefined), [filters.state])

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of caregivers) { counts[c.c_cat] = (counts[c.c_cat] ?? 0) + 1 }
    return Object.entries(counts).map(([key, value]) => ({ name: CAT_LABELS[key] ?? key, value }))
  }, [caregivers])

  const contactCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of caregivers) { counts[c.c_contact] = (counts[c.c_contact] ?? 0) + 1 }
    return Object.entries(counts).map(([key, value]) => ({
      name: key === 'yes' ? 'Reached' : key === 'no' ? 'Not reached' : 'Untraceable',
      value,
      color: CONTACT_COLORS[key] ?? '#64748B',
    }))
  }, [caregivers])

  const consentRate = useMemo(() => {
    const reached = caregivers.filter(c => c.c_contact === 'yes')
    const consented = reached.filter(c => c.c_consent === 'yes')
    return reached.length > 0 ? (consented.length / reached.length * 100) : 0
  }, [caregivers])

  const barrierCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of completed) {
      if (c.c_bar && c.c_bar !== 'none') { counts[c.c_bar] = (counts[c.c_bar] ?? 0) + 1 }
    }
    return Object.entries(counts).map(([key, value]) => ({ name: key, value })).sort((a, b) => b.value - a.value)
  }, [completed])

  const attendConfirm = useMemo(() => {
    const responded = completed.filter(c => c.c_attend != null)
    const yes = responded.filter(c => c.c_attend === 'yes').length
    const no = responded.filter(c => c.c_attend === 'no').length
    return { total: responded.length, yes, no }
  }, [completed])

  const facilityCoverage = useMemo(() => {
    const facMap = new Map<string, number>()
    for (const c of completed) { facMap.set(c.a_fac, (facMap.get(c.a_fac) ?? 0) + 1) }
    const counts = [0, 0, 0, 0]
    for (const v of facMap.values()) {
      if (v === 0) counts[0]++
      else if (v === 1) counts[1]++
      else if (v === 2) counts[2]++
      else counts[3]++
    }
    return [
      { name: '0 interviews', value: counts[0] },
      { name: '1 interview', value: counts[1] },
      { name: '2 interviews', value: counts[2] },
      { name: '3+ interviews', value: counts[3] },
    ]
  }, [completed])

  return (
    <div>
      <PageHeader title="Caregiver Interviews" description="Interview achievement, categories, contact outcomes and service verification" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard title="Target" value={target} />
        <KpiCard title="Completed" value={completed.length} color="success" />
        <KpiCard title="Achievement" value={`${(target > 0 ? completed.length / target * 100 : 0).toFixed(1)}%`} />
        <KpiCard title="Consent Rate" value={`${consentRate.toFixed(1)}%`} subtitle="Among reached caregivers" />
        <KpiCard title="Non-attendance" value={attendConfirm.no} subtitle={`${attendConfirm.total} responded`} color={attendConfirm.no > 0 ? 'danger' : 'default'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Interview Categories">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {catCounts.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Contact Outcomes">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={contactCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {contactCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Facility Interview Coverage" subtitle="Completed interviews per facility">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityCoverage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#8BB8D4" name="Facilities" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Access Barriers" subtitle="Among completed interviews">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barrierCounts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#D97706" name="Caregivers" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {attendConfirm.no > 0 && (
        <div className="mt-6">
          <SectionCard title="Potential Patient-Record Discrepancies" subtitle="Caregivers reporting non-attendance at the facility">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">
                <strong>{attendConfirm.no}</strong> caregiver(s) ({attendConfirm.total > 0 ? (attendConfirm.no / attendConfirm.total * 100).toFixed(1) : 0}%)
                reported that the child never attended the facility.
              </p>
              <p className="mt-2 text-xs text-red-600">
                These cases require investigation. This is not automatically evidence of fabricated records.
              </p>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
