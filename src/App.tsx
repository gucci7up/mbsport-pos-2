import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Header from './components/Header'
import { DogSelectionGrid } from './components/DogSelectionGrid'
import { SpecialPlaysPanel } from './components/SpecialPlaysPanel'
import { AmountButtons } from './components/AmountButtons'
import { TicketPanel } from './components/TicketPanel'
import { RecentTickets } from './components/RecentTickets'
import { ActionButtons } from './components/ActionButtons'
import { TicketPrint } from './components/TicketPrint'
import { PrintErrorBoundary } from './components/PrintErrorBoundary'
import LoginPage from './pages/LoginPage'
import CashPage from './pages/CashPage'
import OddsPage from './pages/OddsPage'
import ResultsPage from './pages/ResultsPage'
import SalesPage from './pages/SalesPage'
import SettingsPage from './pages/SettingsPage'
import { getBetDraftFromSelection, usePOSStore } from './store/posStore'
import { isAuthenticated } from './services/auth'
import { getCurrentRace, getRaceOddsLive } from './services/races'

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
      className="pos-footer-bar flex items-center gap-3 overflow-hidden"
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
          BIENVENIDO A MBSPORT - SISTEMA PROFESIONAL DE APUESTAS &nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp; RECUERDE APOSTAR RESPONSABLEMENTE &nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp; CARRERA 397 EN CURSO &nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp; MBSPORT RACING DOGS
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

const POSScreen: React.FC = () => {
  const { tickTime, activeTab, updateRaceFromBackend, setServerError, updateOddsFromBackend, setOddsError } = usePOSStore()
  const activeRaceId = usePOSStore(s => s.activeRaceId)
  const raceNumber = usePOSStore(s => s.raceNumber)

  // Poll current race status every 5 seconds
  const { data: currentRace, error } = useQuery({
    queryKey: ['currentRace'],
    queryFn: getCurrentRace,
    refetchInterval: 5000,
    retry: true,
  })

  // Poll live odds every 5 seconds
  const { data: liveOdds, error: oddsError } = useQuery({
    queryKey: ['liveOdds', activeRaceId],
    queryFn: () => getRaceOddsLive(activeRaceId!),
    refetchInterval: 5000,
    enabled: Boolean(activeRaceId),
    retry: true,
  })

  // Synchronize store with queried race
  useEffect(() => {
    if (currentRace !== undefined) {
      updateRaceFromBackend(currentRace)
    }
  }, [currentRace, updateRaceFromBackend])

  // Synchronize store with queried odds
  useEffect(() => {
    if (liveOdds) {
      updateOddsFromBackend(liveOdds)
      // Print validation logs as required in task 7
      const winners = liveOdds.filter(e => e.betType === 'WINNER')
      console.log(`Race ID: ${activeRaceId}\nRace Number: ${raceNumber}\n\n` +
        winners.map(e => `Dog ${e.selection}: ${parseFloat(e.currentOdds).toFixed(2)}`).join('\n'))
    }
  }, [liveOdds, updateOddsFromBackend, activeRaceId, raceNumber])

  // Propagate API connection error to store
  useEffect(() => {
    if (error) {
      setServerError('Sin conexión con servidor')
    }
  }, [error, setServerError])

  // Propagate live odds error to store
  useEffect(() => {
    if (oddsError) {
      setOddsError('Cuotas no disponibles')
    }
  }, [oddsError, setOddsError])

  // Race countdown timer (local tick)
  useEffect(() => {
    const t = setInterval(tickTime, 1000)
    return () => clearInterval(t)
  }, [tickTime])

  return (
    <div
      className="pos-screen flex flex-col"
      style={{
        width: '100%',
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
        <div className="relative z-10 h-full">
          <div className="pos-shell">
            {/* HEADER */}
            <Header />

            {/* MAIN CONTENT */}
            {activeTab === 'RESULTADOS' ? (
              <ResultsPage />
            ) : activeTab === 'CUOTAS' ? (
              <OddsPage />
            ) : activeTab === 'VENTAS' ? (
              <SalesPage />
            ) : activeTab === 'CAJA' ? (
              <CashPage />
            ) : (
              <div className="pos-main-grid">
                {/* LEFT: Dog selection + bottom panels */}
                <div className="pos-left-grid">
                  {/* Dog Grid */}
                  <div
                    className="pos-panel-surface rounded-lg p-3"
                    style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid #222' }}
                  >
                    <DogSelectionGrid />
                  </div>

                  {/* Pending amount display */}
                  <div className="flex items-center gap-2 px-1" style={{ marginTop: '2px', marginBottom: '4px' }}>
                    <PendingAmountDisplay />
                  </div>

                  {/* Bottom: Ticket + Recent Tickets */}
                  <div className="pos-bottom-grid">
                    {/* Ticket Actual */}
                    <div className="rounded-lg overflow-hidden" style={{ minWidth: 0 }}>
                      <TicketPanel />
                    </div>

                    {/* Últimos Tickets */}
                    <div className="rounded-lg overflow-hidden" style={{ minWidth: 0 }}>
                      <RecentTickets />
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="pos-sidebar-grid">
                  {/* Special Plays */}
                  <div
                    className="pos-panel-surface rounded-lg p-2"
                    style={{
                      background: 'rgba(10,10,10,0.85)',
                      border: '1px solid #222',
                    }}
                  >
                    <SpecialPlaysPanel />
                  </div>

                  {/* Amount buttons */}
                  <div
                    className="pos-panel-surface rounded-lg p-2"
                    style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid #222' }}
                  >
                    <AmountButtons />
                  </div>

                  {/* Action buttons */}
                  <div
                    className="pos-panel-surface rounded-lg p-2"
                    style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid #222', marginTop: '-8px' }}
                  >
                    <ActionButtons />
                  </div>
                </div>
              </div>
            )}

            {/* TICKER BAR */}
            <TickerBar />
          </div>
        </div>
      </div>
      <PrintErrorBoundary>
        <TicketPrint />
      </PrintErrorBoundary>
    </div>
  )
}

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/pos" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pos" replace />} />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <POSScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
