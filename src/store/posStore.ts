import { create } from 'zustand'

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
  date: string
  time: string
  bets: Array<Pick<BetEntry, 'type' | 'selection' | 'amount'>>
  total: number
}

export interface POSState {
  // Race info
  raceNumber: number
  raceStatus: 'OPEN' | 'RUNNING' | 'CLOSED'
  startTime: string
  activeTime: string
  timeRemaining: number
  totalTime: number

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
  printTicket: () => void
  tickTime: () => void

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
  activeTime: formatTime(new Date()),
  timeRemaining: 162,
  totalTime: 300,

  activeTab: 'JUGADA',

  selectedDogs: [null, null, null],
  pendingAmount: 0,
  bets: [],
  nextBetId: 1,
  recentTickets: INITIAL_RECENT,
  printableTicket: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

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
    const id = generateId()
    set(state => ({ bets: [...state.bets, { ...bet, id }] }))
  },

  addBets: (bets) => {
    const newBets: BetEntry[] = bets.map(b => ({ ...b, id: generateId() }))
    set(state => ({ bets: [...state.bets, ...newBets] }))
  },

  addCurrentBet: () => {
    const state = get()
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

  printTicket: () => {
    const state = get()
    if (state.bets.length === 0) return

    const printableTicket = buildPrintableTicket(state.bets, state.recentTickets)
    const finalizePrint = () => {
      set(state => ({
        bets: [],
        selectedDogs: [...emptySelection],
        pendingAmount: 0,
        recentTickets: [toRecentTicket(printableTicket), ...state.recentTickets.slice(0, 4)],
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
      if (newTime === 0) newStatus = 'CLOSED'
      else if (newTime < 60) newStatus = 'RUNNING'
      else newStatus = 'OPEN'
      return {
        timeRemaining: newTime,
        activeTime: formatTime(new Date()),
        raceStatus: newStatus,
      }
    })
  },

  // PA' TRÁ Y PA' LANTE - requires exactly 2 dogs in row 0 and row 1
  applyPaTraPaLante: () => {
    const state = get()
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
