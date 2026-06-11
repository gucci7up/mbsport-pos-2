import React from 'react'
import { getBetDraftFromSelection, usePOSStore } from '../store/posStore'

export const TicketPanel: React.FC = () => {
  const { bets, removeBet, selectedDogs, pendingAmount, winnerOddsMap, exactaOddsMap, trifectaOddsMap } = usePOSStore()
  const total = bets.reduce((sum, b) => sum + b.amount, 0)
  const hasSelection = selectedDogs.some(dog => dog !== null)
  const draft = getBetDraftFromSelection(selectedDogs, pendingAmount)
  const showActual = hasSelection || pendingAmount > 0
  const displayType = draft?.type ?? ''
  const displaySelection = draft?.selection ?? ''
  const displayAmount = draft ? draft.amount.toFixed(0) : pendingAmount > 0 ? pendingAmount.toFixed(0) : ''
  const ticketGridColumns = 'clamp(22px, 2vw, 26px) clamp(68px, 8vw, 86px) minmax(0, 1fr) clamp(86px, 10vw, 110px) clamp(92px, 11vw, 120px) clamp(24px, 2vw, 28px)'

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'rgba(10,10,10,0.95)',
        border: '1px solid rgba(245,197,24,0.18)',
        boxShadow: '0 14px 34px rgba(0,0,0,0.28), 0 0 18px rgba(245,197,24,0.06)',
      }}
    >
      <div className="px-3 pt-2 pb-2 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <span
            className="text-pos-yellow font-black"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.22rem', letterSpacing: '0.1em', color: '#f5c518' }}
          >
            TICKET ACTUAL
          </span>
          <span style={{ color: '#aaa', fontSize: '0.85rem', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {bets.length} Jugadas
          </span>
        </div>

        <div
          className="mt-2 rounded px-3 py-3"
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: showActual ? '1px solid rgba(245,197,24,0.35)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: showActual ? '0 0 18px rgba(245,197,24,0.2)' : 'none',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              style={{
                color: '#f5c518',
                fontSize: '0.78rem',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                letterSpacing: '0.18em',
              }}
            >
              ACTUAL
            </span>
            <span style={{ color: '#666', fontSize: '0.72rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' }}>
              PREVIA
            </span>
          </div>
          <div style={{ marginTop: '6px' }}>
            <div
              style={{
                color: draft ? '#f5c518' : '#555',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: '1.35rem',
                letterSpacing: '0.12em',
                lineHeight: 1,
              }}
            >
              {displayType}
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: '4px', gap: '10px' }}>
              <div
                style={{
                  color: showActual ? '#eaeaea' : '#555',
                  fontFamily: "'Roboto Mono', monospace",
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {displaySelection}
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ color: '#666', fontSize: '0.72rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' }}>
                  RD$
                </div>
                <div style={{ color: displayAmount ? '#f5c518' : '#555', fontFamily: "'Roboto Mono', monospace", fontWeight: 900, fontSize: '1.45rem', lineHeight: 1 }}>
                  {displayAmount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid px-3 py-1 border-b border-gray-800"
        style={{ gridTemplateColumns: ticketGridColumns, gap: '6px' }}
      >
        {['#', 'TIPO', 'SELECCIÓN', 'MONTO', 'EST.', 'X'].map((col, i) => (
          <span key={i} style={{ color: '#666', fontSize: '0.7rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
            {col}
          </span>
        ))}
      </div>

      {/* Bet rows */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {bets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span style={{ color: '#444', fontSize: '0.9rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}>
              SIN JUGADAS
            </span>
          </div>
        ) : (
          bets.map((bet, index) => {
            let multiplier = 0
            if (bet.type === 'QUINIELA') {
              multiplier = parseFloat(winnerOddsMap?.[bet.selection] ?? '0')
              if (multiplier <= 0) {
                const dogNum = parseInt(bet.selection)
                const FALLBACK_ODDS: Record<number, string> = { 1: '2.60', 2: '3.20', 3: '4.10', 4: '6.60', 5: '7.50', 6: '9.90' }
                multiplier = parseFloat(FALLBACK_ODDS[dogNum] ?? '1.00')
              }
            } else if (bet.type === 'EXACTA') {
              multiplier = parseFloat(exactaOddsMap?.[bet.selection] ?? '0')
              if (multiplier <= 0) {
                const parts = bet.selection.split('-').map(x => parseInt(x))
                const winOdds: Record<number, number> = { 1: 2.6, 2: 3.2, 3: 4.1, 4: 6.6, 5: 7.5, 6: 9.9 }
                const a = winOdds[parts[0]] ?? 5
                const b = winOdds[parts[1]] ?? 5
                multiplier = Math.max(2.0, (a + b) * 1.35)
              }
            } else if (bet.type === 'TRIFECTA') {
              multiplier = parseFloat(trifectaOddsMap?.[bet.selection] ?? '0')
              if (multiplier <= 0) {
                const parts = bet.selection.split('-').map(x => parseInt(x))
                const winOdds: Record<number, number> = { 1: 2.6, 2: 3.2, 3: 4.1, 4: 6.6, 5: 7.5, 6: 9.9 }
                const a = winOdds[parts[0]] ?? 5
                const b = winOdds[parts[1]] ?? 5
                const c = winOdds[parts[2]] ?? 5
                multiplier = Math.max(10.0, (a + b + c) * 6.5)
              }
            }
            const est = bet.amount * multiplier

            return (
              <div
                key={bet.id}
                className="ticket-row grid items-center px-3 py-1"
                style={{ gridTemplateColumns: ticketGridColumns, gap: '6px' }}
              >
                <span style={{ color: '#777', fontSize: '0.85rem', fontFamily: "'Roboto Mono', monospace", fontWeight: 800 }}>
                  {index + 1}
                </span>
                <span style={{ color: '#f5c518', fontSize: '0.95rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.08em' }}>
                  {bet.type}
                </span>
                <span style={{ color: '#e8e8e8', fontSize: '1.0rem', fontFamily: "'Roboto Mono', monospace", fontWeight: 900, letterSpacing: '0.06em' }}>
                  {bet.selection}
                </span>
                <span style={{ color: '#e8e8e8', fontSize: '0.95rem', fontFamily: "'Roboto Mono', monospace", fontWeight: 800, textAlign: 'right' }}>
                  RD$ {bet.amount.toFixed(0)}
                </span>
                <span style={{ color: est ? '#e8e8e8' : '#555', fontSize: '0.9rem', fontFamily: "'Roboto Mono', monospace", textAlign: 'right', fontWeight: 700 }}>
                  {est ? `RD$ ${est.toFixed(0)}` : '—'}
                </span>
                <button
                  className="delete-btn"
                  onClick={() => removeBet(bet.id)}
                  id={`delete-bet-${bet.id}`}
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Total */}
      <div
        className="flex items-center justify-between px-3 py-1 border-t border-gray-800"
        style={{ background: 'rgba(0,0,0,0.5)', marginTop: '-4px' }}
      >
        <span
          className="font-black"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', color: '#e8e8e8', letterSpacing: '0.05em' }}
        >
          TOTAL
        </span>
        <span
          className="font-black"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.3rem', color: '#f5c518' }}
        >
          RD$ {total.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
