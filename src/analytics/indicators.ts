import type { FacilityRecord, CaregiverRecord, LgaSummary, State } from '@/types'
import { LGA_MAPPINGS, SAMPLING_TARGETS, CAREGIVER_TARGET_PER_FACILITY, getLgaLabel } from '@/config/geo'
import { getLgaTarget } from '@/data/samplingFrame'

export function countByOutcome(facilities: FacilityRecord[]) {
  const counts: Record<string, number> = {}
  for (const f of facilities) {
    counts[f.a_outcome] = (counts[f.a_outcome] ?? 0) + 1
  }
  return counts
}

export function completedFacilities(facilities: FacilityRecord[]) {
  return facilities.filter(f => f.a_outcome === 'completed')
}

export function uniqueFacilitiesVisited(facilities: FacilityRecord[]) {
  return new Set(facilities.map(f => f.a_fac)).size
}

export function completionRate(facilities: FacilityRecord[], state?: State) {
  const target = state ? SAMPLING_TARGETS[state].facilities : SAMPLING_TARGETS.total.facilities
  const completed = facilities.filter(f => f.a_outcome === 'completed').length
  return target > 0 ? completed / target : 0
}

export function completedCaregiverInterviews(caregivers: CaregiverRecord[]) {
  return caregivers.filter(c =>
    c.c_contact === 'yes' && c.c_consent === 'yes'
  )
}

export function caregiverTarget(state?: State) {
  const target = state ? SAMPLING_TARGETS[state].facilities : SAMPLING_TARGETS.total.facilities
  return target * CAREGIVER_TARGET_PER_FACILITY
}

export function caregiverAchievement(caregivers: CaregiverRecord[], state?: State) {
  const completed = completedCaregiverInterviews(caregivers).length
  const target = caregiverTarget(state)
  return target > 0 ? completed / target : 0
}

export function facilitiesRequiringFollowUp(facilities: FacilityRecord[]) {
  return facilities.filter(f =>
    f.a_outcome === 'partial' ||
    (f.a_outcome === 'completed' && f.h_dq === 'low')
  )
}

export function replacementCount(facilities: FacilityRecord[]) {
  return facilities.filter(f => f.a_repl === 'yes').length
}

export function teamPerformance(facilities: FacilityRecord[], caregivers: CaregiverRecord[]) {
  const teams = new Map<string, {
    team: string
    state: string
    visited: number
    completed: number
    pending: number
    cgInterviews: number
    qualityFlags: number
    lastSubmission: string
  }>()

  for (const f of facilities) {
    const t = teams.get(f.a_team) ?? {
      team: f.a_team,
      state: f.a_state,
      visited: 0,
      completed: 0,
      pending: 0,
      cgInterviews: 0,
      qualityFlags: 0,
      lastSubmission: '',
    }
    t.visited++
    if (f.a_outcome === 'completed') t.completed++
    if (f.a_outcome === 'partial') t.pending++
    if (f.h_dq === 'low') t.qualityFlags++
    if (f._submission_time > t.lastSubmission) t.lastSubmission = f._submission_time
    teams.set(f.a_team, t)
  }

  for (const c of caregivers) {
    const t = teams.get(c.a_team)
    if (t && c.c_contact === 'yes' && c.c_consent === 'yes') {
      t.cgInterviews++
    }
  }

  return [...teams.values()].sort((a, b) => b.completed - a.completed)
}

export function lgaSummaries(facilities: FacilityRecord[], caregivers: CaregiverRecord[]): LgaSummary[] {
  const map = new Map<string, LgaSummary>()

  for (const lga of LGA_MAPPINGS) {
    const target = getLgaTarget(lga.koboCode)
    map.set(lga.koboCode, {
      state: lga.state,
      lga: lga.koboCode,
      lgaLabel: lga.label,
      sampled: target,
      visited: 0,
      completed: 0,
      pending: 0,
      replacements: 0,
      caregiverTarget: target * CAREGIVER_TARGET_PER_FACILITY,
      caregiverCompleted: 0,
      qualityFlags: 0,
    })
  }

  for (const f of facilities) {
    const s = map.get(f.a_lga)
    if (!s) continue
    s.visited++
    if (f.a_outcome === 'completed') s.completed++
    if (f.a_outcome === 'partial') s.pending++
    if (f.a_repl === 'yes') s.replacements++
    if (f.h_dq === 'low') s.qualityFlags++
  }

  for (const c of caregivers) {
    const s = map.get(c.a_lga)
    if (s && c.c_contact === 'yes' && c.c_consent === 'yes') {
      s.caregiverCompleted++
    }
  }

  return [...map.values()]
}

export function verificationRatio(facilities: FacilityRecord[]) {
  const completed = completedFacilities(facilities)
  const totalRep = completed.reduce((s, f) => s + (f.c_tot_rep ?? 0), 0)
  const totalVer = completed.reduce((s, f) => s + (f.c_tot_ver ?? 0), 0)
  return totalRep > 0 ? totalVer / totalRep : null
}

export function avgRegisterAvailability(facilities: FacilityRecord[]) {
  const completed = completedFacilities(facilities).filter(f => f.c_months_avail != null)
  if (completed.length === 0) return null
  const total = completed.reduce((s, f) => s + (f.c_months_avail ?? 0), 0)
  return total / completed.length
}

export function rutfDiscrepancySummary(facilities: FacilityRecord[]) {
  const completed = completedFacilities(facilities).filter(f => f.e_unexp != null)
  return {
    count: completed.length,
    positive: completed.filter(f => (f.e_unexp ?? 0) > 0).length,
    negative: completed.filter(f => (f.e_unexp ?? 0) < 0).length,
    matched: completed.filter(f => f.e_match === 'yes').length,
    mismatched: completed.filter(f => f.e_match === 'no').length,
  }
}

export function dailyCompletionTrend(facilities: FacilityRecord[]) {
  const byDate = new Map<string, number>()
  for (const f of facilities) {
    if (f.a_outcome === 'completed' && f.a_date) {
      byDate.set(f.a_date, (byDate.get(f.a_date) ?? 0) + 1)
    }
  }
  const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  let cumulative = 0
  return sorted.map(([date, count]) => {
    cumulative += count
    return { date, daily: count, cumulative }
  })
}

export function dataQualityFlags(facilities: FacilityRecord[]) {
  let total = 0
  let critical = 0
  let warning = 0
  const affectedFacilities = new Set<string>()

  for (const f of completedFacilities(facilities)) {
    let hasFlagThisFacility = false

    if (f.h_dq === 'low') { critical++; total++; hasFlagThisFacility = true }
    if (f.a_photo_taken === 'No') { warning++; total++; hasFlagThisFacility = true }
    if (f.c_rate != null && f.c_rate > 1.5) { warning++; total++; hasFlagThisFacility = true }
    if (f.c_cure != null && f.c_cure >= 0.95 && f.c_tot_def === 0) { warning++; total++; hasFlagThisFacility = true }
    if (f.e_match === 'no') { warning++; total++; hasFlagThisFacility = true }

    if (hasFlagThisFacility) affectedFacilities.add(f.a_fac)
  }

  return { total, critical, warning, affectedSubmissions: affectedFacilities.size }
}
