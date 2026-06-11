import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import BrandLogo from '../components/BrandLogo'
import { getRuntimeConfig } from '../config/runtime'
import { authLogin } from '../services/auth'
import { getHealth } from '../services/health'
import { ApiError } from '../services/http'

const delay = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))
const POS_VERSION = '2.51.04'
// const LOGIN_AGENCIES = ['AG. CENTRAL', 'VILLA JUANA', 'SANTIAGO CENTRO', 'SAN CRISTOBAL']
const LOGIN_AGENCIES: string[] = [] // Deshabilitado para la integración real

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const runtime = getRuntimeConfig()
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)
  const agencyDropdownRef = useRef<HTMLDivElement | null>(null)
  const [agency, setAgency] = useState('AG. CENTRAL')
  const [agencyMenuOpen, setAgencyMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null)
  const [alert, setAlert] = useState<{ tone: 'error' | 'warning'; message: string } | null>(null)

  const healthQuery = useQuery({
    queryKey: ['health', runtime.apiUrl],
    queryFn: getHealth,
    enabled: Boolean(runtime.apiUrl),
    retry: 0,
    refetchInterval: 30000,
  })

  const loginMutation = useMutation({
    mutationFn: authLogin,
  })

  const isSubmitting = overlayVisible || loginMutation.isPending

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!agencyDropdownRef.current?.contains(event.target as Node)) {
        setAgencyMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const requestTouchKeyboard = () => {
    window.dispatchEvent(new CustomEvent('mbraces:showKeyboard'))
  }

  const handleAgencySelect = (selectedAgency: string) => {
    setAgency(selectedAgency)
    setAgencyMenuOpen(false)
    emailInputRef.current?.focus()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAlert(null)
    setOverlayVisible(true)
    setOverlayMessage('Validando credenciales...')

    try {
      await delay(500)
      setOverlayMessage('Conectando con servidor...')
      await delay(600)
      setOverlayMessage('Cargando terminal...')

      await loginMutation.mutateAsync({
        email,
        password,
        rememberMe,
      })

      console.log('Login correcto')
      setOverlayMessage('Acceso autorizado...')
      await delay(450)
      console.log('Redirigiendo a POS')
      try {
        navigate('/pos', { replace: true })
      } catch {
        throw new Error('navigation_error')
      }
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      let message = 'Error desconocido.'
      let tone: 'warning' | 'error' = 'error'

      if (apiError) {
        if (apiError.status === 401) {
          message = 'Credenciales inválidas'
          tone = 'warning'
        } else if (apiError.status && apiError.status >= 500) {
          message = 'Error servidor'
        } else if (apiError.code === 'connection') {
          message = 'Sin conexión'
        } else {
          message = apiError.message
        }
      } else if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('connection')) {
          message = 'Sin conexión'
        } else {
          message = error.message
        }
      }

      setAlert({ tone, message })
    } finally {
      setOverlayVisible(false)
      setOverlayMessage(null)
    }
  }

  const systemState = healthQuery.isError
    ? 'offline'
    : healthQuery.data?.server === 'online'
      ? 'online'
      : 'waiting'

  const systemLabel =
    systemState === 'online'
      ? 'Sistema Online'
      : systemState === 'offline'
        ? 'Sistema Offline'
        : 'Verificando servidor...'

  const systemColor =
    systemState === 'online'
      ? '#22c55e'
      : systemState === 'offline'
        ? '#ef4444'
        : '#f5c518'

  const systemGlow =
    systemState === 'online'
      ? '0 0 10px rgba(34,197,94,0.35)'
      : systemState === 'offline'
        ? '0 0 10px rgba(239,68,68,0.35)'
        : '0 0 10px rgba(245,197,24,0.25)'

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/greyhound_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          filter: 'blur(6px)',
          transform: 'scale(1.03)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(26,92,42,0.18), transparent 30%), linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.96) 100%)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          opacity: 0.045,
          filter: 'blur(10px)',
          transform: 'scale(1.2)',
        }}
      >
        <svg viewBox="0 0 260 180" width="72%" height="72%" preserveAspectRatio="xMidYMid meet">
          <path
            d="M28 124 C42 96, 64 82, 92 72 C105 68, 120 62, 134 50 C148 38, 162 28, 184 22 C203 16, 228 18, 240 34 C252 50, 246 70, 232 78 C218 86, 202 84, 188 90 C174 96, 162 108, 152 120 C140 134, 124 150, 110 158 L76 158 L76 138 L62 158 L38 158 Z"
            fill="#f5c518"
          />
          <circle cx="222" cy="46" r="10" fill="#f5c518" />
        </svg>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-6 sm:px-6">
        <section
          className="w-full rounded-3xl border p-5 sm:p-6"
          style={{
            maxWidth: '700px',
            background: 'rgba(10,10,10,0.9)',
            borderColor: '#2a2a2a',
            boxShadow: '0 22px 52px rgba(0,0,0,0.48)',
          }}
        >
          <div className="mb-5 flex flex-col items-center text-center">
            <BrandLogo size="xl" align="center" showFlag={false} />
            <span
              style={{
                marginTop: '10px',
                color: '#888',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '0.95rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Terminal Profesional de Apuestas
            </span>
          </div>

          <form className="mx-auto w-full space-y-4" style={{ maxWidth: '520px' }} onSubmit={handleSubmit}>
            <label className="block">
              <span className="login-field-label">Agencia</span>
              <div
                ref={agencyDropdownRef}
                className={`login-dropdown ${agencyMenuOpen ? 'is-open' : ''}`}
                style={{ marginTop: '10px' }}
              >
                <button
                  className="login-dropdown-trigger"
                  type="button"
                  disabled={true}
                  aria-haspopup="listbox"
                  aria-expanded={false}
                >
                  <span className="login-dropdown-value" style={{ opacity: 0.6 }}>🏢 Asignada automáticamente</span>
                  <span className="login-dropdown-chevron" aria-hidden="true" style={{ opacity: 0.4 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {agencyMenuOpen && (
                  <div className="login-dropdown-menu" role="listbox" aria-label="Agencias">
                    {LOGIN_AGENCIES.map(option => {
                      const isSelected = option === agency

                      return (
                        <button
                          key={option}
                          className={`login-dropdown-option ${isSelected ? 'is-selected' : ''}`}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleAgencySelect(option)}
                        >
                          <span>🏢 {option}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </label>

            <label className="block">
              <span className="login-field-label">Email</span>
              <input
                ref={emailInputRef}
                className="login-input"
                value={email}
                onChange={event => setEmail(event.target.value)}
                onFocus={requestTouchKeyboard}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    passwordInputRef.current?.focus()
                  }
                }}
                placeholder="Ingresa tu email"
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="block">
              <span className="login-field-label">Contraseña</span>
              <input
                ref={passwordInputRef}
                className="login-input"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                onFocus={requestTouchKeyboard}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !isSubmitting) {
                    const form = event.currentTarget.form
                    if (form) {
                      event.preventDefault()
                      form.requestSubmit()
                    }
                  }
                }}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={event => setRememberMe(event.target.checked)}
                className="login-checkbox h-4 w-4 accent-yellow-400"
                disabled={isSubmitting}
              />
              <span style={{ color: '#d4d4d4' }}>Mantener sesión iniciada</span>
            </label>

            {alert && (
              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  borderColor: alert.tone === 'warning' ? 'rgba(245,197,24,0.35)' : 'rgba(239,68,68,0.35)',
                  background: alert.tone === 'warning' ? 'rgba(245,197,24,0.08)' : 'rgba(127,29,29,0.16)',
                }}
              >
                <span style={{ color: alert.tone === 'warning' ? '#f5c518' : '#f87171' }}>{alert.message}</span>
              </div>
            )}

            <button className="login-primary-btn w-full" type="submit" disabled={isSubmitting}>
              <span className="login-primary-btn-content">
                <span className={`login-primary-icon ${isSubmitting ? 'login-primary-icon-spin' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <span>INICIAR SESIÓN</span>
              </span>
            </button>

            <div className="grid gap-2 sm:grid-cols-2">
              <button className="login-secondary-btn w-full" type="button" onClick={requestTouchKeyboard} disabled={isSubmitting}>
                MOSTRAR TECLADO
              </button>
              <button className="login-secondary-btn w-full" type="button" onClick={() => navigate('/settings')} disabled={isSubmitting}>
                CONFIGURAR SERVIDOR
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <span style={{ color: systemColor, textShadow: systemGlow }}>●</span>
              <span style={{ color: systemColor, fontFamily: "'Roboto Mono', monospace" }}>{systemLabel}</span>
            </div>
          </form>
        </section>

        <footer className="mt-4 text-center">
          <div style={{ color: '#666', fontSize: '0.76rem', fontFamily: "'Roboto Mono', monospace" }}>
            © MBRACES Racing Dogs
          </div>
          <div style={{ color: '#666', fontSize: '0.76rem', fontFamily: "'Roboto Mono', monospace", marginTop: '2px' }}>
            Versión POS {POS_VERSION}
          </div>
        </footer>
      </div>

      {overlayVisible && (
        <div className="login-overlay" role="alert" aria-live="polite">
          <div className="login-overlay-card">
            <div className="login-spinner" />
            <div style={{ color: '#f5c518', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.14em' }}>
              {overlayMessage ?? 'Procesando...'}
            </div>
            <div style={{ color: '#777', fontFamily: "'Roboto Mono', monospace", fontSize: '0.8rem' }}>
              Acceso a terminal en proceso.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
