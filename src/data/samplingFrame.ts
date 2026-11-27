import type { State } from '@/types'

export interface LgaAllocation {
  state: State
  lga: string
  koboCode: string
  totalSelected: number
  census: number
  certainty: number
  randomReporting: number
  randomNonReporting: number
  frameTotal: number
  imamSites: number
}

export interface SamplingWeight {
  state: State
  stratum: string
  method: string
  frameN: number
  sampleN: number
  fraction: number
  designWeight: number
}

export const LGA_ALLOCATIONS: LgaAllocation[] = [
  { state: 'kaduna', lga: 'BIRNIN GWARI', koboCode: 'birnin_gwari', totalSelected: 7, census: 1, certainty: 6, randomReporting: 0, randomNonReporting: 0, frameTotal: 75, imamSites: 8 },
  { state: 'kaduna', lga: 'CHIKUN', koboCode: 'chikun', totalSelected: 6, census: 1, certainty: 5, randomReporting: 0, randomNonReporting: 0, frameTotal: 105, imamSites: 9 },
  { state: 'kaduna', lga: 'GIWA', koboCode: 'giwa', totalSelected: 11, census: 1, certainty: 6, randomReporting: 1, randomNonReporting: 3, frameTotal: 82, imamSites: 7 },
  { state: 'kaduna', lga: 'IGABI', koboCode: 'igabi', totalSelected: 9, census: 1, certainty: 7, randomReporting: 0, randomNonReporting: 1, frameTotal: 107, imamSites: 9 },
  { state: 'kaduna', lga: 'IKARA', koboCode: 'ikara', totalSelected: 6, census: 1, certainty: 4, randomReporting: 0, randomNonReporting: 1, frameTotal: 55, imamSites: 7 },
  { state: 'kaduna', lga: 'JABA', koboCode: 'jaba', totalSelected: 8, census: 1, certainty: 4, randomReporting: 1, randomNonReporting: 2, frameTotal: 57, imamSites: 7 },
  { state: 'kaduna', lga: "JEMA'A", koboCode: 'jemaa', totalSelected: 5, census: 1, certainty: 1, randomReporting: 1, randomNonReporting: 2, frameTotal: 76, imamSites: 7 },
  { state: 'kaduna', lga: 'KACHIA', koboCode: 'kachia', totalSelected: 7, census: 1, certainty: 4, randomReporting: 0, randomNonReporting: 2, frameTotal: 96, imamSites: 7 },
  { state: 'kaduna', lga: 'KADUNA NORTH', koboCode: 'kaduna_north', totalSelected: 5, census: 1, certainty: 1, randomReporting: 2, randomNonReporting: 1, frameTotal: 112, imamSites: 7 },
  { state: 'kaduna', lga: 'KADUNA SOUTH', koboCode: 'kaduna_south', totalSelected: 11, census: 1, certainty: 1, randomReporting: 5, randomNonReporting: 4, frameTotal: 88, imamSites: 7 },
  { state: 'kaduna', lga: 'KAGARKO', koboCode: 'kagarko', totalSelected: 10, census: 1, certainty: 7, randomReporting: 0, randomNonReporting: 2, frameTotal: 69, imamSites: 7 },
  { state: 'kaduna', lga: 'KAJURU', koboCode: 'kajuru', totalSelected: 4, census: 1, certainty: 0, randomReporting: 3, randomNonReporting: 0, frameTotal: 56, imamSites: 7 },
  { state: 'kaduna', lga: 'KAURA', koboCode: 'kaura', totalSelected: 3, census: 1, certainty: 0, randomReporting: 2, randomNonReporting: 0, frameTotal: 42, imamSites: 7 },
  { state: 'kaduna', lga: 'KAURU', koboCode: 'kauru', totalSelected: 8, census: 1, certainty: 3, randomReporting: 2, randomNonReporting: 2, frameTotal: 71, imamSites: 7 },
  { state: 'kaduna', lga: 'KUBAU', koboCode: 'kubau', totalSelected: 6, census: 1, certainty: 5, randomReporting: 0, randomNonReporting: 0, frameTotal: 66, imamSites: 7 },
  { state: 'kaduna', lga: 'KUDAN', koboCode: 'kudan', totalSelected: 7, census: 1, certainty: 6, randomReporting: 0, randomNonReporting: 0, frameTotal: 39, imamSites: 7 },
  { state: 'kaduna', lga: 'LERE', koboCode: 'lere', totalSelected: 10, census: 1, certainty: 7, randomReporting: 2, randomNonReporting: 0, frameTotal: 98, imamSites: 7 },
  { state: 'kaduna', lga: 'MAKARFI', koboCode: 'makarfi', totalSelected: 6, census: 1, certainty: 5, randomReporting: 0, randomNonReporting: 0, frameTotal: 57, imamSites: 7 },
  { state: 'kaduna', lga: 'SABON GARI', koboCode: 'sabon_gari', totalSelected: 5, census: 1, certainty: 2, randomReporting: 0, randomNonReporting: 2, frameTotal: 56, imamSites: 7 },
  { state: 'kaduna', lga: 'SANGA', koboCode: 'sanga', totalSelected: 4, census: 1, certainty: 0, randomReporting: 1, randomNonReporting: 2, frameTotal: 78, imamSites: 7 },
  { state: 'kaduna', lga: 'SOBA', koboCode: 'soba', totalSelected: 13, census: 1, certainty: 6, randomReporting: 2, randomNonReporting: 4, frameTotal: 76, imamSites: 8 },
  { state: 'kaduna', lga: 'ZANGON KATAF', koboCode: 'zangon_kataf', totalSelected: 9, census: 1, certainty: 5, randomReporting: 2, randomNonReporting: 1, frameTotal: 83, imamSites: 7 },
  { state: 'kaduna', lga: 'ZARIA', koboCode: 'zaria', totalSelected: 8, census: 1, certainty: 5, randomReporting: 1, randomNonReporting: 1, frameTotal: 83, imamSites: 7 },
  { state: 'kano', lga: 'AJINGI', koboCode: 'ajingi', totalSelected: 3, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 2, frameTotal: 33, imamSites: 1 },
  { state: 'kano', lga: 'ALBASU', koboCode: 'albasu', totalSelected: 2, census: 0, certainty: 0, randomReporting: 1, randomNonReporting: 1, frameTotal: 35, imamSites: 1 },
  { state: 'kano', lga: 'BAGWAI', koboCode: 'bagwai', totalSelected: 5, census: 0, certainty: 1, randomReporting: 3, randomNonReporting: 1, frameTotal: 31, imamSites: 1 },
  { state: 'kano', lga: 'BEBEJI', koboCode: 'bebeji', totalSelected: 4, census: 0, certainty: 2, randomReporting: 0, randomNonReporting: 2, frameTotal: 31, imamSites: 1 },
  { state: 'kano', lga: 'BICHI', koboCode: 'bichi', totalSelected: 5, census: 0, certainty: 1, randomReporting: 2, randomNonReporting: 2, frameTotal: 55, imamSites: 5 },
  { state: 'kano', lga: 'BUNKURE', koboCode: 'bunkure', totalSelected: 3, census: 0, certainty: 1, randomReporting: 2, randomNonReporting: 0, frameTotal: 28, imamSites: 1 },
  { state: 'kano', lga: 'DALA', koboCode: 'dala', totalSelected: 3, census: 0, certainty: 2, randomReporting: 0, randomNonReporting: 1, frameTotal: 33, imamSites: 1 },
  { state: 'kano', lga: 'DANBATTA', koboCode: 'dambatta', totalSelected: 9, census: 0, certainty: 8, randomReporting: 0, randomNonReporting: 1, frameTotal: 49, imamSites: 5 },
  { state: 'kano', lga: 'DAWAKIN KUDU', koboCode: 'dawakin_kudu', totalSelected: 4, census: 0, certainty: 2, randomReporting: 1, randomNonReporting: 1, frameTotal: 31, imamSites: 1 },
  { state: 'kano', lga: 'DAWAKIN TOFA', koboCode: 'dawakin_tofa', totalSelected: 3, census: 0, certainty: 2, randomReporting: 1, randomNonReporting: 0, frameTotal: 51, imamSites: 5 },
  { state: 'kano', lga: 'DOGUWA', koboCode: 'doguwa', totalSelected: 4, census: 0, certainty: 3, randomReporting: 1, randomNonReporting: 0, frameTotal: 31, imamSites: 5 },
  { state: 'kano', lga: 'FAGGE', koboCode: 'fagge', totalSelected: 6, census: 0, certainty: 4, randomReporting: 0, randomNonReporting: 2, frameTotal: 61, imamSites: 1 },
  { state: 'kano', lga: 'GABASAWA', koboCode: 'gabasawa', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 32, imamSites: 1 },
  { state: 'kano', lga: 'GARKO', koboCode: 'garko', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 23, imamSites: 1 },
  { state: 'kano', lga: 'GARUM MALLAM', koboCode: 'garun_mallam', totalSelected: 5, census: 0, certainty: 1, randomReporting: 2, randomNonReporting: 2, frameTotal: 29, imamSites: 1 },
  { state: 'kano', lga: 'GAYA', koboCode: 'gaya', totalSelected: 3, census: 0, certainty: 2, randomReporting: 0, randomNonReporting: 1, frameTotal: 32, imamSites: 1 },
  { state: 'kano', lga: 'GEZAWA', koboCode: 'gezawa', totalSelected: 4, census: 0, certainty: 1, randomReporting: 3, randomNonReporting: 0, frameTotal: 34, imamSites: 1 },
  { state: 'kano', lga: 'GWALE', koboCode: 'gwale', totalSelected: 1, census: 0, certainty: 0, randomReporting: 0, randomNonReporting: 1, frameTotal: 55, imamSites: 1 },
  { state: 'kano', lga: 'GWARZO', koboCode: 'gwarzo', totalSelected: 5, census: 0, certainty: 5, randomReporting: 0, randomNonReporting: 0, frameTotal: 30, imamSites: 5 },
  { state: 'kano', lga: 'KABO', koboCode: 'kabo', totalSelected: 3, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 2, frameTotal: 38, imamSites: 1 },
  { state: 'kano', lga: 'KANO MUNICIPAL', koboCode: 'kano_municipal', totalSelected: 5, census: 1, certainty: 3, randomReporting: 0, randomNonReporting: 1, frameTotal: 40, imamSites: 6 },
  { state: 'kano', lga: 'KARAYE', koboCode: 'karaye', totalSelected: 1, census: 0, certainty: 0, randomReporting: 1, randomNonReporting: 0, frameTotal: 24, imamSites: 1 },
  { state: 'kano', lga: 'KIBIYA', koboCode: 'kibiya', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 23, imamSites: 1 },
  { state: 'kano', lga: 'KIRU', koboCode: 'kiru', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 38, imamSites: 1 },
  { state: 'kano', lga: 'KUMBOTSO', koboCode: 'kumbotso', totalSelected: 6, census: 0, certainty: 3, randomReporting: 0, randomNonReporting: 3, frameTotal: 57, imamSites: 1 },
  { state: 'kano', lga: 'KUNCHI', koboCode: 'kunchi', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 33, imamSites: 1 },
  { state: 'kano', lga: 'KURA', koboCode: 'kura', totalSelected: 2, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 1, frameTotal: 31, imamSites: 1 },
  { state: 'kano', lga: 'MADOBI', koboCode: 'madobi', totalSelected: 2, census: 0, certainty: 2, randomReporting: 0, randomNonReporting: 0, frameTotal: 24, imamSites: 6 },
  { state: 'kano', lga: 'MAKODA', koboCode: 'makoda', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 32, imamSites: 1 },
  { state: 'kano', lga: 'MINJIBIR', koboCode: 'minjibir', totalSelected: 4, census: 0, certainty: 3, randomReporting: 0, randomNonReporting: 1, frameTotal: 29, imamSites: 1 },
  { state: 'kano', lga: 'NASARAWA', koboCode: 'nasarawa', totalSelected: 7, census: 0, certainty: 4, randomReporting: 2, randomNonReporting: 1, frameTotal: 83, imamSites: 5 },
  { state: 'kano', lga: 'RANO', koboCode: 'rano', totalSelected: 2, census: 0, certainty: 2, randomReporting: 0, randomNonReporting: 0, frameTotal: 21, imamSites: 1 },
  { state: 'kano', lga: 'RIMIN GADO', koboCode: 'rimin_gado', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 23, imamSites: 1 },
  { state: 'kano', lga: 'ROGO', koboCode: 'rogo', totalSelected: 1, census: 0, certainty: 0, randomReporting: 1, randomNonReporting: 0, frameTotal: 27, imamSites: 1 },
  { state: 'kano', lga: 'SHANONO', koboCode: 'shanono', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 24, imamSites: 1 },
  { state: 'kano', lga: 'SUMAILA', koboCode: 'sumaila', totalSelected: 5, census: 0, certainty: 3, randomReporting: 0, randomNonReporting: 2, frameTotal: 49, imamSites: 5 },
  { state: 'kano', lga: 'TAKAI', koboCode: 'takai', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 42, imamSites: 5 },
  { state: 'kano', lga: 'TARAUNI', koboCode: 'tarauni', totalSelected: 4, census: 1, certainty: 3, randomReporting: 0, randomNonReporting: 0, frameTotal: 63, imamSites: 2 },
  { state: 'kano', lga: 'TOFA', koboCode: 'tofa', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 24, imamSites: 1 },
  { state: 'kano', lga: 'TSANYAWA', koboCode: 'tsanyawa', totalSelected: 4, census: 0, certainty: 2, randomReporting: 0, randomNonReporting: 2, frameTotal: 33, imamSites: 5 },
  { state: 'kano', lga: 'TUDUN WADA', koboCode: 'tudun_wada', totalSelected: 1, census: 0, certainty: 1, randomReporting: 0, randomNonReporting: 0, frameTotal: 36, imamSites: 1 },
  { state: 'kano', lga: 'UNGOGO', koboCode: 'ungogo', totalSelected: 12, census: 0, certainty: 8, randomReporting: 4, randomNonReporting: 0, frameTotal: 48, imamSites: 5 },
  { state: 'kano', lga: 'WARAWA', koboCode: 'warawa', totalSelected: 1, census: 0, certainty: 0, randomReporting: 1, randomNonReporting: 0, frameTotal: 23, imamSites: 1 },
  { state: 'kano', lga: 'WUDIL', koboCode: 'wudil', totalSelected: 3, census: 0, certainty: 3, randomReporting: 0, randomNonReporting: 0, frameTotal: 29, imamSites: 5 },
]

export const SAMPLING_WEIGHTS: SamplingWeight[] = [
  { state: 'kaduna', stratum: 'Census (Stabilization)', method: 'Census', frameN: 23, sampleN: 23, fraction: 1, designWeight: 1 },
  { state: 'kaduna', stratum: 'Certainty (RUTF Gap + Volume)', method: 'Purposive', frameN: 90, sampleN: 90, fraction: 1, designWeight: 1 },
  { state: 'kaduna', stratum: 'Random Reporting', method: 'Simple random', frameN: 152, sampleN: 25, fraction: 0.164474, designWeight: 6.08 },
  { state: 'kaduna', stratum: 'Random Non-Reporting', method: 'Simple random', frameN: 1465, sampleN: 30, fraction: 0.020478, designWeight: 48.8333 },
  { state: 'kano', stratum: 'Census (Stabilization)', method: 'Census', frameN: 2, sampleN: 2, fraction: 1, designWeight: 1 },
  { state: 'kano', stratum: 'Certainty (High Volume)', method: 'Purposive', frameN: 85, sampleN: 85, fraction: 1, designWeight: 1 },
  { state: 'kano', stratum: 'Random Reporting', method: 'Simple random', frameN: 192, sampleN: 25, fraction: 0.130208, designWeight: 7.68 },
  { state: 'kano', stratum: 'Random Non-Reporting', method: 'Simple random', frameN: 1319, sampleN: 30, fraction: 0.022745, designWeight: 43.9667 },
]

const allocationByKobo = new Map(LGA_ALLOCATIONS.map(a => [a.koboCode, a]))

export function getLgaAllocation(koboCode: string): LgaAllocation | undefined {
  return allocationByKobo.get(koboCode)
}

export function getLgaTarget(koboCode: string): number {
  return allocationByKobo.get(koboCode)?.totalSelected ?? 0
}
