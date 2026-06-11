import { apiFetchJson } from './http'

export interface RaceDetail {
  id: string | number
  raceNumber: number
  status: 'OPEN' | 'RUNNING' | 'CLOSED' | 'FINISHED'
  openAt: string
  closeAt: string
  runAt: string
  saleEndAt: string
  finishedAt: string
}

export interface OddsEntry {
  id: string
  raceId: string
  betType: 'WINNER' | 'EXACTA' | 'TRIFECTA'
  selection: string
  totalAmount: string
  currentOdds: string
  finalOdds: string | null
  createdAt: string
  updatedAt: string
}

export const getCurrentRace = async (): Promise<RaceDetail> => {
  const data = await apiFetchJson<any>('/races/current', { method: 'GET' })
  return {
    id: data.id,
    raceNumber: data.numero ?? data.raceNumber,
    status: data.status,
    openAt: data.openAt,
    closeAt: data.closeAt,
    runAt: data.runAt ?? data.saleEndAt ?? data.closeAt,
    saleEndAt: data.saleEndAt,
    finishedAt: data.finishedAt,
  }
}

export const getRaceStatus = async (id: string | number): Promise<{ status: RaceDetail['status'] }> => {
  return apiFetchJson<{ status: RaceDetail['status'] }>(`/races/status?id=${id}`, { method: 'GET' })
}

export const getRaceOddsLive = async (raceId: string | number): Promise<OddsEntry[]> => {
  return apiFetchJson<OddsEntry[]>(`/odds/race/${raceId}/live`, { method: 'GET' })
}
