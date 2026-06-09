import React from 'react'
import { usePOSStore } from '../store/posStore'

export const RecentTickets: React.FC = () => {
  const { recentTickets } = usePOSStore()
  const recentTicketColumns = 'clamp(46px, 8vw, 56px) minmax(0, 1fr) clamp(56px, 8vw, 68px) clamp(78px, 10vw, 96px)'

  return (
    <div className="flex flex-col h-full" style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid #2a2a2a' }}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-800">
        <span
          className="text-pos-yellow font-black"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', letterSpacing: '0.05em', color: '#f5c518' }}
        >
          ÚLTIMOS TICKETS
        </span>
      </div>

      {/* Column headers */}
      <div className="grid px-3 py-1 border-b border-gray-800" style={{ gridTemplateColumns: recentTicketColumns, gap: '4px' }}>
        {['#', 'FECHA', 'APUESTAS', 'MONTO'].map((col, i) => (
          <span key={i} style={{ color: '#666', fontSize: '0.7rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
            {col}
          </span>
        ))}
      </div>

      {/* Ticket rows */}
      <div className="flex-1 overflow-y-auto">
        {recentTickets.map((ticket, index) => (
          <div
            key={ticket.id}
            className={`ticket-row recent-ticket-row grid items-center px-3 py-2 ${index === 0 ? 'latest-ticket' : ''}`}
            style={{ gridTemplateColumns: recentTicketColumns, gap: '4px' }}
          >
            <span style={{ color: '#e8e8e8', fontSize: '0.82rem', fontFamily: "'Roboto Mono', monospace", fontWeight: 600 }}>
              {ticket.id}
            </span>
            <span style={{ color: '#aaa', fontSize: '0.78rem', fontFamily: "'Roboto Mono', monospace" }}>
              {ticket.date}
            </span>
            <span style={{ color: '#aaa', fontSize: '0.78rem', fontFamily: "'Roboto Mono', monospace", textAlign: 'center' }}>
              {ticket.bets}
            </span>
            <span style={{ color: '#e8e8e8', fontSize: '0.78rem', fontFamily: "'Roboto Mono', monospace", textAlign: 'right' }}>
              RD$ {ticket.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
