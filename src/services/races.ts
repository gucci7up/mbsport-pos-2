import { apiFetchJson } from './http'

export interface RaceDetail {
  id: number
  raceNumber: number
  status: 'OPEN' | 'RUNNING' | 'CLOSED' | 'FINISHED'
  openAt: string
  closeAt: string
  runAt: string
  saleEndAt: string
  finishedAt: string
}

export const getCurrentRace = async (): Promise<RaceDetail> => {
  return apiFetchJson<RaceDetail>('/races/current', { method: 'GET' })
}

export const getRaceStatus = async (id: number): Promise<{ status: RaceDetail['status'] }> => {
  return apiFetchJson<{ status: RaceDetail['status'] }>(`/races/status?id=${id}`, { method: 'GET' })
}
