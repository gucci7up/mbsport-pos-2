import React, { useEffect, useState } from 'react'
import { usePOSStore } from '../store/posStore'

export const ActionButtons: React.FC = () => {
  const clearTicket = usePOSStore(s => s.clearTicket)
  const printTicket = usePOSStore(s => s.printTicket)
  const bets = usePOSStore(s => s.bets)
  const selectedDogs = usePOSStore(s => s.selectedDogs)
  const pendingAmount = usePOSStore(s => s.pendingAmount)
  const addCurrentBet = usePOSStore(s => s.addCurrentBet)

  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), flash.type === 'success' ? 500 : 1400)
    return () => clearTimeout(t)
  }, [flash])

  const raceStatus = usePOSStore(s => s.raceStatus)
  const hasAnySelection = selectedDogs.some(dog => dog !== null)
  const canAdd = hasAnySelection && pendingAmount > 0 && raceStatus === 'OPEN'

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        id="btn-agregar"
        className="special-btn add-btn rounded-lg col-span-2 flex items-center justify-center gap-3"
        style={{ height: 'clamp(64px, 8vh, 78px)' }}
        onClick={() => {
          const result = addCurrentBet()
          if (result.ok) {
            setFlash({ type: 'success', text: '✓ APUESTA AGREGADA' })
          } else if (result.error) {
            setFlash({ type: 'error', text: result.error })
          }
        }}
        disabled={!canAdd}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '2.05rem',
            lineHeight: 1,
          }}
        >
          ＋
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '1.42rem',
            letterSpacing: '0.18em',
            lineHeight: 1,
          }}
        >
          AGREGAR
        </span>
      </button>

      <div
        className="col-span-2 flex items-center justify-center"
        style={{
          height: '22px',
          opacity: flash ? 1 : 0,
          transition: 'opacity 150ms ease',
          color: flash?.type === 'error' ? '#ef4444' : '#22c55e',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          letterSpacing: '0.12em',
          fontSize: '0.95rem',
          textShadow: flash?.type === 'error'
            ? '0 0 10px rgba(239,68,68,0.35)'
            : '0 0 10px rgba(34,197,94,0.35)',
        }}
      >
        {flash?.text ?? ''}
      </div>

      {/* BORRAR TICKET */}
      <button
        id="btn-borrar-ticket"
        className="btn-borrar rounded-lg flex flex-col items-center justify-center gap-2"
        style={{ height: 'clamp(122px, 16vh, 148px)' }}
        onClick={clearTicket}
      >
        {/* Trash icon */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: '1.35rem',
            letterSpacing: '0.1em',
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          BORRAR<br />TICKET
        </span>
      </button>

      {/* IMPRIMIR TICKET */}
      <button
        id="btn-imprimir-ticket"
        className="btn-imprimir rounded-lg flex flex-col items-center justify-center gap-2"
        style={{ height: 'clamp(122px, 16vh, 148px)' }}
        onClick={printTicket}
        disabled={bets.length === 0 || raceStatus !== 'OPEN'}
      >
        {/* Printer icon */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: '1.35rem',
            letterSpacing: '0.1em',
            lineHeight: 1,
            textAlign: 'center',
            color: '#000',
          }}
        >
          IMPRIMIR<br />TICKET
        </span>
      </button>
    </div>
  )
}
