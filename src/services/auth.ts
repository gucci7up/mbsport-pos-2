import { apiFetchJson } from './http'
import { ApiError } from './http'

export type AuthLoginPayload = {
  email: string
  password: string
  rememberMe: boolean
}

export type UserProfile = {
  id: string
  username: string
  email: string
  role: string
  agencyId: string | null
  agency?: string | null
}

export type AuthLoginResponse = {
  token: string // Backward compatibility with http.ts
  accessToken: string
  user: UserProfile
}

export type AuthSession = AuthLoginResponse & {
  rememberMe: boolean
  isDemo: boolean
}

const AUTH_STORAGE_KEY = 'mbraces_auth_session'
const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO === 'true'
const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'admin123'

const parseStoredSession = (rawSession: string | null): AuthSession | null => {
  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    return null
  }
}

export const saveAuthSession = (session: AuthSession) => {
  const serializedSession = JSON.stringify(session)
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY)

  if (session.rememberMe) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, serializedSession)
    return
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, serializedSession)
}

export const getAuthSession = (): AuthSession | null => {
  const localSession = parseStoredSession(window.localStorage.getItem(AUTH_STORAGE_KEY))
  if (localSession) {
    return localSession
  }

  return parseStoredSession(window.sessionStorage.getItem(AUTH_STORAGE_KEY))
}

export const clearAuthSession = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

export const isAuthenticated = () => Boolean(getAuthSession()?.token)

export const authLogin = async (payload: AuthLoginPayload): Promise<AuthLoginResponse> => {
  const normalizedEmail = payload.email.trim()
  const normalizedPassword = payload.password.trim()

  if (DEMO_ENABLED && (normalizedEmail === DEMO_USERNAME || normalizedEmail === 'admin@mbracesrd.lat') && normalizedPassword === DEMO_PASSWORD) {
    const demoResponse: AuthLoginResponse = {
      token: `demo-token-${Date.now()}`,
      accessToken: `demo-token-${Date.now()}`,
      user: {
        id: 'demo-id',
        username: DEMO_USERNAME,
        email: 'admin@mbracesrd.lat',
        role: 'admin',
        agencyId: 'AGENCIA DEMO',
        agency: 'AGENCIA DEMO',
      },
    }

    saveAuthSession({
      ...demoResponse,
      rememberMe: payload.rememberMe,
      isDemo: true,
    })

    return demoResponse
  }

  if (!normalizedEmail || !normalizedPassword) {
    throw new ApiError('invalid', 'Email o contraseña incorrectos.')
  }

  const loginResponse = await apiFetchJson<{ accessToken: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      password: normalizedPassword,
    }),
  })

  const token = loginResponse.accessToken

  const userProfile = await apiFetchJson<UserProfile>('/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const response: AuthLoginResponse = {
    token,
    accessToken: token,
    user: userProfile,
  }

  saveAuthSession({
    ...response,
    rememberMe: payload.rememberMe,
    isDemo: false,
  })

  return response
}
