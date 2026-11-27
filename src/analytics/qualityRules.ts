import type { FacilityRecord } from '@/types'

export type FlagSeverity = 'critical' | 'warning' | 'info'

export interface QualityFlag {
  id: string
  ruleId: string
  ruleName: string
  facilityCode: string
  facilityName: string
  state: string
  lga: string
  team: string
  indicator: string
  monthLabel: string | null
  submissionDate: string
  fieldworkDate: string
  value: number | string | null
  expected: string
  deviation: number | null
  severity: FlagSeverity
  explanation: string
  recommendation: string
  status: 'new' | 'under_review' | 'resolved' | 'dismissed'
}

export interface QualityRule {
  id: string
  name: string
  type: 'consistency' | 'completeness' | 'statistical' | 'integrity'
  description: string
  indicator: string
  requiredFields: string[]
  severity: FlagSeverity
  rationale: string
  recommendation: string
  evaluate: (facility: FacilityRecord) => QualityFlag[]
}

function flagId(dataMode: string, facilityCode: string, ruleId: string, monthLabel: string | null): string {
  return `${dataMode}:${facilityCode}:${ruleId}:${monthLabel ?? 'facility'}`
}

const DATA_MODE = typeof window !== 'undefined'
  ? (new URLSearchParams(window.location.search).get('mode') ?? 'testing')
  : 'testing'

function makeFlag(
  facility: FacilityRecord,
  rule: { id: string; name: string; indicator: string; severity: FlagSeverity; recommendation: string },
  monthLabel: string | null,
  value: number | string | null,
  expected: string,
  deviation: number | null,
  explanation: string,
): QualityFlag {
  return {
    id: flagId(DATA_MODE, facility.a_fac, rule.id, monthLabel),
    ruleId: rule.id,
    ruleName: rule.name,
    facilityCode: facility.a_fac,
    facilityName: facility.pre_fname,
    state: facility.a_state,
    lga: facility.a_lga,
    team: facility.a_team,
    indicator: rule.indicator,
    monthLabel,
    submissionDate: facility._submission_time,
    fieldworkDate: facility.a_date,
    value,
    expected,
    deviation,
    severity: rule.severity,
    explanation,
    recommendation: rule.recommendation,
    status: 'new',
  }
}

export const QUALITY_RULES: QualityRule[] = [
  {
    id: 'DQ001',
    name: 'Low data quality classification',
    type: 'integrity',
    description: 'Assessment team classified facility data quality as low',
    indicator: 'data_quality',
    requiredFields: ['h_dq'],
    severity: 'critical',
    rationale: 'Assessment team identified significant data quality concerns during the visit',
    recommendation: 'Review assessment-team notes and schedule supervisory follow-up',
    evaluate: (f) => {
      if (f.h_dq !== 'low') return []
      return [makeFlag(f, QUALITY_RULES[0], null, 'low', 'medium or high', null,
        'The assessment team classified this facility\'s data quality as low. This indicates significant concerns with data integrity, record completeness, or consistency.')]
    },
  },
  {
    id: 'DQ002',
    name: 'Missing facility photo',
    type: 'completeness',
    description: 'No facility photograph was captured during the visit',
    indicator: 'photo_evidence',
    requiredFields: ['a_photo_taken'],
    severity: 'warning',
    rationale: 'Facility photographs provide verification evidence',
    recommendation: 'Ensure photo is captured on return visit',
    evaluate: (f) => {
      if (f.a_photo_taken === 'No') {
        return [makeFlag(f, QUALITY_RULES[1], null, 'No', 'Yes', null,
          'No facility photograph was captured during this assessment visit. Photos provide important verification evidence.')]
      }
      return []
    },
  },
  {
    id: 'DQ003',
    name: 'High verification ratio',
    type: 'consistency',
    description: 'Register-verified admissions significantly exceed reported admissions',
    indicator: 'verification_ratio',
    requiredFields: ['c_rate'],
    severity: 'warning',
    rationale: 'A verification ratio above 150% may indicate underreporting or source differences',
    recommendation: 'Review reporting sources and register entries for the period',
    evaluate: (f) => {
      if (f.c_rate == null || f.c_rate <= 1.5) return []
      return [makeFlag(f, QUALITY_RULES[2], null, f.c_rate, '≤ 1.5', f.c_rate - 1,
        `The register verification ratio of ${(f.c_rate * 100).toFixed(0)}% significantly exceeds 100%. This may indicate underreporting in IMAM/DHIS2, source definition differences, or register data issues.`)]
    },
  },
  {
    id: 'DQ004',
    name: 'High cure rate with zero defaulters',
    type: 'consistency',
    description: 'Cure rate ≥95% combined with zero recorded defaulters',
    indicator: 'cure_rate',
    requiredFields: ['c_cure', 'c_tot_def'],
    severity: 'warning',
    rationale: 'An extremely high cure rate with zero defaulters warrants verification of exit classifications',
    recommendation: 'Review exit classifications and patient tracking records',
    evaluate: (f) => {
      if (f.c_cure == null || f.c_cure < 0.95 || f.c_tot_def !== 0) return []
      return [makeFlag(f, QUALITY_RULES[3], null, `${(f.c_cure * 100).toFixed(0)}%`, '< 95% or non-zero defaults', null,
        `The facility recorded a cure rate of ${(f.c_cure * 100).toFixed(0)}% with zero defaulters across the assessment period. This pattern warrants review of treatment exit classifications.`)]
    },
  },
  {
    id: 'DQ005',
    name: 'RUTF physical stock mismatch',
    type: 'consistency',
    description: 'Physical RUTF stock count does not match recorded balance',
    indicator: 'rutf_stock',
    requiredFields: ['e_match'],
    severity: 'warning',
    rationale: 'Discrepancies between physical and recorded stock indicate commodity accountability issues',
    recommendation: 'Review stock records, receipts, and dispensing documentation',
    evaluate: (f) => {
      if (f.e_match !== 'no') return []
      return [makeFlag(f, QUALITY_RULES[4], null, 'mismatch', 'match', f.e_unexp,
        `The physical RUTF stock count does not match the recorded balance.${f.e_unexp != null ? ` Unexplained difference: ${f.e_unexp} sachets.` : ''} This indicates commodity accountability concerns.`)]
    },
  },
  {
    id: 'DQ006',
    name: 'Admissions during RUTF stockout',
    type: 'consistency',
    description: 'New admissions recorded in a month with reported RUTF stockout',
    indicator: 'stockout_admissions',
    requiredFields: [],
    severity: 'warning',
    rationale: 'SAM admissions during stockouts require review of treatment modality and commodity availability',
    recommendation: 'Verify treatment approach during stockout period',
    evaluate: (f) => {
      const flags: QualityFlag[] = []
      for (const m of f.monthlyData) {
        if (m.m_stock === 'no' && m.m_new != null && m.m_new > 0) {
          flags.push(makeFlag(f, QUALITY_RULES[5], m.m_label, m.m_new, '0 (stockout month)', null,
            `${m.m_new} new admissions were recorded in ${m.m_label} when the facility reported a RUTF stockout. The assessment team should verify commodity availability, treatment modality, and dispensing records for this period.`))
        }
      }
      return flags
    },
  },
  {
    id: 'DQ007',
    name: 'Admissions without RUTF dispensing',
    type: 'consistency',
    description: 'Admissions recorded in a month with zero RUTF dispensed',
    indicator: 'dispensing_gap',
    requiredFields: [],
    severity: 'info',
    rationale: 'Admissions without RUTF dispensing may indicate alternative treatment, poor records, or referral',
    recommendation: 'Review treatment records and commodity documentation',
    evaluate: (f) => {
      const flags: QualityFlag[] = []
      for (const m of f.monthlyData) {
        if (m.m_avail === 'yes' && m.m_new != null && m.m_new > 0 && (m.m_rdisp === 0 || m.m_rdisp == null)) {
          flags.push(makeFlag(f, QUALITY_RULES[6], m.m_label, m.m_new, 'RUTF dispensed > 0', null,
            `${m.m_new} admissions recorded in ${m.m_label} with zero or missing RUTF dispensing. This may indicate alternative treatment approaches, missing records, or referral patterns.`))
        }
      }
      return flags
    },
  },
  {
    id: 'DQ008',
    name: 'Missing GPS coordinates',
    type: 'completeness',
    description: 'No GPS coordinates captured during the facility visit',
    indicator: 'gps_evidence',
    requiredFields: ['a_lat', 'a_lon'],
    severity: 'info',
    rationale: 'GPS coordinates provide location verification evidence',
    recommendation: 'Ensure GPS is captured on subsequent visits',
    evaluate: (f) => {
      if (f.a_lat != null && f.a_lon != null) return []
      return [makeFlag(f, QUALITY_RULES[7], null, 'missing', 'valid coordinates', null,
        'No valid GPS coordinates were captured during this facility visit. Location evidence supports visit verification.')]
    },
  },
]

export function evaluateAllRules(facilities: FacilityRecord[]): QualityFlag[] {
  const completed = facilities.filter(f => f.a_outcome === 'completed')
  const flags: QualityFlag[] = []
  for (const fac of completed) {
    for (const rule of QUALITY_RULES) {
      flags.push(...rule.evaluate(fac))
    }
  }
  return flags
}

export function flagsByFacility(flags: QualityFlag[]): Map<string, QualityFlag[]> {
  const map = new Map<string, QualityFlag[]>()
  for (const f of flags) {
    const existing = map.get(f.facilityCode) ?? []
    existing.push(f)
    map.set(f.facilityCode, existing)
  }
  return map
}

export function flagSummary(flags: QualityFlag[]) {
  const facilities = new Set(flags.map(f => f.facilityCode))
  return {
    total: flags.length,
    critical: flags.filter(f => f.severity === 'critical').length,
    warning: flags.filter(f => f.severity === 'warning').length,
    info: flags.filter(f => f.severity === 'info').length,
    affectedFacilities: facilities.size,
  }
}
