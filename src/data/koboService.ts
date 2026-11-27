import type { FacilityRecord, CaregiverRecord, MonthlyRecord, PatientRecord } from '@/types'

const PROXY_URL = '/.netlify/functions/kobo-proxy'

interface KoboResponse {
  count: number
  next: string | null
  results: Record<string, unknown>[]
}

function num(v: unknown): number | null {
  if (v == null || v === '' || v === 'NaN') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function str(v: unknown): string {
  return v == null ? '' : String(v)
}

function mapMonthly(raw: Record<string, unknown>): MonthlyRecord {
  const g = (key: string) => raw[`c/c_month/${key}`]
  return {
    m_idx: num(g('m_idx')) ?? 0,
    m_label: str(g('m_label')),
    m_avail: (str(g('m_avail')) || 'no') as 'yes' | 'no' | 'partial',
    m_rep: num(g('m_rep')),
    m_new: num(g('m_new')),
    m_readm: num(g('m_readm')),
    m_tin: num(g('m_tin')),
    m_sumin: num(g('m_sumin')),
    m_cured: num(g('m_cured')),
    m_def: num(g('m_def')),
    m_died: num(g('m_died')),
    m_tout: num(g('m_tout')),
    m_nonresp: num(g('m_nonresp')),
    m_disc: num(g('m_disc')),
    m_stock: (str(g('m_stock')) || 'unknown') as 'yes' | 'no' | 'unknown',
    m_card: (str(g('m_card')) || 'no') as 'yes' | 'no' | 'partial',
    m_rrec: num(g('m_rrec')),
    m_rdisp: num(g('m_rdisp')),
    m_imam: num(g('m_imam')),
    m_dhis2: num(g('m_dhis2_n')),
  }
}

function mapPatient(raw: Record<string, unknown>): PatientRecord {
  const g = (key: string) => raw[`d/d_rec/${key}`]
  return {
    r_sn: num(g('r_sn')) ?? 0,
    r_id: str(g('r_id')),
    r_adate: str(g('r_adate')) || null,
    r_age: num(g('r_age')),
    r_sex: (str(g('r_sex')) || null) as 'm' | 'f' | null,
    r_muac: num(g('r_muac')),
    r_whz: num(g('r_whz')),
    r_oed: str(g('r_oed')) || null,
    r_sam: str(g('r_sam')),
    r_mod: str(g('r_mod')),
    r_rutf: str(g('r_rutf')),
    r_sach: num(g('r_sach')),
    r_wks: num(g('r_wks')),
    r_out: str(g('r_out')),
    r_compl: str(g('r_compl')),
    r_class: (str(g('r_class')) || 'unverifiable') as PatientRecord['r_class'],
  }
}

function mapFacility(raw: Record<string, unknown>): FacilityRecord {
  const monthlyArr = (raw['c/c_month'] ?? []) as Record<string, unknown>[]
  const monthlyData = monthlyArr.map(mapMonthly)

  const patientArr = (raw['d/d_rec'] ?? []) as Record<string, unknown>[]
  const patientRecords = patientArr.map(mapPatient)

  const state = str(raw['a/a_state']).toLowerCase() as 'kano' | 'kaduna'
  const hmech = raw['h/h_mech']
  const mechArr = Array.isArray(hmech) ? hmech as string[] : str(hmech).split(' ').filter(Boolean)

  return {
    _id: Number(raw._id) || 0,
    _uuid: str(raw._uuid),
    _submission_time: str(raw._submission_time),
    _version: str(raw.__version__ ?? raw._version),
    start: str(raw.start),
    end: str(raw.end),
    today: str(raw.today),
    a_date: str(raw['a/a_date']),
    a_team: str(raw['a/a_team']),
    a_sup: str(raw['a/a_sup']),
    a_state: state,
    a_lga: str(raw['a/a_lga']),
    a_repl: str(raw['a/a_repl']) as 'yes' | 'no',
    a_repl_of: str(raw['a/a_repl_of']) || null,
    a_repl_why: str(raw['a/a_repl_why']) || null,
    a_fac: str(raw['a/a_fac']),
    pre_cat: str(raw['a/pre_cat']),
    pre_fname: str(raw['a/pre_fname']),
    pre_imam_name: str(raw['a/pre_imam_name']),
    pre_dhis2_name: str(raw['a/pre_dhis2_name']),
    pre_ward: str(raw['a/a_ward']),
    pre_stratum: str(raw['a/pre_stratum']),
    pre_weight: num(raw['a/pre_weight']),
    pre_frame_no: str(raw['a/pre_frame_no']),
    pre_sc: str(raw['a/pre_otp']),
    a_type: str(raw['a/a_type']),
    a_gps: str(raw['a/a_gps']) || null,
    a_lat: num(raw['a/a_lat']),
    a_lon: num(raw['a/a_lon']),
    a_photo_taken: str(raw['a/a_photo_taken']) as 'Yes' | 'No',
    a_lead: str(raw['a/a_lead']),
    a_arrive: str(raw['a/a_arrive']),

    b1: str(raw['b/b1']),
    b2: str(raw['b/b_more/b2']),
    b5: str(raw['b/b_more/b5']),
    b9: num(raw['b/b_more/b9']),
    b18: str(raw['b/b_more/b18']),
    b19: str(raw['b/b_more/b19']),
    b20: str(raw['b/b_more/b20']),
    b27: (str(raw['b/b_more/b27']) || null) as FacilityRecord['b27'],

    c_tot_rep: num(raw['c/c_tot_rep']),
    c_tot_ver: num(raw['c/c_tot_ver']),
    c_tot_imam: num(raw['c/c_tot_imam']),
    c_tot_dhis2: num(raw['c/c_tot_dhis2']),
    c_rate: num(raw['c/c_rate']),
    c_rate_d: num(raw['c/c_rate_d']),
    c_months_avail: num(raw['c/c_months_avail']),
    c_tot_cured: num(raw['c/c_tot_cured']),
    c_tot_def: num(raw['c/c_tot_def']),
    c_tot_died: num(raw['c/c_tot_died']),
    c_exits: num(raw['c/c_exits']),
    c_cure: num(raw['c/c_cure']),
    c_stock_months: num(raw['c/c_stock_months']),
    c_stock_adm: num(raw['c/c_stock_adm']),
    c_norutf_adm: num(raw['c/c_norutf_adm']),
    c_rrec: num(raw['c/c_rrec']),
    c_rdisp: num(raw['c/c_rdisp']),

    d_rev: num(raw['d/d_rev']),
    d_valid: num(raw['d/d_valid']),
    d_invalid: num(raw['d/d_invalid']),
    d_unver: num(raw['d/d_unver']),
    d_alt: num(raw['d/d_alt']),
    d_comorb: num(raw['d/d_comorb']),

    e1: str(raw['e/e1']),
    e_acc: num(raw['e/e_acc']),
    e_courses: num(raw['e/e_courses']),
    e_unexp: num(raw['e/e_unexp']),
    e_match: (str(raw['e/e_match']) || null) as 'yes' | 'no' | null,
    e_phys: num(raw['e/e_phys']),

    h_gap: num(raw['h/h_gap']),
    h_gap_v: num(raw['h/h_gap_v']),
    h_mech: mechArr,
    h_dq: (str(raw['h/h_dq']) || null) as FacilityRecord['h_dq'],
    h_func_cls: (str(raw['h/h_func_cls']) || null) as FacilityRecord['h_func_cls'],
    h_anom: str(raw['h/h_anom']) || null,

    a_outcome: str(raw['z/a_outcome']) as FacilityRecord['a_outcome'],
    z_gps: str(raw['z/z_gps']) || null,

    p_spc: num(raw['p_spc']) ?? 150,
    p_course: num(raw['p_course']) ?? 150,
    p_wastage: num(raw['p_wastage']) ?? 0.05,

    monthlyData,
    patientRecords,
  }
}

function mapCaregiver(raw: Record<string, unknown>): CaregiverRecord {
  const state = str(raw['a/a_state']).toLowerCase() as 'kano' | 'kaduna'

  return {
    _id: Number(raw._id) || 0,
    _uuid: str(raw._uuid),
    _submission_time: str(raw._submission_time),
    _version: str(raw.__version__ ?? raw._version),
    start: str(raw.start),
    end: str(raw.end),
    a_date: str(raw['a/a_date']),
    a_team: str(raw['a/a_team']),
    a_state: state,
    a_lga: str(raw['a/a_lga']),
    a_repl: str(raw['a/a_repl']) as 'yes' | 'no',
    a_fac: str(raw['a/a_fac']),
    pre_fname: str(raw['a/pre_fname']),
    c_cat: str(raw['g/c_cat']) as CaregiverRecord['c_cat'],
    c_no: num(raw['g/c_no']),
    c_pid: str(raw['g/c_pid']),
    c_contact: str(raw['g/c_contact']) as CaregiverRecord['c_contact'],
    c_meth: str(raw['g/c_meth']) || null,
    c_consent: (str(raw['g/c_consent']) || null) as 'yes' | 'no' | null,
    m_rel: str(raw['m/m_rel']) || null,
    m_age: num(raw['m/m_age']),
    m_edu: str(raw['m/m_edu']) || null,
    m_u5: num(raw['m/m_u5']),
    ch_age: num(raw['ch/ch_age']),
    ch_sex: (str(raw['ch/ch_sex']) || null) as 'm' | 'f' | null,
    ch_adm_date: str(raw['ch/ch_adm_date']) || null,
    ch_admtype: str(raw['ch/ch_admtype']) || null,
    ch_ref: str(raw['ch/ch_ref']) || null,
    ch_where: str(raw['ch/ch_where']) || null,
    ch_disch: str(raw['ch/ch_disch']) || null,
    c_attend: (str(raw['v/c_attend']) || null) as 'yes' | 'no' | null,
    c_cont: (str(raw['v/c_cont']) || null) as CaregiverRecord['c_cont'],
    c_ref_completed: (str(raw['v/c_ref_completed']) || null) as 'yes' | 'no' | 'dk' | null,
    c_bar: str(raw['v/c_bar']) || null,
    c_cost: num(raw['v/c_cost']),
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
