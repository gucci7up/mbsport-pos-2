import React, { useState } from 'react'
import { usePOSStore } from '../store/posStore'

export const TicketPrint: React.FC = () => {
  const printableTicket = usePOSStore(s => s.printableTicket)
  const [logoFailed, setLogoFailed] = useState(false)

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

  const tokenToShow = printableTicket.publicToken || printableTicket.uuid

  return (
    <div className="print-only">
      <div
        style={{
          width: '80mm',
          maxWidth: '100%',
          minHeight: 'auto',
          margin: '0 auto',
          padding: '6mm 4mm',
          color: '#000',
          background: '#fff',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '13px',
          lineHeight: 1.4,
          boxSizing: 'border-box',
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          {!logoFailed ? (
            <img
              src="/mbsport-logo.png"
              alt="MBSPORT RACING DOGS"
              style={{
                maxWidth: '220px',
                width: '100%',
                height: 'auto',
                display: 'block',
                margin: '0 auto 8px auto',
              }}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.05em', margin: '0 auto 8px auto' }}>
              MBSPORT RACING DOGS
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

        {/* HEADER INFO */}
        <div style={{ textAlign: 'center', lineHeight: 1.5 }}>
          <div style={{ fontSize: '20px', fontWeight: 700, margin: '6px 0' }}>
            Ticket #{printableTicket.id}
          </div>
          <div style={{ fontSize: '13px' }}>Fecha: {printableTicket.date}</div>
          <div style={{ fontSize: '13px' }}>Hora: {printableTicket.time}</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Carrera: #{printableTicket.raceNumber}</div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

        {/* BETS */}
        <div style={{ margin: '8px 0' }}>
          {printableTicket.bets.map((bet, index) => (
            <div
              key={`${bet.selection}-${index}`}
              style={{
                marginBottom: '12px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>{bet.type}</span>
                <span>RD${Number(bet.amount ?? 0).toFixed(2)}</span>
              </div>
              <div style={{ marginTop: '2px' }}>
                Selección: {bet.selection}
              </div>
              {bet.odds !== undefined && bet.potentialPrize !== undefined && (
                <div style={{ fontSize: '11px', color: '#333', marginTop: '2px' }}>
                  Cuota: {Number(bet.odds ?? 0).toFixed(2)}  |  Premio Potencial: RD${Number(bet.potentialPrize ?? 0).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

        {/* TOTAL */}
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL</div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
            RD${Number(printableTicket.total ?? 0).toFixed(2)}
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

        {/* METADATA */}
        <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: 1.5, margin: '8px 0' }}>
          {printableTicket.agencyName && <div>AGENCIA: {printableTicket.agencyName}</div>}
          {printableTicket.userName && <div>CAJERO: {printableTicket.userName}</div>}
          {printableTicket.raceNumber && <div>CARRERA: #{printableTicket.raceNumber}</div>}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

        {/* TOKEN */}
        {tokenToShow && (
          <>
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, margin: '8px 0', wordBreak: 'break-all' }}>
              TOKEN: {tokenToShow}
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
          </>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '8px' }}>
          <div>Gracias por preferir MBSPORT</div>
          <div style={{ fontSize: '14px', marginTop: '6px', letterSpacing: '2px' }}>★★★★★</div>
        </div>
      </div>
    </div>
  )
}
