import { useState, useMemo, useCallback, type ReactNode } from 'react'
import { StoreContext, defaultFilters, defaultSync, type Filters } from '.'
import type { FacilityRecord, CaregiverRecord, SyncStatus } from '@/types'
import { generateDevFacilities, generateDevCaregivers } from '@/data/devFixtures'

export function DataProvider({ children }: { children: ReactNode }) {
  const [allFacilities] = useState<FacilityRecord[]>(() => generateDevFacilities())
  const [allCaregivers] = useState<CaregiverRecord[]>(() => generateDevCaregivers())
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [syncStatus] = useState<SyncStatus>({
    ...defaultSync,
    dataMode: 'development',
    facilityCount: allFacilities.length,
    caregiverCount: allCaregivers.length,
    lastSync: new Date().toISOString(),
  })

  const setFilter = useCallback((key: keyof Filters, value: string | null) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'state') next.lga = null
      return next
    })
  }, [])

  const resetFilters = useCallback(() => setFilters(defaultFilters), [])
  const refreshData = useCallback(() => {}, [])

  const facilities = useMemo(() => {
    let result = allFacilities
    if (filters.state) result = result.filter(f => f.a_state === filters.state)
    if (filters.lga) result = result.filter(f => f.a_lga === filters.lga)
    if (filters.team) result = result.filter(f => f.a_team === filters.team)
    if (filters.stratum) result = result.filter(f => f.pre_stratum === filters.stratum)
    if (filters.outcome) result = result.filter(f => f.a_outcome === filters.outcome)
    return result
  }, [allFacilities, filters])

  const caregivers = useMemo(() => {
    let result = allCaregivers
    if (filters.state) result = result.filter(c => c.a_state === filters.state)
    if (filters.lga) result = result.filter(c => c.a_lga === filters.lga)
    if (filters.team) result = result.filter(c => c.a_team === filters.team)
    return result
  }, [allCaregivers, filters])

  return (
    <StoreContext value={{
      allFacilities,
      allCaregivers,
      facilities,
      caregivers,
      filters,
      syncStatus,
      setFilter,
      resetFilters,
      refreshData,
    }}>
      {children}
    </StoreContext>
  )
}
