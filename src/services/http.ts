import { getRuntimeConfig } from '../config/runtime'

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

export const apiFetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { apiUrl } = getRuntimeConfig()
  if (!apiUrl) {
    throw new ApiError('server_unavailable', 'Servidor no configurado')
  }

  const url = `${apiUrl}${path.startsWith('/') ? path : `/${path}`}`
  let response: Response

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
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
    const message =
      code === 'invalid'
        ? 'Usuario o contraseña incorrectos.'
        : code === 'expired'
          ? 'Sesión expirada.'
          : code === 'server_unavailable'
            ? 'Servidor no disponible.'
            : 'Error de conexión.'

    throw new ApiError(code, message, status)
  }

  return payload as T
}

