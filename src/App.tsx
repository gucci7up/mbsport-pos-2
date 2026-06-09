import React, { useEffect } from 'react'
import Header from './components/Header'
import { DogSelectionGrid } from './components/DogSelectionGrid'
import { SpecialPlaysPanel } from './components/SpecialPlaysPanel'
import { AmountButtons } from './components/AmountButtons'
import { TicketPanel } from './components/TicketPanel'
import { RecentTickets } from './components/RecentTickets'
import { ActionButtons } from './components/ActionButtons'
import { TicketPrint } from './components/TicketPrint'
import { getBetDraftFromSelection, usePOSStore } from './store/posStore'

const PendingAmountDisplay: React.FC = () => {
  const pendingAmount = usePOSStore(s => s.pendingAmount)
  const selectedDogs = usePOSStore(s => s.selectedDogs)
  const selectedCount = selectedDogs.filter(d => d !== null).length
  const draft = getBetDraftFromSelection(selectedDogs, pendingAmount)

  if (pendingAmount === 0 && selectedCount === 0) return null

  const betType = draft?.type ?? ''
  const selection = draft?.selection ?? selectedDogs.filter((d): d is number => d !== null).join('-')

  return (
    <div
      className="flex items-center gap-3 px-3 py-1 rounded"
      style={{ background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.3)' }}
    >
      {betType && (
        <span style={{ color: '#f5c518', fontSize: '0.8rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
          {betType}
        </span>
      )}
      {selectedCount > 0 && (
        <span style={{ color: '#fff', fontSize: '0.85rem', fontFamily: "'Roboto Mono', monospace" }}>
          {selection}
        </span>
      )}
      {pendingAmount > 0 && (
        <span style={{ color: '#f5c518', fontSize: '0.85rem', fontFamily: "'Roboto Mono', monospace" }}>
          RD$ {pendingAmount}
        </span>
      )}
    </div>
  )
}

const TickerBar: React.FC = () => {
  return (
    <div
      className="flex items-center gap-3 overflow-hidden"
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid #1a1a1a',
        height: '30px',
        padding: '0 16px',
      }}
    >
      {/* Speaker icon */}
      <span style={{ color: '#666', fontSize: '0.8rem', flexShrink: 0 }}>🔊</span>
      <div className="flex-1 overflow-hidden relative">
        <span
          className="ticker-content"
          style={{
            color: '#888',
            fontSize: '0.75rem',
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.1em',
            display: 'inline-block',
          }}
        >
          BIENVENIDO A MBRACES - SISTEMA PROFESIONAL DE APUESTAS &nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp; RECUERDE APOSTAR RESPONSABLEMENTE &nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp; CARRERA 397 EN CURSO &nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp; MBRACES RACING DOGS
        </span>
      </div>
      {/* Date/time */}
      <DateTimeDisplay />
    </div>
  )
}

const DateTimeDisplay: React.FC = () => {
  const [now, setNow] = React.useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const date = now.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = now.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <span style={{ color: '#666', fontSize: '0.75rem', fontFamily: "'Roboto Mono', monospace", flexShrink: 0 }}>
      {date} &nbsp; {time}
    </span>
  )
}

function App() {
  const { tickTime } = usePOSStore()

  // Race countdown timer
  useEffect(() => {
    const t = setInterval(tickTime, 1000)
    return () => clearInterval(t)
  }, [tickTime])

  return (
    <div
      className="flex flex-col"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#000',
      }}
    >
      <div className="screen-only">
        {/* Background image with overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('/greyhound_bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1 }} />

        {/* Content */}
        <div className="flex flex-col h-full relative" style={{ zIndex: 2 }}>
          {/* HEADER */}
          <Header />

          {/* MAIN CONTENT */}
          <div className="flex flex-1 gap-0 overflow-hidden p-2 gap-2">
            {/* LEFT: Dog selection + bottom panels */}
            <div className="flex flex-col flex-1 gap-2" style={{ minWidth: 0 }}>
              {/* Dog Grid */}
              <div
                className="flex-1 p-3 rounded-lg"
                style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid #222' }}
              >
                <DogSelectionGrid />
              </div>

              {/* Pending amount display */}
              <div className="flex items-center justify-between gap-2 px-1">
                <PendingAmountDisplay />
                {/* Selection helper text */}
                <span style={{ color: '#555', fontSize: '0.72rem', fontFamily: "'Inter', sans-serif" }}>
                  Selección + monto → AGREGAR
                </span>
              </div>

              {/* Bottom: Ticket + Recent Tickets */}
              <div className="flex gap-2" style={{ height: 'clamp(240px, 34vh, 310px)' }}>
                {/* Ticket Actual */}
                <div className="flex-1 rounded-lg overflow-hidden">
                  <TicketPanel />
                </div>

                {/* Últimos Tickets */}
                <div className="flex-1 rounded-lg overflow-hidden" style={{ maxWidth: '360px' }}>
                  <RecentTickets />
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex flex-col gap-2" style={{ width: '240px', flexShrink: 0 }}>
              {/* Special Plays */}
              <div
                className="rounded-lg p-2"
                style={{
                  background: 'rgba(10,10,10,0.85)',
                  border: '1px solid #222',
                  height: '170px',
                }}
              >
                <SpecialPlaysPanel />
              </div>

              {/* Amount buttons */}
              <div
                className="rounded-lg p-2"
                style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid #222' }}
              >
                <AmountButtons />
              </div>

              {/* Action buttons */}
              <div
                className="rounded-lg p-2"
                style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid #222' }}
              >
                <ActionButtons />
              </div>
            </div>
          </div>

          {/* TICKER BAR */}
          <TickerBar />
        </div>
      </div>
      <TicketPrint />
    </div>
  )
}

export default App
