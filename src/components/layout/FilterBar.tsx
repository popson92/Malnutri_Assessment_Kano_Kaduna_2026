import { useStore } from '@/store'
import { getStateLabel, getLgaLabel, LGA_MAPPINGS } from '@/config/geo'
import { X } from 'lucide-react'

export function FilterBar() {
  const { filters, setFilter, resetFilters, facilities } = useStore()

  const states = ['kano', 'kaduna'] as const
  const lgas = LGA_MAPPINGS
    .filter(m => !filters.state || m.state === filters.state)
    .map(m => m.koboCode)

  const teams = [...new Set(facilities.map(f => f.a_team).filter(Boolean))].sort()

  const hasFilters = filters.state || filters.lga || filters.team

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.state ?? ''}
        onChange={e => {
          setFilter('state', e.target.value || null)
          setFilter('lga', null)
        }}
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
