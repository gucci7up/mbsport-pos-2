import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { getRuntimeConfig } from '../config/runtime'
import { loadSettings, saveSettings, type MBRacesSettings } from '../config/settings'

const SYSTEM_VERSION = 'v2.51.04'
const REQUEST_TIMEOUT_MS = 4000

type MessageTone = 'neutral' | 'success' | 'warning' | 'error'
type ApiDiagnosticState = 'checking' | 'online' | 'offline'

const getInitialSettings = (): MBRacesSettings => {
  const runtime = getRuntimeConfig()
  const stored = loadSettings()

  return {
    apiUrl: stored.apiUrl ?? runtime.apiUrl,
    wsUrl: stored.wsUrl ?? runtime.wsUrl,
    websocketUrl: stored.websocketUrl ?? stored.wsUrl ?? runtime.wsUrl,
    environment: stored.environment ?? runtime.environment,
    defaultAgency: stored.defaultAgency ?? 'AG. CENTRAL',
    printerName: stored.printerName ?? '',
    printerType: stored.printerType ?? '80mm',
    autoPrint: stored.autoPrint ?? true,
    copies: stored.copies ?? 1,
    devMode: stored.devMode ?? false,
    touchMode: stored.touchMode ?? true,
    virtualKeyboard: stored.virtualKeyboard ?? true,
    sessionTimeout: stored.sessionTimeout ?? 30,
  }
}

const normalizeSettings = (settings: MBRacesSettings): MBRacesSettings => ({
  ...settings,
  apiUrl: settings.apiUrl.trim(),
  wsUrl: settings.websocketUrl.trim(),
  websocketUrl: settings.websocketUrl.trim(),
  printerName: settings.printerName.trim(),
  copies: Number.isFinite(settings.copies) && settings.copies > 0 ? Math.floor(settings.copies) : 1,
  sessionTimeout: Number.isFinite(settings.sessionTimeout) && settings.sessionTimeout > 0 ? Math.floor(settings.sessionTimeout) : 30,
})

const isValidWebSocketUrl = (value: string) => {
  if (!value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'ws:' || url.protocol === 'wss:'
  } catch {
    return false
  }
}

const pingApi = async (apiUrl: string) => {
  const trimmedUrl = apiUrl.trim()
  if (!trimmedUrl) {
    throw new Error('API URL requerida')
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    await fetch(trimmedUrl, {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeout)
  }
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const initialSettings = useMemo(() => getInitialSettings(), [])

  const [settings, setSettings] = useState<MBRacesSettings>(initialSettings)
  const [message, setMessage] = useState('Configuración lista para administradores.')
  const [messageTone, setMessageTone] = useState<MessageTone>('neutral')
  const [apiDiagnostic, setApiDiagnostic] = useState<ApiDiagnosticState>('checking')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)

  const setField = <K extends keyof MBRacesSettings>(field: K, value: MBRacesSettings[K]) => {
    setSettings(current => {
      const next = { ...current, [field]: value }
      if (field === 'websocketUrl') {
        next.wsUrl = value as string
      }
      return next
    })
  }

  const showMessage = (text: string, tone: MessageTone) => {
    setMessage(text)
    setMessageTone(tone)
  }

  const verifyApiConnection = async (apiUrl: string, source: 'auto' | 'manual') => {
    const trimmedUrl = apiUrl.trim()
    if (!trimmedUrl) {
      setApiDiagnostic('offline')
      if (source === 'manual') {
        showMessage('Debes completar API URL antes de probar la conexión.', 'error')
      }
      return false
    }

    try {
      if (source === 'manual') {
        setIsTestingConnection(true)
      }
      setApiDiagnostic('checking')
      await pingApi(trimmedUrl)
      setApiDiagnostic('online')
      if (source === 'manual') {
        showMessage('✓ Conexión exitosa', 'success')
      }
      return true
    } catch {
      setApiDiagnostic('offline')
      if (source === 'manual') {
        showMessage('✗ Error de conexión', 'error')
      }
      return false
    } finally {
      if (source === 'manual') {
        setIsTestingConnection(false)
      }
    }
  }

  useEffect(() => {
    const controller = window.setTimeout(() => {
      void verifyApiConnection(settings.apiUrl, 'auto')
    }, 450)

    return () => window.clearTimeout(controller)
  }, [settings.apiUrl])

  const handleSave = () => {
    const payload = normalizeSettings(settings)
    saveSettings(payload)
    setSettings(payload)
    showMessage('Configuración guardada correctamente.', 'success')
  }

  const handleRestore = () => {
    setSettings(initialSettings)
    saveSettings(initialSettings)
    showMessage('Valores restaurados correctamente.', 'warning')
  }

  const handlePrintTest = () => {
    setShowPrintModal(true)
  }

  const handlePrintSimulation = () => {
    const printWindow = window.open('', '_blank', 'width=420,height=680')
    if (!printWindow) {
      showMessage('No se pudo abrir la vista de impresión.', 'error')
      return
    }

    const now = new Date().toLocaleString('es-DO')
    const printerName = settings.printerName.trim() || 'No configurada'
    const printerType = settings.printerType === '58mm' ? '58mm' : '80mm'

    printWindow.document.write(`
      <html>
        <head>
          <title>Test de Impresión</title>
          <style>
            body {
              font-family: monospace;
              background: #fff;
              color: #000;
              margin: 0;
              padding: 16px;
            }
            .ticket {
              max-width: 320px;
              margin: 0 auto;
              white-space: pre-line;
              line-height: 1.45;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
==================
MBRACES
RACING DOGS
==================

PRUEBA DE IMPRESIÓN

Fecha:
${now}

Impresora:
${printerName}

Tipo:
${printerType}

TEST OK

==================
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    setShowPrintModal(false)
    showMessage('Simulación de impresión ejecutada.', 'success')
  }

  const websocketDetected = isValidWebSocketUrl(settings.websocketUrl)
  const printerDetected = settings.printerName.trim().length > 0

  const diagnostics = [
    {
      label: 'API',
      status: apiDiagnostic === 'online' ? 'online' : 'offline',
      text: apiDiagnostic === 'online' ? 'Online' : 'Offline',
    },
    {
      label: 'Base de Datos',
      status: 'pending',
      text: 'Pendiente Backend',
    },
    {
      label: 'WebSocket',
      status: websocketDetected ? 'online' : 'offline',
      text: websocketDetected ? 'Online' : 'Offline',
    },
    {
      label: 'Impresora',
      status: printerDetected ? 'online' : 'offline',
      text: printerDetected ? 'Detectada' : 'No detectada',
    },
  ] as const

  const infoTone =
    messageTone === 'success'
      ? { color: '#22c55e', border: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }
      : messageTone === 'warning'
        ? { color: '#f5c518', border: 'rgba(245,197,24,0.3)', background: 'rgba(245,197,24,0.07)' }
        : messageTone === 'error'
          ? { color: '#ef4444', border: 'rgba(239,68,68,0.3)', background: 'rgba(127,29,29,0.16)' }
          : { color: '#888', border: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }

  return (
    <div className="relative min-h-screen bg-black">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/greyhound_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          filter: 'blur(7px)',
          transform: 'scale(1.04)',
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

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header
          className="mb-4 rounded-2xl border px-4 py-4 sm:px-5"
          style={{
            background: 'rgba(7,7,7,0.84)',
            borderColor: '#1f1f1f',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <BrandLogo size="md" />
              <span style={{ color: '#888', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.16em' }}>
                PANEL DE CONFIGURACION ADMINISTRATIVA
              </span>
            </div>
            <button
              className="login-secondary-btn w-full md:w-auto"
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              style={{ minHeight: '44px' }}
            >
              VOLVER AL LOGIN
            </button>
          </div>
        </header>

        <main className="grid gap-4 md:grid-cols-2">
          <section
            className="rounded-3xl border p-4 sm:p-5"
            style={{
              background: 'rgba(10,10,10,0.88)',
              borderColor: '#2a2a2a',
              boxShadow: '0 18px 48px rgba(0,0,0,0.42)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="login-panel-title">SERVIDOR</span>
              <span style={{ color: '#666', fontFamily: "'Roboto Mono', monospace", fontSize: '0.76rem' }}>
                Preparado para backend
              </span>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="login-field-label">API URL</span>
                <input
                  className="login-input"
                  value={settings.apiUrl}
                  onChange={event => setField('apiUrl', event.target.value)}
                  placeholder="https://api.mbracesrd.lat"
                />
              </label>

              <label className="block">
                <span className="login-field-label">WEBSOCKET URL</span>
                <input
                  className="login-input"
                  value={settings.websocketUrl}
                  onChange={event => setField('websocketUrl', event.target.value)}
                  placeholder="wss://socket.mbracesrd.lat"
                />
              </label>

              <div>
                <span className="login-field-label">ENTORNO</span>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                    <input
                      type="radio"
                      name="environment"
                      checked={settings.environment === 'Desarrollo'}
                      onChange={() => setField('environment', 'Desarrollo')}
                      className="h-4 w-4 accent-yellow-400"
                    />
                    <span style={{ color: '#d4d4d4' }}>Desarrollo</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                    <input
                      type="radio"
                      name="environment"
                      checked={settings.environment === 'Produccion'}
                      onChange={() => setField('environment', 'Produccion')}
                      className="h-4 w-4 accent-yellow-400"
                    />
                    <span style={{ color: '#d4d4d4' }}>Producción</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button className="login-primary-btn w-full" type="button" onClick={handleSave}>
                  GUARDAR
                </button>
                <button className="login-secondary-btn w-full" type="button" onClick={() => void verifyApiConnection(settings.apiUrl, 'manual')} disabled={isTestingConnection}>
                  {isTestingConnection ? 'PROBANDO...' : 'PROBAR CONEXION'}
                </button>
              </div>
            </div>
          </section>

          <section
            className="rounded-3xl border p-4 sm:p-5"
            style={{
              background: 'rgba(10,10,10,0.88)',
              borderColor: '#2a2a2a',
              boxShadow: '0 18px 48px rgba(0,0,0,0.42)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="login-panel-title">IMPRESION</span>
              <span style={{ color: '#666', fontFamily: "'Roboto Mono', monospace", fontSize: '0.76rem' }}>
                Simulación local
              </span>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="login-field-label">Nombre impresora</span>
                <input
                  className="login-input"
                  value={settings.printerName}
                  onChange={event => setField('printerName', event.target.value)}
                  placeholder="Nombre de impresora"
                />
              </label>

              <div>
                <span className="login-field-label">Tipo impresora</span>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                    <input
                      type="radio"
                      name="printerType"
                      checked={settings.printerType === '58mm'}
                      onChange={() => setField('printerType', '58mm')}
                      className="h-4 w-4 accent-yellow-400"
                    />
                    <span style={{ color: '#d4d4d4' }}>Térmica 58mm</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                    <input
                      type="radio"
                      name="printerType"
                      checked={settings.printerType === '80mm'}
                      onChange={() => setField('printerType', '80mm')}
                      className="h-4 w-4 accent-yellow-400"
                    />
                    <span style={{ color: '#d4d4d4' }}>Térmica 80mm</span>
                  </label>
                </div>
              </div>

              <label className="block">
                <span className="login-field-label">Copias por ticket</span>
                <input
                  className="login-input"
                  type="number"
                  min={1}
                  value={settings.copies}
                  onChange={event => setField('copies', Number(event.target.value))}
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                <input
                  type="checkbox"
                  checked={settings.autoPrint}
                  onChange={event => setField('autoPrint', event.target.checked)}
                  className="h-4 w-4 accent-yellow-400"
                />
                <span style={{ color: '#d4d4d4' }}>Auto imprimir al generar ticket</span>
              </label>

              <button className="login-secondary-btn w-full" type="button" onClick={handlePrintTest}>
                PROBAR IMPRESORA
              </button>
            </div>
          </section>

          <section
            className="rounded-3xl border p-4 sm:p-5"
            style={{
              background: 'rgba(10,10,10,0.88)',
              borderColor: '#2a2a2a',
              boxShadow: '0 18px 48px rgba(0,0,0,0.42)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="login-panel-title">TERMINAL</span>
              <span style={{ color: '#666', fontFamily: "'Roboto Mono', monospace", fontSize: '0.76rem' }}>
                Perfil local
              </span>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="login-field-label">Agencia por defecto</span>
                <select
                  className="login-select"
                  value={settings.defaultAgency}
                  onChange={event => setField('defaultAgency', event.target.value)}
                >
                  <option value="AG. CENTRAL">AG. CENTRAL</option>
                  <option value="AG. NORTE">AG. NORTE</option>
                  <option value="AG. ESTE">AG. ESTE</option>
                  <option value="AG. SUR">AG. SUR</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                <input
                  type="checkbox"
                  checked={settings.touchMode}
                  onChange={event => setField('touchMode', event.target.checked)}
                  className="h-4 w-4 accent-yellow-400"
                />
                <span style={{ color: '#d4d4d4' }}>Modo pantalla táctil</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#1f1f1f', background: 'rgba(255,255,255,0.02)' }}>
                <input
                  type="checkbox"
                  checked={settings.virtualKeyboard}
                  onChange={event => setField('virtualKeyboard', event.target.checked)}
                  className="h-4 w-4 accent-yellow-400"
                />
                <span style={{ color: '#d4d4d4' }}>Mostrar teclado virtual</span>
              </label>

              <label className="block">
                <span className="login-field-label">Tiempo cierre sesión</span>
                <div className="relative">
                  <input
                    className="login-input"
                    type="number"
                    min={1}
                    value={settings.sessionTimeout}
                    onChange={event => setField('sessionTimeout', Number(event.target.value))}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#666',
                      fontFamily: "'Roboto Mono', monospace",
                      pointerEvents: 'none',
                    }}
                  >
                    minutos
                  </span>
                </div>
              </label>
            </div>
          </section>

          <section
            className="rounded-3xl border p-4 sm:p-5"
            style={{
              background: 'rgba(10,10,10,0.88)',
              borderColor: '#2a2a2a',
              boxShadow: '0 18px 48px rgba(0,0,0,0.42)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="login-panel-title">DIAGNOSTICO</span>
              <span style={{ color: '#666', fontFamily: "'Roboto Mono', monospace", fontSize: '0.76rem' }}>
                Actualización local
              </span>
            </div>

            <div className="space-y-3">
              {diagnostics.map(item => {
                const color =
                  item.status === 'online'
                    ? '#22c55e'
                    : item.status === 'offline'
                      ? '#ef4444'
                      : '#f5c518'

                const icon =
                  item.status === 'online'
                    ? '🟢'
                    : item.status === 'offline'
                      ? '🔴'
                      : '🟡'

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                    style={{ borderColor: '#1d1d1d', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <span style={{ color: '#d9d9d9', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}>
                      {item.label}
                    </span>
                    <span style={{ color, fontFamily: "'Roboto Mono', monospace", textShadow: `0 0 8px ${color}55` }}>
                      {icon} {item.text}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl border px-4 py-4" style={{ borderColor: '#1d1d1d', background: 'rgba(255,255,255,0.02)' }}>
              <span className="login-panel-title">INFORMACION DEL SISTEMA</span>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: '#8a8a8a' }}>Versión POS</span>
                  <span style={{ color: '#f5c518', fontFamily: "'Roboto Mono', monospace" }}>{SYSTEM_VERSION}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: '#8a8a8a' }}>Frontend</span>
                  <span style={{ color: '#fff', fontFamily: "'Roboto Mono', monospace" }}>React + Vite</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: '#8a8a8a' }}>Backend</span>
                  <span style={{ color: '#fff', fontFamily: "'Roboto Mono', monospace" }}>Laravel API</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: '#8a8a8a' }}>Entorno</span>
                  <span style={{ color: '#fff', fontFamily: "'Roboto Mono', monospace" }}>{settings.environment}</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div
          className="mt-4 rounded-2xl border px-4 py-3"
          style={{
            borderColor: infoTone.border,
            background: infoTone.background,
          }}
        >
          <span style={{ color: infoTone.color }}>{message}</span>
        </div>

        <footer
          className="mt-4 rounded-2xl border px-5 py-4"
          style={{
            background: 'rgba(7,7,7,0.84)',
            borderColor: '#1f1f1f',
          }}
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-2 sm:grid-cols-3 lg:w-auto">
              <button className="login-primary-btn w-full" type="button" onClick={handleSave}>
                GUARDAR CONFIGURACION
              </button>
              <button className="login-secondary-btn w-full" type="button" onClick={handleRestore}>
                RESTAURAR VALORES
              </button>
              <button className="login-secondary-btn w-full" type="button" onClick={() => navigate('/login', { replace: true })}>
                VOLVER AL LOGIN
              </button>
            </div>
            <span style={{ color: '#7a7a7a', fontFamily: "'Roboto Mono', monospace", fontSize: '0.8rem' }}>
              Solo administradores
            </span>
          </div>
        </footer>
      </div>

      {showPrintModal && (
        <div className="login-overlay" role="dialog" aria-modal="true" aria-label="Test de impresión">
          <div className="login-overlay-card" style={{ alignItems: 'stretch', textAlign: 'left' }}>
            <div style={{ color: '#f5c518', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.16em' }}>
              TEST DE IMPRESIÓN
            </div>
            <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '12px' }}>
              <div className="flex items-center justify-between gap-4">
                <span style={{ color: '#8a8a8a' }}>Impresora:</span>
                <span style={{ color: '#fff', fontFamily: "'Roboto Mono', monospace" }}>{settings.printerName.trim() || 'No configurada'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span style={{ color: '#8a8a8a' }}>Tipo:</span>
                <span style={{ color: '#fff', fontFamily: "'Roboto Mono', monospace" }}>{settings.printerType === '58mm' ? '58mm' : '80mm'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span style={{ color: '#8a8a8a' }}>Estado:</span>
                <span style={{ color: '#f5c518', fontFamily: "'Roboto Mono', monospace" }}>Simulación</span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="login-primary-btn w-full" type="button" onClick={handlePrintSimulation}>
                IMPRIMIR PRUEBA
              </button>
              <button className="login-secondary-btn w-full" type="button" onClick={() => setShowPrintModal(false)}>
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
