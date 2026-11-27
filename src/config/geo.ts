/**
 * LGA name reconciliation between XLSForm codes, boundary file names,
 * and display labels. This is the single source of truth for geographic
 * name matching.
 */

export interface LgaMapping {
  koboCode: string
  label: string
  boundaryName: string
  state: 'kano' | 'kaduna'
  gid: string
}

export const LGA_MAPPINGS: LgaMapping[] = [
  // Kaduna (23 LGAs)
  { koboCode: 'birnin_gwari', label: 'Birnin Gwari', boundaryName: 'Birnin Gwari', state: 'kaduna', gid: 'NGA.19.1_1' },
  { koboCode: 'chikun', label: 'Chikun', boundaryName: 'Chikun', state: 'kaduna', gid: 'NGA.19.2_1' },
  { koboCode: 'giwa', label: 'Giwa', boundaryName: 'Giwa', state: 'kaduna', gid: 'NGA.19.3_1' },
  { koboCode: 'igabi', label: 'Igabi', boundaryName: 'Igabi', state: 'kaduna', gid: 'NGA.19.4_1' },
  { koboCode: 'ikara', label: 'Ikara', boundaryName: 'Ikara', state: 'kaduna', gid: 'NGA.19.5_1' },
  { koboCode: 'jaba', label: 'Jaba', boundaryName: 'Jaba', state: 'kaduna', gid: 'NGA.19.6_1' },
  { koboCode: 'jemaa', label: "Jema'a", boundaryName: "Jema'a", state: 'kaduna', gid: 'NGA.19.7_1' },
  { koboCode: 'kachia', label: 'Kachia', boundaryName: 'Kachia', state: 'kaduna', gid: 'NGA.19.8_1' },
  { koboCode: 'kaduna_north', label: 'Kaduna North', boundaryName: 'Kaduna North', state: 'kaduna', gid: 'NGA.19.9_1' },
  { koboCode: 'kaduna_south', label: 'Kaduna South', boundaryName: 'Kaduna South', state: 'kaduna', gid: 'NGA.19.10_1' },
  { koboCode: 'kagarko', label: 'Kagarko', boundaryName: 'Kagarko', state: 'kaduna', gid: 'NGA.19.11_1' },
  { koboCode: 'kajuru', label: 'Kajuru', boundaryName: 'Kajuru', state: 'kaduna', gid: 'NGA.19.12_1' },
  { koboCode: 'kaura', label: 'Kaura', boundaryName: 'Kaura', state: 'kaduna', gid: 'NGA.19.13_1' },
  { koboCode: 'kauru', label: 'Kauru', boundaryName: 'Kauru', state: 'kaduna', gid: 'NGA.19.14_1' },
  { koboCode: 'kubau', label: 'Kubau', boundaryName: 'Kubau', state: 'kaduna', gid: 'NGA.19.15_1' },
  { koboCode: 'kudan', label: 'Kudan', boundaryName: 'Kudan', state: 'kaduna', gid: 'NGA.19.16_1' },
  { koboCode: 'lere', label: 'Lere', boundaryName: 'Lere', state: 'kaduna', gid: 'NGA.19.17_1' },
  { koboCode: 'makarfi', label: 'Makarfi', boundaryName: 'Makarfi', state: 'kaduna', gid: 'NGA.19.18_1' },
  { koboCode: 'sabon_gari', label: 'Sabon Gari', boundaryName: 'Sabon Gari', state: 'kaduna', gid: 'NGA.19.19_1' },
  { koboCode: 'sanga', label: 'Sanga', boundaryName: 'Sanga', state: 'kaduna', gid: 'NGA.19.20_1' },
  { koboCode: 'soba', label: 'Soba', boundaryName: 'Soba', state: 'kaduna', gid: 'NGA.19.21_1' },
  { koboCode: 'zangon_kataf', label: 'Zangon Kataf', boundaryName: 'Zangon Kataf', state: 'kaduna', gid: 'NGA.19.22_1' },
  { koboCode: 'zaria', label: 'Zaria', boundaryName: 'Zaria', state: 'kaduna', gid: 'NGA.19.23_1' },

  // Kano (44 LGAs) — note boundary name discrepancies
  { koboCode: 'ajingi', label: 'Ajingi', boundaryName: 'Ajingi', state: 'kano', gid: 'NGA.20.1_1' },
  { koboCode: 'albasu', label: 'Albasu', boundaryName: 'Albasu', state: 'kano', gid: 'NGA.20.2_1' },
  { koboCode: 'bagwai', label: 'Bagwai', boundaryName: 'Bagwai', state: 'kano', gid: 'NGA.20.3_1' },
  { koboCode: 'bebeji', label: 'Bebeji', boundaryName: 'Bebeji', state: 'kano', gid: 'NGA.20.4_1' },
  { koboCode: 'bichi', label: 'Bichi', boundaryName: 'Bichi', state: 'kano', gid: 'NGA.20.5_1' },
  { koboCode: 'bunkure', label: 'Bunkure', boundaryName: 'Bunkure', state: 'kano', gid: 'NGA.20.6_1' },
  { koboCode: 'dala', label: 'Dala', boundaryName: 'Dala', state: 'kano', gid: 'NGA.20.7_1' },
  { koboCode: 'dambatta', label: 'Dambatta', boundaryName: 'Dambatta', state: 'kano', gid: 'NGA.20.8_1' },
  { koboCode: 'dawakin_kudu', label: 'Dawakin Kudu', boundaryName: 'Dawakin Kudu', state: 'kano', gid: 'NGA.20.9_1' },
  { koboCode: 'dawakin_tofa', label: 'Dawakin Tofa', boundaryName: 'Dawakin Tofa', state: 'kano', gid: 'NGA.20.10_1' },
  { koboCode: 'doguwa', label: 'Doguwa', boundaryName: 'Doguwa', state: 'kano', gid: 'NGA.20.11_1' },
  { koboCode: 'fagge', label: 'Fagge', boundaryName: 'Fagge', state: 'kano', gid: 'NGA.20.12_1' },
  { koboCode: 'gabasawa', label: 'Gabasawa', boundaryName: 'Gabasawa', state: 'kano', gid: 'NGA.20.13_1' },
  { koboCode: 'garko', label: 'Garko', boundaryName: 'Garko', state: 'kano', gid: 'NGA.20.14_1' },
  { koboCode: 'garun_mallam', label: 'Garun Mallam', boundaryName: 'Garum Mallam', state: 'kano', gid: 'NGA.20.15_1' },
  { koboCode: 'gaya', label: 'Gaya', boundaryName: 'Gaya', state: 'kano', gid: 'NGA.20.16_1' },
  { koboCode: 'gezawa', label: 'Gezawa', boundaryName: 'Gezawa', state: 'kano', gid: 'NGA.20.17_1' },
  { koboCode: 'gwale', label: 'Gwale', boundaryName: 'Gwale', state: 'kano', gid: 'NGA.20.18_1' },
  { koboCode: 'gwarzo', label: 'Gwarzo', boundaryName: 'Gwarzo', state: 'kano', gid: 'NGA.20.19_1' },
  { koboCode: 'kabo', label: 'Kabo', boundaryName: 'Kabo', state: 'kano', gid: 'NGA.20.20_1' },
  { koboCode: 'kano_municipal', label: 'Kano Municipal', boundaryName: 'Kano', state: 'kano', gid: 'NGA.20.21_1' },
  { koboCode: 'karaye', label: 'Karaye', boundaryName: 'Karaye', state: 'kano', gid: 'NGA.20.22_1' },
  { koboCode: 'kibiya', label: 'Kibiya', boundaryName: 'Kibiya', state: 'kano', gid: 'NGA.20.23_1' },
  { koboCode: 'kiru', label: 'Kiru', boundaryName: 'Kiru', state: 'kano', gid: 'NGA.20.24_1' },
  { koboCode: 'kumbotso', label: 'Kumbotso', boundaryName: 'Kumbotso', state: 'kano', gid: 'NGA.20.25_1' },
  { koboCode: 'kunchi', label: 'Kunchi', boundaryName: 'Kunchi', state: 'kano', gid: 'NGA.20.26_1' },
  { koboCode: 'kura', label: 'Kura', boundaryName: 'Kura', state: 'kano', gid: 'NGA.20.27_1' },
  { koboCode: 'madobi', label: 'Madobi', boundaryName: 'Madobi', state: 'kano', gid: 'NGA.20.28_1' },
  { koboCode: 'makoda', label: 'Makoda', boundaryName: 'Makoda', state: 'kano', gid: 'NGA.20.29_1' },
  { koboCode: 'minjibir', label: 'Minjibir', boundaryName: 'Minjibir', state: 'kano', gid: 'NGA.20.30_1' },
  { koboCode: 'nasarawa', label: 'Nasarawa', boundaryName: 'Nasarawa', state: 'kano', gid: 'NGA.20.31_1' },
  { koboCode: 'rano', label: 'Rano', boundaryName: 'Rano', state: 'kano', gid: 'NGA.20.32_1' },
  { koboCode: 'rimin_gado', label: 'Rimin Gado', boundaryName: 'Rimin Gado', state: 'kano', gid: 'NGA.20.33_1' },
  { koboCode: 'rogo', label: 'Rogo', boundaryName: 'Rogo', state: 'kano', gid: 'NGA.20.34_1' },
  { koboCode: 'shanono', label: 'Shanono', boundaryName: 'Shanono', state: 'kano', gid: 'NGA.20.35_1' },
  { koboCode: 'sumaila', label: 'Sumaila', boundaryName: 'Sumaila', state: 'kano', gid: 'NGA.20.36_1' },
  { koboCode: 'takai', label: 'Takai', boundaryName: 'Takai', state: 'kano', gid: 'NGA.20.37_1' },
  { koboCode: 'tarauni', label: 'Tarauni', boundaryName: 'Tarauni', state: 'kano', gid: 'NGA.20.38_1' },
  { koboCode: 'tofa', label: 'Tofa', boundaryName: 'Tofa', state: 'kano', gid: 'NGA.20.39_1' },
  { koboCode: 'tsanyawa', label: 'Tsanyawa', boundaryName: 'Tsanyawa', state: 'kano', gid: 'NGA.20.40_1' },
  { koboCode: 'tudun_wada', label: 'Tudun Wada', boundaryName: 'Tudun Wada', state: 'kano', gid: 'NGA.20.41_1' },
  { koboCode: 'ungogo', label: 'Ungogo', boundaryName: 'Ungogo', state: 'kano', gid: 'NGA.20.42_1' },
  { koboCode: 'warawa', label: 'Warawa', boundaryName: 'Warawa', state: 'kano', gid: 'NGA.20.43_1' },
  { koboCode: 'wudil', label: 'Wudil', boundaryName: 'Wudil', state: 'kano', gid: 'NGA.20.44_1' },
]

/** Build lookup maps */
const byKobo = new Map(LGA_MAPPINGS.map(m => [m.koboCode, m]))
const byBoundary = new Map(LGA_MAPPINGS.map(m => [`${m.state}|${m.boundaryName.toLowerCase()}`, m]))

export function lgaFromKoboCode(code: string): LgaMapping | undefined {
  return byKobo.get(code)
}

export function lgaFromBoundaryName(state: string, name: string): LgaMapping | undefined {
  return byBoundary.get(`${state.toLowerCase()}|${name.toLowerCase()}`)
}

export function getLgaLabel(koboCode: string): string {
  return byKobo.get(koboCode)?.label ?? koboCode
}

export function getStateLabel(code: string): string {
  return code === 'kano' ? 'Kano' : code === 'kaduna' ? 'Kaduna' : code
}

export const SAMPLING_TARGETS = {
  kaduna: { facilities: 168, lgas: 23 },
  kano: { facilities: 142, lgas: 44 },
  total: { facilities: 310, lgas: 67 },
}

export const STRATUM_TARGETS = {
  sc_census: { kaduna: 23, kano: 2, total: 25 },
  certainty: { kaduna: 90, kano: 85, total: 175 },
  random_reporting: { kaduna: 25, kano: 25, total: 50 },
  random_non_reporting: { kaduna: 30, kano: 30, total: 60 },
}

export const CAREGIVER_TARGET_PER_FACILITY = 3
