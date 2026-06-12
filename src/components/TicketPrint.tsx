import React from 'react'
import { usePOSStore } from '../store/posStore'

export const TicketPrint: React.FC = () => {
  const printableTicket = usePOSStore(s => s.printableTicket)

  if (!printableTicket) {
    return <div className="print-only" />
  }

  // Validaciones de datos
  const hasRequiredFields =
    printableTicket.id !== undefined &&
    printableTicket.uuid !== undefined &&
    printableTicket.bets !== undefined &&
    Array.isArray(printableTicket.bets) &&
    printableTicket.total !== undefined &&
    printableTicket.userName !== undefined &&
    printableTicket.raceNumber !== undefined

  if (!hasRequiredFields) {
    console.error('[TICKET PRINT ERROR] Datos incompletos para impresión:', {
      ticketNumber: printableTicket.id,
      ticketId: printableTicket.uuid,
      bets: printableTicket.bets,
      total: printableTicket.total,
      userName: printableTicket.userName,
      raceNumber: printableTicket.raceNumber,
    })
    return (
      <div
        className="print-only"
        style={{
          padding: '12px',
          color: '#ef4444',
          background: '#fff',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '11px',
          border: '1px dashed #ef4444',
          textAlign: 'center',
          fontWeight: 'bold'
        }}
      >
        [Error: Información de impresión incompleta]
      </div>
    )
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
                <span>RD${Number(bet.amount ?? 0).toFixed(2)}</span>
              </div>
              {bet.odds !== undefined && bet.potentialPrize !== undefined && (
                <div style={{ fontSize: '10px', color: '#555', marginTop: '1px', paddingLeft: '8px' }}>
                  Cuota: {Number(bet.odds ?? 0).toFixed(2)} | P. Potencial: RD${Number(bet.potentialPrize ?? 0).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ margin: '10px 0', borderTop: '1px dashed #000' }} />

        <div style={{ textAlign: 'center', fontWeight: 700 }}>
          <div>TOTAL</div>
          <div style={{ marginTop: '4px' }}>RD${Number(printableTicket.total ?? 0).toFixed(2)}</div>
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
