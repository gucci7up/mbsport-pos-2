import { create } from 'zustand'
import { getServerTime } from '../services/http'
import { RaceDetail, OddsEntry } from '../services/races'
import { createTicket } from '../services/tickets'
import { getAuthSession, isAuthenticated } from '../services/auth'

export type BetType = 'QUINIELA' | 'EXACTA' | 'TRIFECTA'

export interface BetEntry {
  id: string
  type: BetType
  selection: string   // e.g. "4" | "2-4" | "2-4-6"
  amount: number
  estimatedPayout?: number
}

export interface RecentTicket {
  id: number
  date: string
  bets: number
  total: number
  uuid?: string
  publicToken?: string
}

export interface BetDraft {
  type: BetType
  selection: string
  amount: number
}

export interface AddCurrentBetResult {
  ok: boolean
  error?: string
}

export interface PrintableTicket {
  id: number
  uuid?: string
  publicToken?: string
  date: string
  time: string
  bets: Array<Pick<BetEntry, 'type' | 'selection' | 'amount'> & { odds?: number; potentialPrize?: number }>
  total: number
  agencyName?: string
  userName?: string
  raceNumber?: number
}

export interface POSState {
  // Race info
  raceNumber: number
  raceStatus: 'OPEN' | 'RUNNING' | 'CLOSED' | 'FINISHED'
  startTime: string
  activeTime: string
  timeRemaining: number
  totalTime: number
  serverError: string | null
  openAt: string | null
  closeAt: string | null
  runAt: string | null
  finishedAt: string | null
  saleEndAt: string | null
  activeRaceId: string | number | null
  odds: Record<number, { ganar: string; exacta: string; trifecta: string }> | null
  winnerOddsMap: Record<string, string> | null
  exactaOddsMap: Record<string, string> | null
  trifectaOddsMap: Record<string, string> | null
  oddsError: string | null

  // Tab
  activeTab: 'JUGADA' | 'RESULTADOS' | 'CUOTAS' | 'VENTAS' | 'CAJA'

  // Dog selection: row index 0=1°, 1=2°, 2=3°
  selectedDogs: (number | null)[]

  // Current amount accumulator (for the ticket being built)
  pendingAmount: number

  // Ticket
  bets: BetEntry[]
  nextBetId: number

  // Recent tickets
  recentTickets: RecentTicket[]
  printableTicket: PrintableTicket | null

  // Actions
  setActiveTab: (tab: POSState['activeTab']) => void
  selectDog: (row: number, dog: number) => void
  clearSelection: () => void
  setPendingAmount: (amount: number) => void
  addAmountToPending: (amount: number) => void
  addBet: (bet: Omit<BetEntry, 'id'>) => void
  addBets: (bets: Omit<BetEntry, 'id'>[]) => void
  addCurrentBet: () => AddCurrentBetResult
  removeBet: (id: string) => void
  clearTicket: () => void
  printTicket: () => Promise<void>
  tickTime: () => void
  updateRaceFromBackend: (race: RaceDetail) => void
  setServerError: (error: string | null) => void
  updateOddsFromBackend: (entries: OddsEntry[]) => void
  setOddsError: (error: string | null) => void

  // Apply special plays
  applyPaTraPaLante: () => void
  applyReverseForecast: () => void
  applyRulay: () => void
  applyMitad: () => void
}

let betCounter = 1

const generateId = () => `bet-${betCounter++}`

const hasDuplicateDogs = (selectedDogs: (number | null)[]): boolean => {
  const filled = selectedDogs.filter((dog): dog is number => typeof dog === 'number')
  return new Set(filled).size !== filled.length
}

const appendBets = (existingBets: BetEntry[], betsToAdd: Omit<BetEntry, 'id'>[]): BetEntry[] =>
  betsToAdd.map(bet => ({ ...bet, id: generateId() })).reduce(
    (acc, bet) => [...acc, bet],
    existingBets
  )

const emptySelection: (number | null)[] = [null, null, null]

const formatDate = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear().toString()
  return `${d}/${m}/${y}`
}

const buildPrintableTicket = (
  bets: BetEntry[],
  recentTickets: RecentTicket[]
): PrintableTicket => {
  const now = new Date()
  return {
    id: recentTickets[0]?.id + 1 || 1257,
    date: formatDate(now),
    time: formatTime(now),
    bets: bets.map(({ type, selection, amount }) => ({ type, selection, amount })),
    total: bets.reduce((sum, bet) => sum + bet.amount, 0),
  }
}

const toRecentTicket = (ticket: PrintableTicket): RecentTicket => ({
  id: ticket.id,
  date: `${ticket.date} ${ticket.time}`,
  bets: ticket.bets.length,
  total: ticket.total,
})

export const getBetDraftFromSelection = (
  selectedDogs: (number | null)[],
  pendingAmount: number
): BetDraft | null => {
  if (pendingAmount <= 0) return null

  const filled = selectedDogs.filter((dog): dog is number => typeof dog === 'number')

  if (filled.length === 1) {
    return {
      type: 'QUINIELA',
      selection: String(filled[0]),
      amount: pendingAmount,
    }
  }

  if (filled.length === 2) {
    return {
      type: 'EXACTA',
      selection: `${filled[0]}-${filled[1]}`,
      amount: pendingAmount,
    }
  }

  if (filled.length === 3) {
    return {
      type: 'TRIFECTA',
      selection: `${filled[0]}-${filled[1]}-${filled[2]}`,
      amount: pendingAmount,
    }
  }

  return null
}

const formatTime = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

const INITIAL_RECENT: RecentTicket[] = [
  { id: 1256, date: '24/05 11:52:10', bets: 5, total: 175 },
  { id: 1255, date: '24/05 11:47:33', bets: 3, total: 100 },
  { id: 1254, date: '24/05 11:41:22', bets: 6, total: 225 },
  { id: 1253, date: '24/05 11:36:05', bets: 4, total: 150 },
  { id: 1252, date: '24/05 11:29:18', bets: 2, total: 50 },
]

export const usePOSStore = create<POSState>((set, get) => ({
  raceNumber: 397,
  raceStatus: 'OPEN',
  startTime: '12:05:00',
  activeTime: formatTime(new Date(getServerTime())),
  timeRemaining: 162,
  totalTime: 300,
  serverError: null,
  openAt: null,
  closeAt: null,
  runAt: null,
  finishedAt: null,
  saleEndAt: null,
  activeRaceId: null,
  odds: null,
  winnerOddsMap: null,
  exactaOddsMap: null,
  trifectaOddsMap: null,
  oddsError: null,

  activeTab: 'JUGADA',

  selectedDogs: [null, null, null],
  pendingAmount: 0,
  bets: [],
  nextBetId: 1,
  recentTickets: [],
  printableTicket: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setServerError: (error) => set({ serverError: error }),

  updateRaceFromBackend: (race) => {
    const nowTime = getServerTime()
    const endTime = new Date(race.saleEndAt).getTime()
    const openTime = new Date(race.openAt).getTime()
    const runTime = new Date(race.runAt)

    const timeRemaining = (race.status === 'OPEN')
      ? Math.max(0, Math.floor((endTime - nowTime) / 1000))
      : 0

    const totalTime = Math.max(1, Math.floor((endTime - openTime) / 1000))

    const formatHour = (date: Date) => {
      const h = date.getHours().toString().padStart(2, '0')
      const m = date.getMinutes().toString().padStart(2, '0')
      const s = date.getSeconds().toString().padStart(2, '0')
      return `${h}:${m}:${s}`
    }

    set({
      activeRaceId: race.id,
      raceNumber: race.raceNumber,
      raceStatus: race.status,
      startTime: formatHour(runTime),
      timeRemaining,
      totalTime,
      serverError: null,
      openAt: race.openAt,
      closeAt: race.closeAt,
      runAt: race.runAt,
      finishedAt: race.finishedAt,
      saleEndAt: race.saleEndAt,
    })
  },

  updateOddsFromBackend: (entries) => {
    const winnerMap: Record<string, string> = {}
    const exactaMap: Record<string, string> = {}
    const trifectaMap: Record<string, string> = {}

    entries.forEach(entry => {
      const val = parseFloat(entry.currentOdds || '1').toFixed(2)
      if (entry.betType === 'WINNER') {
        winnerMap[entry.selection] = val
      } else if (entry.betType === 'EXACTA') {
        exactaMap[entry.selection] = val
      } else if (entry.betType === 'TRIFECTA') {
        trifectaMap[entry.selection] = val
      }
    })

    const oddsRecord: Record<number, { ganar: string; exacta: string; trifecta: string }> = {}
    const FALLBACK_ODDS: Record<number, { ganar: string; exacta: string; trifecta: string }> = {
      1: { ganar: '2.60', exacta: '8.50', trifecta: '45.00' },
      2: { ganar: '3.20', exacta: '9.80', trifecta: '52.00' },
      3: { ganar: '4.10', exacta: '11.50', trifecta: '61.00' },
      4: { ganar: '6.60', exacta: '15.00', trifecta: '78.00' },
      5: { ganar: '7.50', exacta: '18.00', trifecta: '90.00' },
      6: { ganar: '9.90', exacta: '22.00', trifecta: '120.00' },
    }

    for (let dogNum = 1; dogNum <= 6; dogNum++) {
      const selectionStr = String(dogNum)
      const winOdd = winnerMap[selectionStr] ?? FALLBACK_ODDS[dogNum].ganar

      // Find all exacta selections starting with "dogNum-"
      const exactasForDog = entries.filter(e => e.betType === 'EXACTA' && e.selection.startsWith(`${dogNum}-`))
      const avgExacta = exactasForDog.length > 0
        ? exactasForDog.reduce((sum, e) => sum + parseFloat(e.currentOdds || '0'), 0) / exactasForDog.length
        : parseFloat(FALLBACK_ODDS[dogNum].exacta)

      // Find all trifecta selections starting with "dogNum-"
      const trifectasForDog = entries.filter(e => e.betType === 'TRIFECTA' && e.selection.startsWith(`${dogNum}-`))
      const avgTrifecta = trifectasForDog.length > 0
        ? trifectasForDog.reduce((sum, e) => sum + parseFloat(e.currentOdds || '0'), 0) / trifectasForDog.length
        : parseFloat(FALLBACK_ODDS[dogNum].trifecta)

      oddsRecord[dogNum] = {
        ganar: winOdd,
        exacta: avgExacta.toFixed(2),
        trifecta: avgTrifecta.toFixed(2)
      }
    }

    set({
      odds: oddsRecord,
      winnerOddsMap: winnerMap,
      exactaOddsMap: exactaMap,
      trifectaOddsMap: trifectaMap,
      oddsError: null
    })
  },

  setOddsError: (error) => set({ oddsError: error }),

  selectDog: (row, dog) => {
    const state = get()
    const selected = [...state.selectedDogs]

    // If already selected in this row, deselect
    if (selected[row] === dog) {
      selected[row] = null
    } else {
      selected[row] = dog
    }

    set({ selectedDogs: selected })
  },

  clearSelection: () => set({ selectedDogs: [null, null, null] }),

  setPendingAmount: (amount) => set({ pendingAmount: amount }),

  addAmountToPending: (amount) => {
    set(state => ({ pendingAmount: state.pendingAmount + amount }))
  },

  addBet: (bet) => {
    const state = get()
    if (state.raceStatus !== 'OPEN') return
    const id = generateId()
    set(state => ({ bets: [...state.bets, { ...bet, id }] }))
  },

  addBets: (bets) => {
    const state = get()
    if (state.raceStatus !== 'OPEN') return
    const newBets: BetEntry[] = bets.map(b => ({ ...b, id: generateId() }))
    set(state => ({ bets: [...state.bets, ...newBets] }))
  },

  addCurrentBet: () => {
    const state = get()
    if (state.raceStatus !== 'OPEN') {
      return {
        ok: false,
        error: 'Las apuestas para esta carrera están cerradas.',
      }
    }

    const filled = state.selectedDogs.filter((dog): dog is number => typeof dog === 'number')

    if (filled.length === 0 || state.pendingAmount <= 0) {
      return {
        ok: false,
        error: 'Seleccione una jugada valida.',
      }
    }

    if (new Set(filled).size !== filled.length) {
      return {
        ok: false,
        error: 'Combinacion invalida. No se permiten perros repetidos.',
      }
    }

    const draft: BetDraft | null =
      filled.length === 1 ? {
        type: 'QUINIELA',
        selection: String(filled[0]),
        amount: state.pendingAmount,
      } :
      filled.length === 2 ? {
        type: 'EXACTA',
        selection: `${filled[0]}-${filled[1]}`,
        amount: state.pendingAmount,
      } :
      filled.length === 3 ? {
        type: 'TRIFECTA',
        selection: `${filled[0]}-${filled[1]}-${filled[2]}`,
        amount: state.pendingAmount,
      } :
      null

    if (!draft) {
      return {
        ok: false,
        error: 'Seleccione una jugada valida.',
      }
    }

    set(state => ({
      bets: [...state.bets, { ...draft, id: generateId() }],
      selectedDogs: [...emptySelection],
      pendingAmount: 0,
    }))
    return { ok: true }
  },

  removeBet: (id) => {
    set(state => ({ bets: state.bets.filter(b => b.id !== id) }))
  },

  clearTicket: () => set({ bets: [], selectedDogs: [...emptySelection], pendingAmount: 0 }),

  printTicket: async () => {
    const state = get()

    // 1. Validar usuario autenticado
    const session = getAuthSession()
    if (!isAuthenticated() || !session?.token) {
      throw new Error('Usuario no autenticado.')
    }

    // 2. Validar agencia válida
    const agencyId = session.user.agencyId || session.user.agency
    if (!agencyId) {
      throw new Error('El usuario no tiene una agencia válida asignada.')
    }

    // 3. Validar carrera activa y estado OPEN
    if (state.raceStatus !== 'OPEN') {
      throw new Error('Las apuestas para esta carrera están cerradas.')
    }
    if (!state.activeRaceId) {
      throw new Error('No hay una carrera activa.')
    }

    // 4. Validar apuesta válida (bets no vacío)
    if (state.bets.length === 0) {
      throw new Error('El ticket no contiene apuestas.')
    }

    const payloadDetails = state.bets.map(bet => {
      let betOddsStr = '1.00'
      if (bet.type === 'QUINIELA') {
        betOddsStr = state.winnerOddsMap?.[bet.selection] ?? '1.00'
      } else if (bet.type === 'EXACTA') {
        betOddsStr = state.exactaOddsMap?.[bet.selection] ?? '5.00'
      } else if (bet.type === 'TRIFECTA') {
        betOddsStr = state.trifectaOddsMap?.[bet.selection] ?? '10.00'
      }
      return {
        betType: (bet.type === 'QUINIELA' ? 'WINNER' : bet.type) as 'WINNER' | 'EXACTA' | 'TRIFECTA',
        selection: bet.selection,
        amount: bet.amount.toFixed(2),
        odds: parseFloat(betOddsStr).toFixed(2),
      }
    })

    // 5. Send request to backend
    const response = await createTicket({
      raceId: String(state.activeRaceId),
      details: payloadDetails,
    })

    // 6. Map response to PrintableTicket
    const ticketCreatedAt = new Date(response.createdAt)
    const printableTicket: PrintableTicket = {
      id: response.ticketNumber,
      uuid: response.id,
      publicToken: response.publicToken,
      date: ticketCreatedAt.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: ticketCreatedAt.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      bets: response.details.map(d => ({
        type: d.betType === 'WINNER' ? 'QUINIELA' : d.betType,
        selection: d.selection,
        amount: parseFloat(d.amount),
        odds: parseFloat(d.odds),
        potentialPrize: parseFloat(d.potentialPrize)
      })),
      total: parseFloat(response.totalAmount),
      agencyName: (response.user as any).agency ?? session.user.agency ?? session.user.agencyId ?? 'AGENCIA',
      userName: response.user.username,
      raceNumber: response.race.numero
    }

    // 7. Map to RecentTicket
    const newRecent: RecentTicket = {
      id: response.ticketNumber,
      date: `${printableTicket.date} ${printableTicket.time}`,
      bets: response.details.length,
      total: parseFloat(response.totalAmount),
      uuid: response.id,
      publicToken: response.publicToken
    }

    // 8. Temporarily log details as required in Tarea 8
    console.log('--- LOG TEMPORAL: CREACIÓN DE TICKET ---')
    console.log(`Race ID: ${response.raceId}`)
    console.log(`Race Number: ${response.race?.numero}`)
    console.log('Payload enviado:', JSON.stringify({
      raceId: String(state.activeRaceId),
      details: payloadDetails
    }, null, 2))
    console.log('Respuesta recibida:', JSON.stringify(response, null, 2))
    console.log(`Ticket ID: ${response.id}`)
    console.log(`Ticket Number: ${response.ticketNumber}`)
    console.log('-----------------------------------------')

    // 9. Setup print and state update
    const finalizePrint = () => {
      set(state => ({
        bets: [],
        selectedDogs: [...emptySelection],
        pendingAmount: 0,
        recentTickets: [newRecent, ...state.recentTickets.slice(0, 4)],
        printableTicket: null,
      }))
    }

    if (typeof window === 'undefined') {
      finalizePrint()
      return
    }

    set({ printableTicket })

    let finalized = false
    const finalizeOnce = () => {
      if (finalized) return
      finalized = true
      window.removeEventListener('afterprint', handleAfterPrint)
      finalizePrint()
    }

    const handleAfterPrint = () => {
      finalizeOnce()
    }

    window.addEventListener('afterprint', handleAfterPrint)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print()
      })
    })
  },

  tickTime: () => {
    set(state => {
      const newTime = state.timeRemaining > 0 ? state.timeRemaining - 1 : 0
      let newStatus = state.raceStatus
      if (newTime === 0 && newStatus === 'OPEN') {
        newStatus = 'CLOSED'
      }
      return {
        timeRemaining: newTime,
        activeTime: formatTime(new Date(getServerTime())),
        raceStatus: newStatus,
      }
    })
  },

  // PA' TRÁ Y PA' LANTE - requires exactly 2 dogs in row 0 and row 1
  applyPaTraPaLante: () => {
    const state = get()
    if (state.raceStatus !== 'OPEN') return
    const amount = state.pendingAmount
    if (amount <= 0) return
    const d0 = state.selectedDogs[0]
    const d1 = state.selectedDogs[1]
    if (d0 === null || d1 === null || d0 === d1) return
    const newBets: Omit<BetEntry, 'id'>[] = [
      { type: 'EXACTA', selection: `${d0}-${d1}`, amount },
      { type: 'EXACTA', selection: `${d1}-${d0}`, amount },
    ]
    set(state => ({
      bets: appendBets(state.bets, newBets),
      selectedDogs: [...emptySelection],
      pendingAmount: 0,
    }))
  },

  // REVERSE FORECAST - same as pa tra pa lante but labeled differently
  applyReverseForecast: () => {
    const state = get()
    if (state.raceStatus !== 'OPEN') return
    const amount = state.pendingAmount
    if (amount <= 0) return
    const d0 = state.selectedDogs[0]
    const d1 = state.selectedDogs[1]
    if (d0 === null || d1 === null || d0 === d1) return
    const newBets: Omit<BetEntry, 'id'>[] = [
      { type: 'EXACTA', selection: `${d0}-${d1}`, amount },
      { type: 'EXACTA', selection: `${d1}-${d0}`, amount },
    ]
    set(state => ({
      bets: appendBets(state.bets, newBets),
      selectedDogs: [...emptySelection],
      pendingAmount: 0,
    }))
  },

  // RULAY - one dog selected, generates pairs with all others
  applyRulay: () => {
    const state = get()
    if (state.raceStatus !== 'OPEN') return
    const amount = state.pendingAmount
    if (amount <= 0) return
    const d0 = state.selectedDogs[0]
    if (d0 === null) return
    const others = [1, 2, 3, 4, 5, 6].filter(d => d !== d0)
    const newBets: Omit<BetEntry, 'id'>[] = others.map(d => ({
      type: 'EXACTA',
      selection: `${d0}-${d}`,
      amount,
    }))
    set(state => ({
      bets: appendBets(state.bets, newBets),
      selectedDogs: [...emptySelection],
      pendingAmount: 0,
    }))
  },

  // MITAD - adds inverse of all existing bets
  applyMitad: () => {
    const state = get()
    const inverseBets: Omit<BetEntry, 'id'>[] = state.bets.map(b => {
      const parts = b.selection.split('-').reverse().join('-')
      return { type: b.type, selection: parts, amount: b.amount }
    })
    get().addBets(inverseBets)
  },
}))
