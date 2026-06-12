import { apiFetchJson } from './http'

export interface CreateTicketDetailDto {
  betType: 'WINNER' | 'EXACTA' | 'TRIFECTA'
  selection: string
  amount: string
  odds: string
}

export interface CreateTicketDto {
  raceId: string
  details: CreateTicketDetailDto[]
}

export interface TicketResponseDetail {
  id: string
  ticketId: string
  betType: 'WINNER' | 'EXACTA' | 'TRIFECTA'
  selection: string
  amount: string
  odds: string
  potentialPrize: string
  createdAt: string
}

export interface TicketResponse {
  id: string
  ticketNumber: number
  raceId: string
  userId: string
  publicToken: string
  totalAmount: string
  prizeAmount: string
  status: 'PENDING' | 'WON' | 'LOST' | 'PAID' | 'CANCELLED'
  winningResult: string | null
  settledAt: string | null
  paidAt: string | null
  paidBy: string | null
  cancelledAt: string | null
  cancelledBy: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
  details: TicketResponseDetail[]
  user: {
    id: string
    username: string
    email: string
    role: string
    agency?: string | null
  }
  race: {
    id: string
    numero: number
    status: string
    openAt: string
    closeAt: string
    saleEndAt: string
  }
}

export const createTicket = async (dto: CreateTicketDto): Promise<TicketResponse> => {
  return apiFetchJson<TicketResponse>('/tickets', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}
