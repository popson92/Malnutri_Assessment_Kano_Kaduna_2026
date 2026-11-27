/**
 * Central field-mapping configuration.
 *
 * Maps canonical internal variable names to raw KoboToolbox field paths
 * across form versions. When a questionnaire update changes field names
 * or group paths, only this file needs updating.
 */

export interface FieldMapping {
  canonical: string
  v5: string
  v4?: string
  v3?: string
  description: string
}

export const FACILITY_FIELDS: FieldMapping[] = [
  // Section A
  { canonical: 'a_date', v5: 'a/a_date', v4: 'a/a_date', description: 'Date of visit' },
  { canonical: 'a_team', v5: 'a/a_team', v4: 'a/a_team', description: 'Team code' },
  { canonical: 'a_sup', v5: 'a/a_sup', v4: 'a/a_sup', description: 'Supervisor name' },
  { canonical: 'a_state', v5: 'a/a_state', v4: 'a/a_state', description: 'State' },
  { canonical: 'a_lga', v5: 'a/a_lga', v4: 'a/a_lga', description: 'LGA' },
  { canonical: 'a_repl', v5: 'a/a_repl', v4: 'a/a_repl', description: 'Is replacement' },
  { canonical: 'a_repl_of', v5: 'a/a_repl_of', v4: 'a/a_repl_of', description: 'Replaces which facility' },
  { canonical: 'a_repl_why', v5: 'a/a_repl_why', v4: 'a/a_repl_why', description: 'Replacement reason' },
  { canonical: 'a_fac', v5: 'a/a_fac', v4: 'a/a_fac', description: 'Facility code' },
  { canonical: 'pre_stratum', v5: 'a/pre_stratum', v4: 'a/pre_stratum', description: 'Sampling stratum' },
  { canonical: 'pre_weight', v5: 'a/pre_weight', v4: 'a/pre_weight', description: 'Sampling weight' },
  { canonical: 'pre_frame_no', v5: 'a/pre_frame_no', v4: 'a/pre_frame_no', description: 'Sampling frame number' },
  { canonical: 'a_lat', v5: 'a/a_lat', v4: 'a/a_lat', description: 'GPS latitude' },
  { canonical: 'a_lon', v5: 'a/a_lon', v4: 'a/a_lon', description: 'GPS longitude' },
  { canonical: 'a_outcome', v5: 'z/a_outcome', v4: 'z/a_outcome', description: 'Visit outcome' },
  { canonical: 'a_photo_taken', v5: 'a/a_photo_taken', v4: 'a/a_photo_taken', description: 'Photo taken' },

  // Section B
  { canonical: 'b1', v5: 'b/b1', v4: 'b/b1', description: 'Facility operating' },
  { canonical: 'b27', v5: 'b/b27', v4: 'b/b27', description: 'Functionality rating' },

  // Section C totals (calculated)
  { canonical: 'c_tot_rep', v5: 'c_tot_rep', v4: 'c_tot_rep', description: 'Total reported admissions' },
  { canonical: 'c_tot_ver', v5: 'c_tot_ver', v4: 'c_tot_ver', description: 'Total verified admissions' },
  { canonical: 'c_rate', v5: 'c_rate', v4: 'c_rate', description: 'Verification ratio (reported)' },
  { canonical: 'c_months_avail', v5: 'c_months_avail', v4: 'c_months_avail', description: 'Months with register data' },
  { canonical: 'c_cure', v5: 'c_cure', v4: 'c_cure', description: 'Cure rate' },
  { canonical: 'c_stock_months', v5: 'c_stock_months', v4: 'c_stock_months', description: 'Stockout months' },

  // Section D totals
  { canonical: 'd_rev', v5: 'd_rev', v4: 'd_rev', description: 'Records reviewed' },
  { canonical: 'd_valid', v5: 'd_valid', v4: 'd_valid', description: 'Valid records' },

  // Section E
  { canonical: 'e_acc', v5: 'e_acc', v4: 'e_acc', description: 'Accountable RUTF (sachets)' },
  { canonical: 'e_courses', v5: 'e_courses', v4: 'e_courses', description: 'Implied treatment courses' },
  { canonical: 'e_unexp', v5: 'e_unexp', v4: 'e_unexp', description: 'Unexplained RUTF difference' },
  { canonical: 'e_match', v5: 'e_match', v4: 'e_match', description: 'Physical stock matches card' },

  // Section G
  { canonical: 'h_gap', v5: 'h/h_gap', v4: 'h/h_gap', description: 'Admissions-RUTF gap (reported)' },
  { canonical: 'h_gap_v', v5: 'h/h_gap_v', v4: 'h/h_gap_v', description: 'Admissions-RUTF gap (verified)' },
  { canonical: 'h_dq', v5: 'h/h_dq', v4: 'h/h_dq', description: 'Data quality rating' },
  { canonical: 'h_func_cls', v5: 'h/h_func_cls', v4: 'h/h_func_cls', description: 'Functionality classification' },
]

export const CAREGIVER_FIELDS: FieldMapping[] = [
  { canonical: 'a_date', v5: 'a/a_date', v3: 'a/a_date', description: 'Interview date' },
  { canonical: 'a_team', v5: 'a/a_team', v3: 'a/a_team', description: 'Team code' },
  { canonical: 'a_state', v5: 'a/a_state', v3: 'a/a_state', description: 'State' },
  { canonical: 'a_lga', v5: 'a/a_lga', v3: 'a/a_lga', description: 'LGA' },
  { canonical: 'a_fac', v5: 'a/a_fac', v3: 'a/a_fac', description: 'Facility code' },
  { canonical: 'c_cat', v5: 'g/c_cat', v3: 'g/c_cat', description: 'Caregiver category' },
  { canonical: 'c_no', v5: 'g/c_no', v3: 'g/c_no', description: 'Caregiver number' },
  { canonical: 'c_pid', v5: 'g/c_pid', v3: 'g/c_pid', description: 'Patient ID' },
  { canonical: 'c_contact', v5: 'g/c_contact', v3: 'g/c_contact', description: 'Contact outcome' },
  { canonical: 'c_consent', v5: 'g/c_consent', v3: 'g/c_consent', description: 'Consent' },
  { canonical: 'c_attend', v5: 'v/c_attend', v3: 'v/c_attend', description: 'Confirmed attendance' },
  { canonical: 'c_cont', v5: 'v/c_cont', v3: 'v/c_cont', description: 'RUTF continuity' },
  { canonical: 'c_bar', v5: 'v/c_bar', v3: 'v/c_bar', description: 'Main barrier' },
  { canonical: 'c_cost', v5: 'v/c_cost', v3: 'v/c_cost', description: 'Treatment cost (NGN)' },
]

/** MUAC unit by form version. v5 uses cm. */
export const MUAC_UNIT: Record<string, 'cm' | 'mm'> = {
  v5: 'cm',
  v4: 'cm',
  v3: 'cm',
}

/** Default parameters — overridden by form pulldata if available. */
export const DEFAULT_PARAMS = {
  sachetsPerCarton: 150,
  sachetsPerCourse: 140,
  wastageAllowance: 0.05,
}

/** 24-month reference period labels (Sep 2024 – Aug 2026) */
export const REFERENCE_MONTHS = Array.from({ length: 24 }, (_, i) => {
  const y = 2024 + Math.floor((i + 8) / 12)
  const m = ((i + 8) % 12) + 1
  return `${y}-${String(m).padStart(2, '0')}`
})
