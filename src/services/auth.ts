import { apiFetchJson } from './http'
import { ApiError } from './http'

export type AuthLoginPayload = {
  agency?: string
  username: string
  password: string
  rememberMe: boolean
}

export type UserProfile = {
  id: string | number
  username: string
  role: string
  agency: string
}

export type AuthLoginResponse = {
  token: string
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
  const normalizedUsername = payload.username.trim()
  const normalizedPassword = payload.password.trim()

  if (DEMO_ENABLED && normalizedUsername === DEMO_USERNAME && normalizedPassword === DEMO_PASSWORD) {
    const demoResponse: AuthLoginResponse = {
      token: `demo-token-${Date.now()}`,
      user: {
        id: 'demo-id',
        username: DEMO_USERNAME,
        role: 'admin',
        agency: payload.agency ?? 'AGENCIA DEMO',
      },
    }

    saveAuthSession({
      ...demoResponse,
      rememberMe: payload.rememberMe,
      isDemo: true,
    })

    return demoResponse
  }

  if (!normalizedUsername || !normalizedPassword) {
    throw new ApiError('invalid', 'Usuario o contraseña incorrectos.')
  }

  const loginResponse = await apiFetchJson<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: normalizedUsername,
      password: normalizedPassword,
    }),
  })

  const token = loginResponse.access_token

  const userProfile = await apiFetchJson<UserProfile>('/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const response: AuthLoginResponse = {
    token,
    user: userProfile,
  }

  saveAuthSession({
    ...response,
    rememberMe: payload.rememberMe,
    isDemo: false,
  })

  return response
}
