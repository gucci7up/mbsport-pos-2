import { getRuntimeConfig } from '../config/runtime'
import { getAuthSession } from './auth'

export type ApiErrorCode = 'invalid' | 'expired' | 'server_unavailable' | 'connection' | 'unknown'

export class ApiError extends Error {
  code: ApiErrorCode
  status?: number

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

type Json = Record<string, unknown> | Array<unknown> | null

let serverTimeOffset = 0

export const getServerTime = (): number => Date.now() + serverTimeOffset

export const apiFetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { apiUrl } = getRuntimeConfig()
  if (!apiUrl) {
    throw new ApiError('server_unavailable', 'Servidor no configurado')
  }

  const url = `${apiUrl}${path.startsWith('/') ? path : `/${path}`}`
  let response: Response

  const session = getAuthSession()
  const authHeaders: Record<string, string> = session?.token
    ? { Authorization: `Bearer ${session.token}` }
    : {}

  const start = Date.now()
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(init?.headers ?? {}),
      },
    })
    const end = Date.now()
    const serverDate = response.headers.get('Date')
    if (serverDate) {
      const serverTime = new Date(serverDate).getTime()
      const rtt = (end - start) / 2
      serverTimeOffset = serverTime + rtt - end
    }
  } catch {
    throw new ApiError('connection', 'Error de conexión')
  }

  let payload: Json = null
  try {
    payload = (await response.json()) as Json
  } catch {
    payload = null
  }

  if (!response.ok) {
    const status = response.status
    const code: ApiErrorCode =
      status === 401 ? 'invalid' : status === 419 || status === 440 ? 'expired' : status >= 500 ? 'server_unavailable' : 'unknown'
    
    let message = ''
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const p = payload as Record<string, any>
      if (typeof p.message === 'string') {
        message = p.message
      } else if (Array.isArray(p.message)) {
        message = p.message.join(', ')
      } else if (typeof p.error === 'string') {
        message = p.error
      }
    }

    if (!message) {
      message =
        code === 'invalid'
          ? 'Usuario o contraseña incorrectos.'
          : code === 'expired'
            ? 'Sesión expirada.'
            : code === 'server_unavailable'
              ? 'Servidor no disponible.'
              : 'Error de conexión.'
    }

    throw new ApiError(code, message, status)
  }

  return payload as T
}

