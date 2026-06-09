import React from 'react'
import { usePOSStore } from '../store/posStore'

export const TicketPrint: React.FC = () => {
  const printableTicket = usePOSStore(s => s.printableTicket)

  if (!printableTicket) {
    return <div className="print-only" />
  }

  return (
    <div className="print-only">
      <div
        style={{
          width: '80mm',
          minHeight: 'auto',
          margin: '0 auto',
          padding: '4mm 4mm 6mm',
          color: '#000',
          background: '#fff',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '12px',
          lineHeight: 1.35,
        }}
      >
        <div style={{ textAlign: 'center', fontWeight: 700 }}>
          <div>MBRACES RACING DOGS</div>
          <div style={{ marginTop: '4px' }}>Ticket #{printableTicket.id}</div>
          <div style={{ marginTop: '4px' }}>Fecha: {printableTicket.date}</div>
          <div>Hora: {printableTicket.time}</div>
        </div>

        <div style={{ margin: '10px 0', borderTop: '1px dashed #000' }} />

        <div>
          {printableTicket.bets.map((bet, index) => (
            <div
              key={`${bet.selection}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <div style={{ flex: 1 }}>
                {bet.type} {bet.selection}
              </div>
              <div style={{ flexShrink: 0 }}>RD${bet.amount}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: '10px 0', borderTop: '1px dashed #000' }} />

        <div style={{ textAlign: 'center', fontWeight: 700 }}>
          <div>TOTAL</div>
          <div style={{ marginTop: '4px' }}>RD${printableTicket.total}</div>
        </div>

        <div style={{ margin: '10px 0', borderTop: '1px dashed #000' }} />

        <div style={{ textAlign: 'center' }}>Gracias por preferir MBRACES</div>
      </div>
    </div>
  )
}
