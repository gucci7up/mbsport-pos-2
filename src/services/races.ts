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

export interface DogOdds {
  dogNumber: number
  win: number
  exacta: number
  trifecta: number
}

export interface RaceOddsResponse {
  raceId: string | number
  raceNumber: number
  dogs: DogOdds[]
}

export const getCurrentRace = async (): Promise<RaceDetail> => {
  return apiFetchJson<RaceDetail>('/races/current', { method: 'GET' })
}

export const getRaceStatus = async (id: string | number): Promise<{ status: RaceDetail['status'] }> => {
  return apiFetchJson<{ status: RaceDetail['status'] }>(`/races/status?id=${id}`, { method: 'GET' })
}

export const getRaceOddsLive = async (raceId: string | number): Promise<RaceOddsResponse> => {
  return apiFetchJson<RaceOddsResponse>(`/odds/race/${raceId}/live`, { method: 'GET' })
}
