import { useMemo, useState } from 'react'
import { PageHeader, SectionCard, StatusBadge } from '@/components/ui'
import { useStore } from '@/store'
import { getLgaLabel } from '@/config/geo'

export default function FacilityExplorer() {
  const { facilities } = useStore()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'pre_fname' | 'a_lga' | 'a_outcome' | 'a_date'>('a_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const pageSize = 25

  const filtered = useMemo(() => {
    let list = facilities
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.pre_fname.toLowerCase().includes(q) ||
        f.a_lga.toLowerCase().includes(q) ||
        f.a_team.toLowerCase().includes(q) ||
        f.a_fac.toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [facilities, search, sortKey, sortDir])

  const pageCount = Math.ceil(filtered.length / pageSize)
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortIcon = (key: typeof sortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const [selected, setSelected] = useState<string | null>(null)
  const selectedFac = facilities.find(f => f._uuid === selected)

  return (
    <div>
      <PageHeader title="Facility Explorer" description="Browse and inspect individual facility assessment submissions" />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search facilities, LGAs, teams..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-72"
        />
        <span className="self-center text-xs text-muted">{filtered.length} of {facilities.length} facilities</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Facility List">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted">
                    <th className="pb-2 pr-3 cursor-pointer select-none" onClick={() => toggleSort('pre_fname')}>Facility{sortIcon('pre_fname')}</th>
                    <th className="pb-2 pr-3 cursor-pointer select-none" onClick={() => toggleSort('a_lga')}>LGA{sortIcon('a_lga')}</th>
                    <th className="pb-2 pr-3">State</th>
                    <th className="pb-2 pr-3">Team</th>
                    <th className="pb-2 pr-3 cursor-pointer select-none" onClick={() => toggleSort('a_date')}>Date{sortIcon('a_date')}</th>
                    <th className="pb-2 pr-3 cursor-pointer select-none" onClick={() => toggleSort('a_outcome')}>Status{sortIcon('a_outcome')}</th>
                    <th className="pb-2 pr-3 text-right">V. Ratio</th>
                    <th className="pb-2 text-right">DQ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(f => (
                    <tr
                      key={f._uuid}
                      className={`border-b border-border/50 cursor-pointer hover:bg-light-blue/30 ${selected === f._uuid ? 'bg-light-blue/50' : ''}`}
                      onClick={() => setSelected(f._uuid)}
                    >
                      <td className="py-2 pr-3 font-medium">{f.pre_fname}</td>
                      <td className="py-2 pr-3 text-muted">{getLgaLabel(f.a_lga)}</td>
                      <td className="py-2 pr-3 text-muted capitalize">{f.a_state}</td>
                      <td className="py-2 pr-3 text-muted">{f.a_team}</td>
                      <td className="py-2 pr-3 text-muted">{f.a_date}</td>
                      <td className="py-2 pr-3"><StatusBadge status={f.a_outcome} /></td>
                      <td className="py-2 pr-3 text-right">{f.c_rate?.toFixed(2) ?? '—'}</td>
                      <td className="py-2 text-right">
                        {f.h_dq ? <span className={f.h_dq === 'low' ? 'text-danger font-medium' : f.h_dq === 'medium' ? 'text-amber-600' : 'text-success'}>{f.h_dq}</span> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <div className="flex items-center justify-between mt-3 text-xs text-muted">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-2 py-1 rounded border disabled:opacity-40">Prev</button>
                <span>Page {page + 1} of {pageCount}</span>
                <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} className="px-2 py-1 rounded border disabled:opacity-40">Next</button>
              </div>
            )}
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Facility Detail">
            {selectedFac ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted">Name:</span>
                  <p className="font-medium">{selectedFac.pre_fname}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted">State:</span><p className="capitalize">{selectedFac.a_state}</p></div>
                  <div><span className="text-muted">LGA:</span><p>{getLgaLabel(selectedFac.a_lga)}</p></div>
                  <div><span className="text-muted">Team:</span><p>{selectedFac.a_team}</p></div>
                  <div><span className="text-muted">Supervisor:</span><p>{selectedFac.a_sup}</p></div>
                  <div><span className="text-muted">Visit Date:</span><p>{selectedFac.a_date}</p></div>
                  <div><span className="text-muted">Outcome:</span><p><StatusBadge status={selectedFac.a_outcome} /></p></div>
                  <div><span className="text-muted">Type:</span><p>{selectedFac.a_type}</p></div>
                  <div><span className="text-muted">Stratum:</span><p>{selectedFac.pre_stratum}</p></div>
                </div>
                {selectedFac.a_outcome === 'completed' && (
                  <>
                    <hr className="border-border" />
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-muted">Reported:</span><p className="font-medium">{selectedFac.c_tot_rep ?? '—'}</p></div>
                      <div><span className="text-muted">Verified:</span><p className="font-medium">{selectedFac.c_tot_ver ?? '—'}</p></div>
                      <div><span className="text-muted">V. Ratio:</span><p className="font-medium">{selectedFac.c_rate?.toFixed(3) ?? '—'}</p></div>
                      <div><span className="text-muted">Months Avail:</span><p>{selectedFac.c_months_avail ?? '—'} / 24</p></div>
                      <div><span className="text-muted">Cure Rate:</span><p>{selectedFac.c_cure != null ? `${(selectedFac.c_cure * 100).toFixed(1)}%` : '—'}</p></div>
                      <div><span className="text-muted">DQ Rating:</span><p className="font-medium">{selectedFac.h_dq ?? '—'}</p></div>
                      <div><span className="text-muted">Records Reviewed:</span><p>{selectedFac.d_rev ?? '—'}</p></div>
                      <div><span className="text-muted">Valid Records:</span><p>{selectedFac.d_valid ?? '—'}</p></div>
                      <div><span className="text-muted">RUTF Match:</span><p>{selectedFac.e_match ?? '—'}</p></div>
                      <div><span className="text-muted">Unexplained:</span><p>{selectedFac.e_unexp ?? '—'} sachets</p></div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted py-8 text-center">Select a facility from the list to view details</p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
