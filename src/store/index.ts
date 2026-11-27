import { createContext, useContext } from 'react'
import type { FacilityRecord, CaregiverRecord, SyncStatus, DataMode, State } from '@/types'

export interface Filters {
  state: State | null
  lga: string | null
  team: string | null
  stratum: string | null
  outcome: string | null
  dateFrom: string | null
  dateTo: string | null
}

export interface StoreState {
  allFacilities: FacilityRecord[]
  allCaregivers: CaregiverRecord[]
  facilities: FacilityRecord[]
  caregivers: CaregiverRecord[]
  filters: Filters
  syncStatus: SyncStatus
  setFilter: (key: keyof Filters, value: string | null) => void
  resetFilters: () => void
  refreshData: () => void
}

const defaultFilters: Filters = {
  state: null,
  lga: null,
  team: null,
  stratum: null,
  outcome: null,
  dateFrom: null,
  dateTo: null,
}

const defaultSync: SyncStatus = {
  lastSync: null,
  facilityCount: 0,
  caregiverCount: 0,
  connected: false,
  error: null,
  dataMode: 'development',
}

export const StoreContext = createContext<StoreState>({
  allFacilities: [],
  allCaregivers: [],
  facilities: [],
  caregivers: [],
  filters: defaultFilters,
  syncStatus: defaultSync,
  setFilter: () => {},
  resetFilters: () => {},
  refreshData: () => {},
})

export function useStore() {
  return useContext(StoreContext)
}

export { defaultFilters, defaultSync }
