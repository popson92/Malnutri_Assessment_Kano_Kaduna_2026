export type State = 'kano' | 'kaduna'
export type DataMode = 'development' | 'testing' | 'production'

export type VisitOutcome =
  | 'completed'
  | 'partial'
  | 'closed'
  | 'not_sam_site'
  | 'inaccessible'
  | 'refused'
  | 'other'

export type SamplingStratum =
  | 'sc_census'
  | 'certainty'
  | 'random_reporting'
  | 'random_non_reporting'

export type FunctionalityRating = 'fully' | 'partially' | 'non'
export type DataQualityRating = 'high' | 'medium' | 'low'
export type RecordClassification = 'valid' | 'invalid' | 'unverifiable' | 'alternative' | 'comorbidity'

export type CaregiverCategory = 'completed' | 'active' | 'defaulted_referred' | 'substitute'
export type ContactOutcome = 'yes' | 'no' | 'untraceable'

export interface FacilityRecord {
  _id: number
  _uuid: string
  _submission_time: string
  _version: string
  start: string
  end: string
  today: string

  // Section A: Facility identification
  a_date: string
  a_team: string
  a_sup: string
  a_state: State
  a_lga: string
  a_repl: 'yes' | 'no'
  a_repl_of: string | null
  a_repl_why: string | null
  a_fac: string
  pre_cat: string
  pre_fname: string
  pre_imam_name: string
  pre_dhis2_name: string
  pre_ward: string
  pre_stratum: string
  pre_weight: number | null
  pre_frame_no: string
  pre_sc: string
  a_type: string
  a_gps: string | null
  a_lat: number | null
  a_lon: number | null
  a_photo_taken: 'Yes' | 'No'
  a_lead: string
  a_arrive: string

  // Section B: Treatment-site status
  b1: string // open/no/partially/not_reached
  b2: string // SAM OTP available
  b5: string // SC
  b9: number | null // trained staff
  b18: string // OTP register
  b19: string // patient cards
  b20: string // monthly summary
  b27: FunctionalityRating | null

  // Section C: Monthly admissions (aggregated)
  c_tot_rep: number | null
  c_tot_ver: number | null
  c_tot_imam: number | null
  c_tot_dhis2: number | null
  c_rate: number | null
  c_rate_d: number | null
  c_months_avail: number | null
  c_tot_cured: number | null
  c_tot_def: number | null
  c_tot_died: number | null
  c_exits: number | null
  c_cure: number | null
  c_stock_months: number | null
  c_stock_adm: number | null
  c_norutf_adm: number | null
  c_rrec: number | null
  c_rdisp: number | null

  // Section D: Patient records (aggregated)
  d_rev: number | null
  d_valid: number | null
  d_invalid: number | null
  d_unver: number | null
  d_alt: number | null
  d_comorb: number | null

  // Section E: RUTF
  e1: string // stock card available
  e_acc: number | null
  e_courses: number | null
  e_unexp: number | null
  e_match: 'yes' | 'no' | null
  e_phys: number | null

  // Section G: Summary
  h_gap: number | null
  h_gap_v: number | null
  h_mech: string[]
  h_dq: DataQualityRating | null
  h_func_cls: FunctionalityRating | null
  h_anom: string | null

  // Section H: Visit outcome
  a_outcome: VisitOutcome
  z_gps: string | null

  // Parameters
  p_spc: number | null // sachets per carton
  p_course: number | null // sachets per course
  p_wastage: number | null

  // Monthly repeat data (flattened)
  monthlyData: MonthlyRecord[]
  patientRecords: PatientRecord[]
}

export interface MonthlyRecord {
  m_idx: number
  m_label: string
  m_avail: 'yes' | 'no' | 'partial'
  m_rep: number | null
  m_new: number | null
  m_readm: number | null
  m_tin: number | null
  m_sumin: number | null
  m_cured: number | null
  m_def: number | null
  m_died: number | null
  m_tout: number | null
  m_nonresp: number | null
  m_disc: number | null
  m_stock: 'yes' | 'no' | 'unknown'
  m_card: 'yes' | 'no' | 'partial'
  m_rrec: number | null
  m_rdisp: number | null
  m_imam: number | null
  m_dhis2: number | null
}

export interface PatientRecord {
  r_sn: number
  r_id: string
  r_adate: string | null
  r_age: number | null
  r_sex: 'm' | 'f' | null
  r_muac: number | null
  r_whz: number | null
  r_oed: string | null
  r_sam: string
  r_mod: string
  r_rutf: string
  r_sach: number | null
  r_wks: number | null
  r_out: string
  r_compl: string
  r_class: RecordClassification
}

export interface CaregiverRecord {
  _id: number
  _uuid: string
  _submission_time: string
  _version: string
  start: string
  end: string

  a_date: string
  a_team: string
  a_state: State
  a_lga: string
  a_repl: 'yes' | 'no'
  a_fac: string
  pre_fname: string

  // Section B: Selection and consent
  c_cat: CaregiverCategory
  c_no: number | null
  c_pid: string
  c_contact: ContactOutcome
  c_meth: string | null
  c_consent: 'yes' | 'no' | null

  // Section C: Respondent demographics
  m_rel: string | null
  m_age: number | null
  m_edu: string | null
  m_u5: number | null

  // Section E: Child and treatment
  ch_age: number | null
  ch_sex: 'm' | 'f' | null
  ch_adm_date: string | null
  ch_admtype: string | null
  ch_ref: string | null
  ch_where: string | null
  ch_disch: string | null

  // Section F: Service verification
  c_attend: 'yes' | 'no' | null
  c_cont: 'yes' | 'interrupted' | 'no' | null
  c_ref_completed: 'yes' | 'no' | 'dk' | null
  c_bar: string | null
  c_cost: number | null
  c_untr: 'yes' | 'no' | null
  c_muac: number | null
}

export interface SamplingTarget {
  facilityCode: string
  state: State
  lga: string
  facilityName: string
  stratum: SamplingStratum
  weight: number | null
  frameNo: string
  isSC: boolean
}

export interface LgaSummary {
  state: State
  lga: string
  lgaLabel: string
  sampled: number
  visited: number
  completed: number
  pending: number
  replacements: number
  caregiverTarget: number
  caregiverCompleted: number
  qualityFlags: number
}

export interface DataQualityIssue {
  id: string
  type: string
  severity: 'critical' | 'warning' | 'info'
  state: State
  lga: string
  facility: string
  team: string
  date: string
  description: string
  recommendation: string
  status: 'new' | 'under_review' | 'resolved' | 'dismissed'
}

export interface SyncStatus {
  lastSync: string | null
  facilityCount: number
  caregiverCount: number
  connected: boolean
  error: string | null
  dataMode: DataMode
}
