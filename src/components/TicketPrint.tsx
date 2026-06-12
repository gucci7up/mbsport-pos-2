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
                marginBottom: '8px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>
                  {bet.type} {bet.selection}
                </span>
                <span>RD${bet.amount.toFixed(2)}</span>
              </div>
              {bet.odds !== undefined && bet.potentialPrize !== undefined && (
                <div style={{ fontSize: '10px', color: '#555', marginTop: '1px', paddingLeft: '8px' }}>
                  Cuota: {bet.odds.toFixed(2)} | P. Potencial: RD${bet.potentialPrize.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ margin: '10px 0', borderTop: '1px dashed #000' }} />

        <div style={{ textAlign: 'center', fontWeight: 700 }}>
          <div>TOTAL</div>
          <div style={{ marginTop: '4px' }}>RD${printableTicket.total.toFixed(2)}</div>
        </div>

        <div style={{ margin: '10px 0', borderTop: '1px dashed #000' }} />

        <div style={{ textAlign: 'center', fontSize: '10px', lineHeight: 1.4 }}>
          {printableTicket.agencyName && <div>AGENCIA: {printableTicket.agencyName}</div>}
          {printableTicket.userName && <div>CAJERO: {printableTicket.userName}</div>}
          {printableTicket.raceNumber && <div>CARRERA: #{printableTicket.raceNumber}</div>}
          {printableTicket.publicToken && (
            <div style={{ marginTop: '4px', fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em' }}>
              TOKEN: {printableTicket.publicToken}
            </div>
          )}
          <div style={{ marginTop: '6px' }}>Gracias por preferir MBRACES</div>
        </div>
      </div>
    </div>
  )
}
