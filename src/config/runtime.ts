import { loadSettings } from './settings'

export type RuntimeConfig = {
  apiUrl: string
  wsUrl: string
  environment: string
}

const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, '')

const safeEnv = (value: unknown) => (typeof value === 'string' ? value : '')

export const getRuntimeConfig = (): RuntimeConfig => {
  const stored = loadSettings()

  const apiUrl = normalizeUrl(stored.apiUrl ?? safeEnv(import.meta.env.VITE_API_URL) ?? '')
  const wsUrl = normalizeUrl(stored.websocketUrl ?? stored.wsUrl ?? safeEnv(import.meta.env.VITE_WS_URL) ?? '')
  const environment =
    (stored.environment ?? safeEnv(import.meta.env.VITE_ENVIRONMENT) ?? '').trim() ||
    (import.meta.env.PROD ? 'Produccion' : 'Desarrollo')

  return {
    apiUrl,
    wsUrl,
    environment,
  }
}

export const getServerLabel = (apiUrl: string) => {
  if (!apiUrl) return 'No configurado'
  try {
    return new URL(apiUrl).origin
  } catch {
    return apiUrl
  }
}
