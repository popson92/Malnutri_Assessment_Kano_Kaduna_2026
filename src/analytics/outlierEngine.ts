import type { FacilityRecord, MonthlyRecord } from '@/types'

export interface OutlierConfig {
  method: 'mad' | 'iqr' | 'zscore'
  threshold: number
  minObservations: number
}

export const DEFAULT_CONFIG: OutlierConfig = {
  method: 'mad',
  threshold: 3.5,
  minObservations: 8,
}

export interface StatSummary {
  mean: number
  median: number
  mad: number
  iqr: number
  q1: number
  q3: number
  sd: number
  n: number
  min: number
  max: number
}

export interface OutlierResult {
  facilityCode: string
  facilityName: string
  state: string
  lga: string
  indicatorId: string
  monthLabel: string
  monthIdx: number
  value: number
  median: number
  mad: number
  modifiedZScore: number | null
  iqrLower: number
  iqrUpper: number
  severity: 'high' | 'warning' | 'info'
  method: string
  n: number
}

function sortedValues(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b)
}

function median(sorted: number[]): number {
  const n = sorted.length
  if (n === 0) return 0
  const mid = Math.floor(n / 2)
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mad(sorted: number[], med: number): number {
  const absDevs = sortedValues(sorted.map(v => Math.abs(v - med)))
  return median(absDevs)
}

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length
}

function sd(arr: number[], m: number): number {
  if (arr.length < 2) return 0
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

export function computeStats(values: number[]): StatSummary {
  const sorted = sortedValues(values)
  const n = sorted.length
  if (n === 0) {
    return { mean: 0, median: 0, mad: 0, iqr: 0, q1: 0, q3: 0, sd: 0, n: 0, min: 0, max: 0 }
  }
  const med = median(sorted)
  const madVal = mad(sorted, med)
  const meanVal = mean(sorted)
  const sdVal = sd(sorted, meanVal)

  const q1Idx = Math.floor(n * 0.25)
  const q3Idx = Math.floor(n * 0.75)
  const q1 = sorted[q1Idx]
  const q3 = sorted[Math.min(q3Idx, n - 1)]
  const iqr = q3 - q1

  return {
    mean: meanVal,
    median: med,
    mad: madVal,
    iqr,
    q1,
    q3,
    sd: sdVal,
    n,
    min: sorted[0],
    max: sorted[n - 1],
  }
}

export function modifiedZScore(value: number, med: number, madVal: number): number | null {
  if (madVal === 0) return null
  return 0.6745 * (value - med) / madVal
}

export function isOutlierMAD(value: number, stats: StatSummary, threshold: number): boolean {
  if (stats.mad === 0) {
    if (stats.iqr === 0) return false
    return value < stats.q1 - 1.5 * stats.iqr || value > stats.q3 + 1.5 * stats.iqr
  }
  const mz = modifiedZScore(value, stats.median, stats.mad)
  return mz !== null && Math.abs(mz) > threshold
}

export function isOutlierIQR(value: number, stats: StatSummary, multiplier = 1.5): boolean {
  return value < stats.q1 - multiplier * stats.iqr || value > stats.q3 + multiplier * stats.iqr
}

export function getExpectedRange(stats: StatSummary, config: OutlierConfig): [number, number] {
  if (config.method === 'mad') {
    if (stats.mad > 0) {
      const half = config.threshold * stats.mad / 0.6745
      return [Math.max(0, stats.median - half), stats.median + half]
    }
    if (stats.iqr > 0) {
      return [Math.max(0, stats.q1 - 1.5 * stats.iqr), stats.q3 + 1.5 * stats.iqr]
    }
    return [stats.min, stats.max]
  }
  if (config.method === 'iqr') {
    return [
      Math.max(0, stats.q1 - 1.5 * stats.iqr),
      stats.q3 + 1.5 * stats.iqr,
    ]
  }
  // zscore
  return [
    Math.max(0, stats.mean - config.threshold * stats.sd),
    stats.mean + config.threshold * stats.sd,
  ]
}

export type MonthlyFieldKey = keyof MonthlyRecord & string

function getMonthlyValue(month: MonthlyRecord, field: MonthlyFieldKey): number | null {
  const v = month[field]
  return typeof v === 'number' ? v : null
}

export function detectFacilityOutliers(
  facility: FacilityRecord,
  field: MonthlyFieldKey,
  indicatorId: string,
  config: OutlierConfig = DEFAULT_CONFIG,
): OutlierResult[] {
  const months = facility.monthlyData
  const values = months
    .map(m => getMonthlyValue(m, field))
    .filter((v): v is number => v !== null)

  if (values.length < config.minObservations) return []

  const stats = computeStats(values)
  const results: OutlierResult[] = []

  for (const month of months) {
    const value = getMonthlyValue(month, field)
    if (value === null) continue

    let isOutlier = false
    if (config.method === 'mad') {
      isOutlier = isOutlierMAD(value, stats, config.threshold)
    } else if (config.method === 'iqr') {
      isOutlier = isOutlierIQR(value, stats)
    } else {
      isOutlier = stats.sd > 0 && Math.abs((value - stats.mean) / stats.sd) > config.threshold
    }

    if (!isOutlier) continue

    const mz = modifiedZScore(value, stats.median, stats.mad)
    const absMz = mz !== null ? Math.abs(mz) : null
    const severity: OutlierResult['severity'] =
      absMz !== null && absMz > 5 ? 'high' :
      absMz !== null && absMz > config.threshold ? 'warning' : 'info'

    results.push({
      facilityCode: facility.a_fac,
      facilityName: facility.pre_fname,
      state: facility.a_state,
      lga: facility.a_lga,
      indicatorId,
      monthLabel: month.m_label,
      monthIdx: month.m_idx,
      value,
      median: stats.median,
      mad: stats.mad,
      modifiedZScore: mz,
      iqrLower: stats.q1 - 1.5 * stats.iqr,
      iqrUpper: stats.q3 + 1.5 * stats.iqr,
      severity,
      method: config.method,
      n: values.length,
    })
  }

  return results
}

export function detectAllOutliers(
  facilities: FacilityRecord[],
  indicatorId: string,
  field: MonthlyFieldKey,
  config: OutlierConfig = DEFAULT_CONFIG,
): OutlierResult[] {
  const completed = facilities.filter(f => f.a_outcome === 'completed')
  const results: OutlierResult[] = []
  for (const fac of completed) {
    results.push(...detectFacilityOutliers(fac, field, indicatorId, config))
  }
  return results
}
