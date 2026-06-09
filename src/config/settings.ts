export type MBRacesSettings = {
  apiUrl: string
  wsUrl: string
  websocketUrl: string
  environment: string
  defaultAgency: string
  printerName: string
  printerType: '58mm' | '80mm'
  autoPrint: boolean
  copies: number
  devMode: boolean
  touchMode: boolean
  virtualKeyboard: boolean
  sessionTimeout: number
}

const STORAGE_KEY = 'mbraces_settings'

export const loadSettings = (): Partial<MBRacesSettings> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<MBRacesSettings>
    return parsed ?? {}
  } catch {
    return {}
  }
}

export const saveSettings = (settings: MBRacesSettings) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
