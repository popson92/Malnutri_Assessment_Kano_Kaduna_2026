import { useState, useRef, useEffect, useMemo } from 'react'
import { useStore } from '@/store'
import { getStateLabel, getLgaLabel, LGA_MAPPINGS } from '@/config/geo'
import { X, Search, ChevronDown } from 'lucide-react'

export function FilterBar() {
  const { filters, setFilter, resetFilters, allFacilities, facilities } = useStore()

  const states = ['kano', 'kaduna'] as const
  const lgas = LGA_MAPPINGS
    .filter(m => !filters.state || m.state === filters.state)
    .map(m => m.koboCode)

  const teams = [...new Set(allFacilities.map(f => f.a_team).filter(Boolean))].sort()

  const facilityOptions = useMemo(() => {
    let pool = allFacilities
    if (filters.state) pool = pool.filter(f => f.a_state === filters.state)
    if (filters.lga) pool = pool.filter(f => f.a_lga === filters.lga)
    const seen = new Map<string, string>()
    for (const f of pool) {
      if (!seen.has(f.a_fac)) seen.set(f.a_fac, f.pre_fname)
    }
    return [...seen.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allFacilities, filters.state, filters.lga])

  const hasFilters = filters.state || filters.lga || filters.team || filters.facility

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.state ?? ''}
        onChange={e => setFilter('state', e.target.value || null)}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs"
      >
        <option value="">All States</option>
        {states.map(s => (
          <option key={s} value={s}>{getStateLabel(s)}</option>
        ))}
      </select>

      <select
        value={filters.lga ?? ''}
        onChange={e => setFilter('lga', e.target.value || null)}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs"
      >
        <option value="">All LGAs</option>
        {lgas.map(code => (
          <option key={code} value={code}>{getLgaLabel(code)}</option>
        ))}
      </select>

      <FacilitySearch
        options={facilityOptions}
        value={filters.facility}
        onChange={v => setFilter('facility', v)}
      />

      <select
        value={filters.team ?? ''}
        onChange={e => setFilter('team', e.target.value || null)}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs"
      >
        <option value="">All Teams</option>
        {teams.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:bg-slate-100"
        >
          <X size={12} />
          Reset
        </button>
      )}

      {hasFilters && (
        <span className="text-[10px] text-muted">
          {facilities.length} facilities
        </span>
      )}
    </div>
  )
}

function FacilitySearch({
  options,
  value,
  onChange,
}: {
  options: { code: string; name: string }[]
  value: string | null
  onChange: (v: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query
    ? options.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.code.toLowerCase().includes(query.toLowerCase())
      )
    : options

  const selectedLabel = value
    ? options.find(o => o.code === value)?.name ?? value
    : null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs min-w-[120px] max-w-[200px]"
      >
        <span className="truncate">{selectedLabel ?? 'All Facilities'}</span>
        <ChevronDown size={12} className="shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border border-border bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={13} className="text-muted" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-xs outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => { onChange(null); setOpen(false); setQuery('') }}
              className={`w-full px-3 py-1.5 text-left text-xs hover:bg-pale-blue ${!value ? 'bg-selected-bg font-medium text-primary' : 'text-ink'}`}
            >
              All Facilities
            </button>
            {filtered.slice(0, 50).map(o => (
              <button
                key={o.code}
                onClick={() => { onChange(o.code); setOpen(false); setQuery('') }}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-pale-blue ${value === o.code ? 'bg-selected-bg font-medium text-primary' : 'text-ink'}`}
              >
                <span>{o.name}</span>
                <span className="ml-1 text-muted text-[10px]">{o.code}</span>
              </button>
            ))}
            {filtered.length > 50 && (
              <p className="px-3 py-1.5 text-[10px] text-muted">
                {filtered.length - 50} more — refine your search
              </p>
            )}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted">No facilities match</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
