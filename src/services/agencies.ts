import { apiFetchJson } from './http'

export type Agency = {
  id: string
  name: string
}

export const getAgencies = async (): Promise<Agency[]> => {
  const response = await apiFetchJson<{ agencies: Agency[] }>('/agencies', { method: 'GET' })
  return response.agencies
}
