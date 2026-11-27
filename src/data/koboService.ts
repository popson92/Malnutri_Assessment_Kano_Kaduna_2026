import type { FacilityRecord, CaregiverRecord, MonthlyRecord, PatientRecord } from '@/types'
import { FACILITY_FIELDS, CAREGIVER_FIELDS, REFERENCE_MONTHS, type FieldMapping } from '@/config/fieldMappings'

const PROXY_URL = '/.netlify/functions/kobo-proxy'

interface KoboResponse {
  count: number
  next: string | null
  results: Record<string, unknown>[]
}

function resolve(row: Record<string, unknown>, mapping: FieldMapping): unknown {
  const version = String(row._version ?? '')
  const path = version.startsWith('v3') ? mapping.v3 : version.startsWith('v4') ? mapping.v4 : mapping.v5
  if (!path) return undefined

  const parts = path.split('/')
  let val: unknown = row
  for (const p of parts) {
    if (val == null || typeof val !== 'object') return undefined
    val = (val as Record<string, unknown>)[p]
  }
  return val
}

function num(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function str(v: unknown): string {
  return v == null ? '' : String(v)
}

function mapFacility(raw: Record<string, unknown>): FacilityRecord {
  const get = (canonical: string) => {
    const mapping = FACILITY_FIELDS.find(f => f.canonical === canonical)
    return mapping ? resolve(raw, mapping) : raw[canonical]
  }

  const monthlyData: MonthlyRecord[] = REFERENCE_MONTHS.map((label, idx) => {
    const prefix = `c/c_m${idx + 1}`
    const getM = (field: string) => raw[`${prefix}_${field}`] ?? raw[`c_m${idx + 1}_${field}`]
    const avail = str(getM('avail') ?? 'no') as 'yes' | 'no' | 'partial'
    return {
      m_idx: idx + 1,
      m_label: label,
      m_avail: avail,
      m_rep: num(getM('rep')),
      m_new: num(getM('new')),
      m_readm: num(getM('readm')),
      m_tin: num(getM('tin')),
      m_sumin: num(getM('sumin')),
      m_cured: num(getM('cured')),
      m_def: num(getM('def')),
      m_died: num(getM('died')),
      m_tout: num(getM('tout')),
      m_nonresp: num(getM('nonresp')),
      m_disc: num(getM('disc')),
      m_stock: (str(getM('stock')) || 'unknown') as 'yes' | 'no' | 'unknown',
      m_card: (str(getM('card')) || 'no') as 'yes' | 'no' | 'partial',
      m_rrec: num(getM('rrec')),
      m_rdisp: num(getM('rdisp')),
      m_imam: num(getM('imam')),
      m_dhis2: num(getM('dhis2')),
    }
  })

  const patientRecords: PatientRecord[] = []
  const dRev = num(get('d_rev')) ?? 0
  for (let i = 1; i <= dRev && i <= 10; i++) {
    const getP = (field: string) => raw[`d/d_r${i}_${field}`] ?? raw[`d_r${i}_${field}`]
    patientRecords.push({
      r_sn: i,
      r_id: str(getP('id')),
      r_adate: str(getP('adate')) || null,
      r_age: num(getP('age')),
      r_sex: (str(getP('sex')) || null) as 'm' | 'f' | null,
      r_muac: num(getP('muac')),
      r_whz: num(getP('whz')),
      r_oed: str(getP('oed')) || null,
      r_sam: str(getP('sam')),
      r_mod: str(getP('mod')),
      r_rutf: str(getP('rutf')),
      r_sach: num(getP('sach')),
      r_wks: num(getP('wks')),
      r_out: str(getP('out')),
      r_compl: str(getP('compl')),
      r_class: (str(getP('class')) || 'unverifiable') as PatientRecord['r_class'],
    })
  }

  const state = str(get('a_state')).toLowerCase() as 'kano' | 'kaduna'

  return {
    _id: Number(raw._id) || 0,
    _uuid: str(raw._uuid),
    _submission_time: str(raw._submission_time),
    _version: str(raw._version),
    start: str(raw.start),
    end: str(raw.end),
    today: str(raw.today),
    a_date: str(get('a_date')),
    a_team: str(get('a_team')),
    a_sup: str(get('a_sup') ?? raw['a/a_sup']),
    a_state: state,
    a_lga: str(get('a_lga')),
    a_repl: str(get('a_repl')) as 'yes' | 'no',
    a_repl_of: str(get('a_repl_of')) || null,
    a_repl_why: str(get('a_repl_why')) || null,
    a_fac: str(get('a_fac')),
    pre_cat: str(raw['a/pre_cat']),
    pre_fname: str(raw['a/pre_fname']),
    pre_imam_name: str(raw['a/pre_imam_name']),
    pre_dhis2_name: str(raw['a/pre_dhis2_name']),
    pre_ward: str(raw['a/pre_ward']),
    pre_stratum: str(get('pre_stratum')),
    pre_weight: num(get('pre_weight')),
    pre_frame_no: str(get('pre_frame_no')),
    pre_sc: str(raw['a/pre_sc']),
    a_type: str(raw['a/a_type']),
    a_gps: str(raw['a/a_gps']) || null,
    a_lat: num(get('a_lat')),
    a_lon: num(get('a_lon')),
    a_photo_taken: str(raw['a/a_photo_taken']) as 'Yes' | 'No',
    a_lead: str(raw['a/a_lead']),
    a_arrive: str(raw['a/a_arrive']),
    b1: str(raw['b/b1']),
    b2: str(raw['b/b2']),
    b5: str(raw['b/b5']),
    b9: num(raw['b/b9']),
    b18: str(raw['b/b18']),
    b19: str(raw['b/b19']),
    b20: str(raw['b/b20']),
    b27: (str(raw['b/b27']) || null) as FacilityRecord['b27'],
    c_tot_rep: num(get('c_tot_rep')),
    c_tot_ver: num(get('c_tot_ver')),
    c_tot_imam: num(raw['c_tot_imam']),
    c_tot_dhis2: num(raw['c_tot_dhis2']),
    c_rate: num(get('c_rate')),
    c_rate_d: num(raw['c_rate_d']),
    c_months_avail: num(get('c_months_avail')),
    c_tot_cured: num(raw['c_tot_cured']),
    c_tot_def: num(raw['c_tot_def']),
    c_tot_died: num(raw['c_tot_died']),
    c_exits: num(raw['c_exits']),
    c_cure: num(get('c_cure')),
    c_stock_months: num(get('c_stock_months')),
    c_stock_adm: num(raw['c_stock_adm']),
    c_norutf_adm: num(raw['c_norutf_adm']),
    c_rrec: num(raw['c_rrec']),
    c_rdisp: num(raw['c_rdisp']),
    d_rev: num(get('d_rev')),
    d_valid: num(get('d_valid')),
    d_invalid: num(raw['d_invalid']),
    d_unver: num(raw['d_unver']),
    d_alt: num(raw['d_alt']),
    d_comorb: num(raw['d_comorb']),
    e1: str(raw['e/e1']),
    e_acc: num(get('e_acc')),
    e_courses: num(get('e_courses')),
    e_unexp: num(get('e_unexp')),
    e_match: (str(get('e_match')) || null) as 'yes' | 'no' | null,
    e_phys: num(raw['e/e_phys']),
    h_gap: num(raw['h/h_gap']),
    h_gap_v: num(raw['h/h_gap_v']),
    h_mech: Array.isArray(raw['h/h_mech']) ? raw['h/h_mech'] as string[] : str(raw['h/h_mech']).split(' ').filter(Boolean),
    h_dq: (str(get('h_dq')) || null) as FacilityRecord['h_dq'],
    h_func_cls: (str(get('h_func_cls')) || null) as FacilityRecord['h_func_cls'],
    h_anom: str(raw['h/h_anom']) || null,
    a_outcome: str(get('a_outcome')) as FacilityRecord['a_outcome'],
    z_gps: str(raw['z/z_gps']) || null,
    p_spc: num(raw['p_spc']) ?? 150,
    p_course: num(raw['p_course']) ?? 140,
    p_wastage: num(raw['p_wastage']) ?? 0.05,
    monthlyData,
    patientRecords,
  }
}

function mapCaregiver(raw: Record<string, unknown>): CaregiverRecord {
  const get = (canonical: string) => {
    const mapping = CAREGIVER_FIELDS.find(f => f.canonical === canonical)
    return mapping ? resolve(raw, mapping) : raw[canonical]
  }

  const state = str(get('a_state')).toLowerCase() as 'kano' | 'kaduna'

  return {
    _id: Number(raw._id) || 0,
    _uuid: str(raw._uuid),
    _submission_time: str(raw._submission_time),
    _version: str(raw._version),
    start: str(raw.start),
    end: str(raw.end),
    a_date: str(get('a_date')),
    a_team: str(get('a_team')),
    a_state: state,
    a_lga: str(get('a_lga')),
    a_repl: str(raw['a/a_repl']) as 'yes' | 'no',
    a_fac: str(get('a_fac')),
    pre_fname: str(raw['a/pre_fname']),
    c_cat: str(get('c_cat')) as CaregiverRecord['c_cat'],
    c_no: num(get('c_no')),
    c_pid: str(get('c_pid')),
    c_contact: str(get('c_contact')) as CaregiverRecord['c_contact'],
    c_meth: str(raw['g/c_meth']) || null,
    c_consent: (str(get('c_consent')) || null) as 'yes' | 'no' | null,
    m_rel: str(raw['m/m_rel']) || null,
    m_age: num(raw['m/m_age']),
    m_edu: str(raw['m/m_edu']) || null,
    m_u5: num(raw['m/m_u5']),
    ch_age: num(raw['e/ch_age']),
    ch_sex: (str(raw['e/ch_sex']) || null) as 'm' | 'f' | null,
    ch_adm_date: str(raw['e/ch_adm_date']) || null,
    ch_admtype: str(raw['e/ch_admtype']) || null,
    ch_ref: str(raw['e/ch_ref']) || null,
    ch_where: str(raw['e/ch_where']) || null,
    ch_disch: str(raw['e/ch_disch']) || null,
    c_attend: (str(get('c_attend')) || null) as 'yes' | 'no' | null,
    c_cont: (str(get('c_cont')) || null) as CaregiverRecord['c_cont'],
    c_ref_completed: (str(raw['v/c_ref_completed']) || null) as 'yes' | 'no' | 'dk' | null,
    c_bar: str(get('c_bar')) || null,
    c_cost: num(get('c_cost')),
    c_untr: (str(raw['v/c_untr']) || null) as 'yes' | 'no' | null,
    c_muac: num(raw['v/c_muac']),
  }
}

async function fetchAll(asset: 'facility' | 'caregiver'): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = []
  let start = 0
  const limit = 3000

  while (true) {
    const res = await fetch(`${PROXY_URL}?asset=${asset}&limit=${limit}&start=${start}`)
    if (!res.ok) throw new Error(`Proxy returned ${res.status}`)
    const data: KoboResponse = await res.json()
    all.push(...data.results)
    if (!data.next || data.results.length < limit) break
    start += limit
  }

  return all
}

export async function fetchFacilities(): Promise<FacilityRecord[]> {
  const raw = await fetchAll('facility')
  return raw.map(mapFacility)
}

export async function fetchCaregivers(): Promise<CaregiverRecord[]> {
  const raw = await fetchAll('caregiver')
  return raw.map(mapCaregiver)
}
