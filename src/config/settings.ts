export type MBSportSettings = {
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

const STORAGE_KEY = 'mbsport_settings'

export const loadSettings = (): Partial<MBSportSettings> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<MBSportSettings>
    return parsed ?? {}
  } catch {
    return {}
  }
}

export const saveSettings = (settings: MBSportSettings) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
