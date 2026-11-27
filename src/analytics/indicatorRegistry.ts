export interface IndicatorDef {
  id: string
  name: string
  shortName: string
  description: string
  assessmentQuestion: number
  sourceField: string
  unit: string
  aggregation: 'sum' | 'mean' | 'rate'
  numeratorField?: string
  denominatorField?: string
  format: 'integer' | 'decimal' | 'percent'
  monitoringPriority: boolean
}

export const INDICATORS: IndicatorDef[] = [
  {
    id: 'imam_admissions',
    name: 'IMAM-Reported SAM Admissions',
    shortName: 'IMAM Admissions',
    description: 'Monthly SAM admissions as reported in the IMAM register',
    assessmentQuestion: 1,
    sourceField: 'm_imam',
    unit: 'admissions',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'dhis2_admissions',
    name: 'DHIS2-Reported SAM Admissions',
    shortName: 'DHIS2 Admissions',
    description: 'Monthly SAM admissions as reported in DHIS2',
    assessmentQuestion: 1,
    sourceField: 'm_dhis2',
    unit: 'admissions',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'verified_admissions',
    name: 'Register-Verified New SAM Admissions',
    shortName: 'Verified Admissions',
    description: 'New SAM admissions verified from facility registers',
    assessmentQuestion: 1,
    sourceField: 'm_new',
    unit: 'admissions',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'readmissions',
    name: 'SAM Readmissions',
    shortName: 'Readmissions',
    description: 'Children readmitted for SAM treatment',
    assessmentQuestion: 1,
    sourceField: 'm_readm',
    unit: 'readmissions',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'cured',
    name: 'Children Cured',
    shortName: 'Cured',
    description: 'Children discharged as cured from SAM treatment',
    assessmentQuestion: 2,
    sourceField: 'm_cured',
    unit: 'children',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'defaulted',
    name: 'Children Defaulted',
    shortName: 'Defaulted',
    description: 'Children who defaulted from SAM treatment',
    assessmentQuestion: 2,
    sourceField: 'm_def',
    unit: 'children',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'deaths',
    name: 'Deaths',
    shortName: 'Deaths',
    description: 'Deaths recorded during SAM treatment',
    assessmentQuestion: 2,
    sourceField: 'm_died',
    unit: 'children',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'rutf_received',
    name: 'RUTF Received',
    shortName: 'RUTF Received',
    description: 'RUTF sachets received by the facility in the month',
    assessmentQuestion: 3,
    sourceField: 'm_rrec',
    unit: 'sachets',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'rutf_dispensed',
    name: 'RUTF Dispensed',
    shortName: 'RUTF Dispensed',
    description: 'RUTF sachets dispensed to patients in the month',
    assessmentQuestion: 3,
    sourceField: 'm_rdisp',
    unit: 'sachets',
    aggregation: 'sum',
    format: 'integer',
    monitoringPriority: true,
  },
  {
    id: 'cure_rate',
    name: 'Cure Rate',
    shortName: 'Cure Rate',
    description: 'Proportion of exits classified as cured',
    assessmentQuestion: 2,
    sourceField: 'm_cured',
    unit: '%',
    aggregation: 'rate',
    numeratorField: 'm_cured',
    denominatorField: 'm_disc',
    format: 'percent',
    monitoringPriority: true,
  },
  {
    id: 'verification_ratio',
    name: 'Register Verification Ratio',
    shortName: 'Verification Ratio',
    description: 'Verified admissions divided by IMAM-reported admissions',
    assessmentQuestion: 1,
    sourceField: 'm_new',
    unit: 'ratio',
    aggregation: 'rate',
    numeratorField: 'm_new',
    denominatorField: 'm_imam',
    format: 'percent',
    monitoringPriority: true,
  },
]

export const INDICATOR_MAP = new Map(INDICATORS.map(i => [i.id, i]))

export function getIndicator(id: string): IndicatorDef | undefined {
  return INDICATOR_MAP.get(id)
}

export function getMonitoringIndicators(): IndicatorDef[] {
  return INDICATORS.filter(i => i.monitoringPriority)
}
