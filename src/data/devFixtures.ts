import type { FacilityRecord, CaregiverRecord, State, VisitOutcome, MonthlyRecord, PatientRecord } from '@/types'
import { LGA_MAPPINGS, SAMPLING_TARGETS } from '@/config/geo'
import { REFERENCE_MONTHS } from '@/config/fieldMappings'

const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const uuid = () => crypto.randomUUID()

const teams = ['KN-01', 'KN-02', 'KN-03', 'KN-04', 'KN-05', 'KD-01', 'KD-02', 'KD-03', 'KD-04', 'KD-05']
const supervisors = ['Sup A', 'Sup B', 'Sup C', 'Sup D', 'Sup E']
const strata = ['certainty', 'random_reporting', 'random_non_reporting', 'sc_census']
const outcomes: VisitOutcome[] = ['completed', 'completed', 'completed', 'completed', 'partial', 'closed', 'not_sam_site', 'inaccessible']

function genMonthly(): MonthlyRecord[] {
  return REFERENCE_MONTHS.map((label, idx) => {
    const avail = Math.random() > 0.15 ? 'yes' : Math.random() > 0.5 ? 'partial' : 'no'
    const hasData = avail !== 'no'
    const newAdm = hasData ? rng(0, 15) : null
    const readm = hasData ? rng(0, 3) : null
    const tin = hasData ? rng(0, 2) : null
    const sumin = hasData ? (newAdm ?? 0) + (readm ?? 0) + (tin ?? 0) : null
    const rep = hasData ? (sumin ?? 0) + rng(-3, 5) : null
    return {
      m_idx: idx + 1,
      m_label: label,
      m_avail: avail as 'yes' | 'no' | 'partial',
      m_rep: rep,
      m_new: newAdm,
      m_readm: readm,
      m_tin: tin,
      m_sumin: sumin,
      m_cured: hasData ? rng(0, (sumin ?? 0)) : null,
      m_def: hasData ? rng(0, 3) : null,
      m_died: hasData ? rng(0, 1) : null,
      m_tout: hasData ? rng(0, 2) : null,
      m_nonresp: hasData ? rng(0, 1) : null,
      m_disc: hasData && rep != null && sumin != null ? rep - sumin : null,
      m_stock: hasData ? (Math.random() > 0.85 ? 'yes' : 'no') : 'unknown',
      m_card: hasData ? (Math.random() > 0.2 ? 'yes' : 'partial') : 'no',
      m_rrec: hasData ? rng(0, 300) : null,
      m_rdisp: hasData ? rng(0, 250) : null,
      m_imam: rep,
      m_dhis2: hasData ? (rep ?? 0) + rng(-2, 3) : null,
    }
  })
}

function genPatients(n: number): PatientRecord[] {
  const classes = ['valid', 'valid', 'valid', 'invalid', 'unverifiable', 'alternative', 'comorbidity'] as const
  return Array.from({ length: n }, (_, i) => ({
    r_sn: i + 1,
    r_id: `P-${rng(100, 999)}`,
    r_adate: `2026-${String(rng(1, 8)).padStart(2, '0')}-${String(rng(1, 28)).padStart(2, '0')}`,
    r_age: rng(6, 59),
    r_sex: Math.random() > 0.5 ? 'm' as const : 'f' as const,
    r_muac: parseFloat((rng(90, 130) / 10).toFixed(1)),
    r_whz: parseFloat((rng(-40, -15) / 10).toFixed(1)),
    r_oed: Math.random() > 0.9 ? 'yes' : 'no',
    r_sam: Math.random() > 0.2 ? 'Yes' : 'No',
    r_mod: pick(['otp_rutf', 'otp_rutf', 'sc', 'counsel']),
    r_rutf: Math.random() > 0.15 ? 'yes' : 'no',
    r_sach: rng(28, 196),
    r_wks: rng(4, 16),
    r_out: pick(['cured', 'cured', 'default', 'active', 'transfer']),
    r_compl: pick(['complete', 'complete', 'partial', 'poor']),
    r_class: pick(classes),
  }))
}

export function generateDevFacilities(): FacilityRecord[] {
  const facilities: FacilityRecord[] = []
  let id = 1

  for (const state of ['kano', 'kaduna'] as State[]) {
    const stateLgas = LGA_MAPPINGS.filter(m => m.state === state)
    const target = SAMPLING_TARGETS[state].facilities
    const count = Math.min(target, Math.floor(target * 0.6) + rng(0, 10))

    for (let i = 0; i < count; i++) {
      const lga = pick(stateLgas)
      const teamPrefix = state === 'kano' ? 'KN' : 'KD'
      const team = `${teamPrefix}-${String(rng(1, 5)).padStart(2, '0')}`
      const outcome = pick(outcomes)
      const isCompleted = outcome === 'completed'
      const monthly = isCompleted ? genMonthly() : []
      const patients = isCompleted ? genPatients(rng(3, 5)) : []

      const totRep = monthly.reduce((s, m) => s + (m.m_rep ?? 0), 0)
      const totVer = monthly.reduce((s, m) => s + (m.m_sumin ?? 0), 0)
      const totCured = monthly.reduce((s, m) => s + (m.m_cured ?? 0), 0)
      const totDef = monthly.reduce((s, m) => s + (m.m_def ?? 0), 0)
      const totDied = monthly.reduce((s, m) => s + (m.m_died ?? 0), 0)
      const totNonresp = monthly.reduce((s, m) => s + (m.m_nonresp ?? 0), 0)
      const exits = totCured + totDef + totDied + totNonresp
      const monthsAvail = monthly.filter(m => m.m_avail === 'yes').length
      const stockMonths = monthly.filter(m => m.m_stock === 'yes').length
      const rrec = monthly.reduce((s, m) => s + (m.m_rrec ?? 0), 0)
      const rdisp = monthly.reduce((s, m) => s + (m.m_rdisp ?? 0), 0)

      const e_acc = isCompleted ? rng(500, 5000) : null
      const e_courses = e_acc ? Math.round(e_acc / 140) : null
      const e_unexp = e_acc && rdisp ? e_acc - rdisp : null

      const facCode = `${state.substring(0, 2).toUpperCase()}_${lga.koboCode}_${String(i + 1).padStart(3, '0')}`
      const visitDate = `2026-11-${String(rng(10, 25)).padStart(2, '0')}`

      facilities.push({
        _id: id++,
        _uuid: uuid(),
        _submission_time: `${visitDate}T${String(rng(8, 17)).padStart(2, '0')}:${String(rng(0, 59)).padStart(2, '0')}:00`,
        _version: '2026112602',
        start: `${visitDate}T08:${String(rng(0, 59)).padStart(2, '0')}:00`,
        end: `${visitDate}T${String(rng(12, 17)).padStart(2, '0')}:${String(rng(0, 59)).padStart(2, '0')}:00`,
        today: visitDate,
        a_date: visitDate,
        a_team: team,
        a_sup: pick(supervisors),
        a_state: state,
        a_lga: lga.koboCode,
        a_repl: Math.random() > 0.9 ? 'yes' : 'no',
        a_repl_of: null,
        a_repl_why: null,
        a_fac: facCode,
        pre_cat: pick(['both', 'imam_only', 'dhis2_only']),
        pre_fname: `${lga.label} PHC ${i + 1}`,
        pre_imam_name: `${lga.label} PHC ${i + 1}`,
        pre_dhis2_name: `${lga.label} PHC ${i + 1}`,
        pre_ward: `Ward ${rng(1, 5)}`,
        pre_stratum: pick(strata),
        pre_weight: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
        pre_frame_no: String(rng(1, 500)),
        pre_sc: Math.random() > 0.9 ? 'yes' : 'no',
        a_type: pick(['phc', 'phc', 'gh', 'chc']),
        a_gps: `${9 + Math.random() * 3} ${7 + Math.random() * 2}`,
        a_lat: 9 + Math.random() * 3,
        a_lon: 7 + Math.random() * 2,
        a_photo_taken: Math.random() > 0.1 ? 'Yes' : 'No',
        a_lead: `Leader ${team}`,
        a_arrive: `${String(rng(8, 10)).padStart(2, '0')}:${String(rng(0, 59)).padStart(2, '0')}`,
        b1: isCompleted || outcome === 'partial' ? 'yes' : pick(['no', 'not_reached']),
        b2: isCompleted ? 'yes' : pick(['yes', 'no']),
        b5: Math.random() > 0.9 ? 'yes' : 'no',
        b9: rng(0, 5),
        b18: pick(['yes_sighted', 'yes_not_sighted', 'no']),
        b19: pick(['yes', 'no']),
        b20: pick(['yes_sighted', 'yes_not_sighted', 'no']),
        b27: isCompleted ? pick(['fully', 'partially', 'non']) : null,
        c_tot_rep: isCompleted ? totRep : null,
        c_tot_ver: isCompleted ? totVer : null,
        c_tot_imam: isCompleted ? totRep : null,
        c_tot_dhis2: isCompleted ? totRep + rng(-10, 10) : null,
        c_rate: isCompleted && totRep > 0 ? parseFloat((totVer / totRep).toFixed(3)) : null,
        c_rate_d: null,
        c_months_avail: isCompleted ? monthsAvail : null,
        c_tot_cured: isCompleted ? totCured : null,
        c_tot_def: isCompleted ? totDef : null,
        c_tot_died: isCompleted ? totDied : null,
        c_exits: isCompleted ? exits : null,
        c_cure: isCompleted && exits > 0 ? parseFloat((totCured / exits).toFixed(3)) : null,
        c_stock_months: isCompleted ? stockMonths : null,
        c_stock_adm: isCompleted ? rng(0, 20) : null,
        c_norutf_adm: isCompleted ? rng(0, 10) : null,
        c_rrec: isCompleted ? rrec : null,
        c_rdisp: isCompleted ? rdisp : null,
        d_rev: isCompleted ? patients.length : null,
        d_valid: isCompleted ? patients.filter(p => p.r_class === 'valid').length : null,
        d_invalid: isCompleted ? patients.filter(p => p.r_class === 'invalid').length : null,
        d_unver: isCompleted ? patients.filter(p => p.r_class === 'unverifiable').length : null,
        d_alt: isCompleted ? patients.filter(p => p.r_class === 'alternative').length : null,
        d_comorb: isCompleted ? patients.filter(p => p.r_class === 'comorbidity').length : null,
        e1: isCompleted ? 'yes_sighted' : 'no',
        e_acc: e_acc,
        e_courses: e_courses,
        e_unexp: e_unexp,
        e_match: isCompleted ? (Math.random() > 0.3 ? 'yes' : 'no') : null,
        e_phys: isCompleted ? rng(100, 2000) : null,
        h_gap: isCompleted && e_courses ? Math.round(totRep - e_courses) : null,
        h_gap_v: isCompleted && e_courses ? Math.round(totVer - e_courses) : null,
        h_mech: isCompleted ? [pick(['aggregation', 'duplicate', 'misclass', 'none'])] : [],
        h_dq: isCompleted ? pick(['high', 'medium', 'low']) : null,
        h_func_cls: isCompleted ? pick(['fully', 'partially', 'non']) : null,
        h_anom: null,
        a_outcome: outcome,
        z_gps: null,
        p_spc: 150,
        p_course: 140,
        p_wastage: 0.05,
        monthlyData: monthly,
        patientRecords: patients,
      })
    }
  }

  return facilities
}

export function generateDevCaregivers(): CaregiverRecord[] {
  const caregivers: CaregiverRecord[] = []
  let id = 1
  const categories = ['completed', 'active', 'defaulted_referred', 'substitute'] as const
  const contacts = ['yes', 'yes', 'yes', 'no', 'untraceable'] as const
  const barriers = ['none', 'distance', 'cost', 'stockout', 'staff', 'duties'] as const

  for (const state of ['kano', 'kaduna'] as State[]) {
    const stateLgas = LGA_MAPPINGS.filter(m => m.state === state)
    const count = state === 'kano' ? rng(80, 120) : rng(100, 150)

    for (let i = 0; i < count; i++) {
      const lga = pick(stateLgas)
      const teamPrefix = state === 'kano' ? 'KN' : 'KD'
      const facCode = `${state.substring(0, 2).toUpperCase()}_${lga.koboCode}_${String(rng(1, 20)).padStart(3, '0')}`
      const contact = pick(contacts)
      const consent = contact === 'yes' ? (Math.random() > 0.05 ? 'yes' : 'no') as const : null

      caregivers.push({
        _id: id++,
        _uuid: uuid(),
        _submission_time: `2026-11-${String(rng(10, 25)).padStart(2, '0')}T${String(rng(8, 17)).padStart(2, '0')}:00:00`,
        _version: '2026112602',
        start: `2026-11-${String(rng(10, 25)).padStart(2, '0')}T09:00:00`,
        end: `2026-11-${String(rng(10, 25)).padStart(2, '0')}T09:${String(rng(15, 59)).padStart(2, '0')}:00`,
        a_date: `2026-11-${String(rng(10, 25)).padStart(2, '0')}`,
        a_team: `${teamPrefix}-${String(rng(1, 5)).padStart(2, '0')}`,
        a_state: state,
        a_lga: lga.koboCode,
        a_repl: 'no',
        a_fac: facCode,
        pre_fname: `${lga.label} PHC ${rng(1, 10)}`,
        c_cat: pick(categories),
        c_no: i + 1,
        c_pid: `PID-${rng(1000, 9999)}`,
        c_contact: contact,
        c_meth: contact === 'yes' ? pick(['phone', 'home', 'facility']) : null,
        c_consent: consent,
        m_rel: consent === 'yes' ? pick(['mother', 'father', 'grandmother']) : null,
        m_age: consent === 'yes' ? rng(18, 45) : null,
        m_edu: consent === 'yes' ? pick(['none', 'quranic', 'primary', 'secondary']) : null,
        m_u5: consent === 'yes' ? rng(1, 5) : null,
        ch_age: consent === 'yes' ? rng(6, 59) : null,
        ch_sex: consent === 'yes' ? (Math.random() > 0.5 ? 'm' : 'f') : null,
        ch_adm_date: consent === 'yes' ? `2026-${String(rng(1, 8)).padStart(2, '0')}-${String(rng(1, 28)).padStart(2, '0')}` : null,
        ch_admtype: consent === 'yes' ? pick(['new', 'readmission']) : null,
        ch_ref: consent === 'yes' ? pick(['facility', 'chv', 'self']) : null,
        ch_where: consent === 'yes' ? pick(['otp', 'otp', 'sc', 'both']) : null,
        ch_disch: consent === 'yes' ? pick(['active', 'cured', 'defaulted']) : null,
        c_attend: consent === 'yes' ? (Math.random() > 0.08 ? 'yes' : 'no') : null,
        c_cont: consent === 'yes' ? pick(['yes', 'yes', 'interrupted', 'no']) : null,
        c_ref_completed: null,
        c_bar: consent === 'yes' ? pick(barriers) : null,
        c_cost: consent === 'yes' ? rng(0, 5000) : null,
        c_untr: consent === 'yes' ? (Math.random() > 0.9 ? 'yes' : 'no') : null,
        c_muac: null,
      })
    }
  }

  return caregivers
}
