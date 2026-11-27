import { useState, useMemo, useCallback, useEffect, type ReactNode } from 'react'
import { StoreContext, defaultFilters, defaultSync, type Filters } from '.'
import type { FacilityRecord, CaregiverRecord, SyncStatus, DataMode } from '@/types'
import { generateDevFacilities, generateDevCaregivers } from '@/data/devFixtures'
import { fetchFacilities, fetchCaregivers } from '@/data/koboService'

const DATA_MODE = (import.meta.env.VITE_DATA_MODE ?? 'development') as DataMode

export function DataProvider({ children }: { children: ReactNode }) {
  const [allFacilities, setAllFacilities] = useState<FacilityRecord[]>([])
  const [allCaregivers, setAllCaregivers] = useState<CaregiverRecord[]>([])
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    ...defaultSync,
    dataMode: DATA_MODE,
  })

  const loadData = useCallback(async () => {
    if (DATA_MODE === 'development') {
      const fac = generateDevFacilities()
      const cg = generateDevCaregivers()
      setAllFacilities(fac)
      setAllCaregivers(cg)
      setSyncStatus(prev => ({
        ...prev,
        facilityCount: fac.length,
        caregiverCount: cg.length,
        lastSync: new Date().toISOString(),
        connected: false,
        error: null,
      }))
      return
    }

    setSyncStatus(prev => ({ ...prev, connected: true, error: null }))

    try {
      const [fac, cg] = await Promise.all([fetchFacilities(), fetchCaregivers()])
      setAllFacilities(fac)
      setAllCaregivers(cg)
      setSyncStatus(prev => ({
        ...prev,
        facilityCount: fac.length,
        caregiverCount: cg.length,
        lastSync: new Date().toISOString(),
        connected: true,
        error: null,
      }))
    } catch (err) {
      setSyncStatus(prev => ({
        ...prev,
        connected: false,
        error: err instanceof Error ? err.message : 'Failed to fetch data',
      }))
      if (allFacilities.length === 0) {
        const fac = generateDevFacilities()
        const cg = generateDevCaregivers()
        setAllFacilities(fac)
        setAllCaregivers(cg)
        setSyncStatus(prev => ({
          ...prev,
          facilityCount: fac.length,
          caregiverCount: cg.length,
          dataMode: 'development',
        }))
      }
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const setFilter = useCallback((key: keyof Filters, value: string | null) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'state') next.lga = null
      return next
    })
  }, [])

  const resetFilters = useCallback(() => setFilters(defaultFilters), [])

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
      refreshData: loadData,
    }}>
      {children}
    </StoreContext>
  )
}
