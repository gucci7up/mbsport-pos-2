import { apiFetchJson } from './http'

export type HealthResponse = {
  api: 'online' | 'offline'
  db: 'online' | 'offline'
  server: 'online' | 'offline'
  ip?: string
}

export const getHealth = async (): Promise<HealthResponse> => {
  return apiFetchJson<HealthResponse>('/health', { method: 'GET' })
}

