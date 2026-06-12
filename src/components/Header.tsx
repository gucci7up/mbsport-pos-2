import React from 'react'
import { usePOSStore } from '../store/posStore'
import BrandLogo from './BrandLogo'
import { getAuthSession } from '../services/auth'

const RaceInfoBar: React.FC = () => {
  const { activeRaceId, raceNumber, raceStatus, startTime, activeTime, timeRemaining, totalTime, serverError } = usePOSStore()

  if (!activeRaceId) {
    return (
      <div
        className="flex items-center justify-center w-full px-4 py-3"
        style={{
          background: 'rgba(127,29,29,0.2)',
          borderBottom: '1px solid rgba(239,68,68,0.4)',
          borderTop: '1px solid rgba(239,68,68,0.4)',
          color: '#f87171',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          letterSpacing: '0.05em',
          textAlign: 'center',
        }}
      >
        ⚠️ No existe una carrera activa en este momento
      </div>
    )
  }

  const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0')
  const seconds = (timeRemaining % 60).toString().padStart(2, '0')
  const progressPct = Math.max(0, (timeRemaining / totalTime) * 100)

  const statusClass = raceStatus === 'OPEN'
    ? 'status-open'
    : raceStatus === 'RUNNING'
      ? 'status-running'
      : 'status-closed'

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-2"
      style={{
        background: 'rgba(0,0,0,0.85)',
        borderBottom: '1px solid #1a1a1a',
        borderTop: '1px solid #1a1a1a',
      }}
    >
      {/* CARRERA */}
      <div className="flex flex-col items-start">
        <span style={{ color: '#888', fontSize: '0.65rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>CARRERA</span>
        <span style={{ color: '#fff', fontSize: '2rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, lineHeight: 1 }}>
          {raceNumber}
        </span>
      </div>

      <div style={{ width: '1px', height: '40px', background: '#333' }} />

      {/* EMPIEZA */}
      <div className="flex flex-col items-start">
        <span style={{ color: '#888', fontSize: '0.65rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>EMPIEZA</span>
        <span style={{ color: '#fff', fontSize: '1rem', fontFamily: "'Roboto Mono', monospace", fontWeight: 600 }}>{startTime}</span>
      </div>

      <div style={{ width: '1px', height: '40px', background: '#333' }} />

      {/* ACTIVO */}
      <div className="flex flex-col items-start">
        <span style={{ color: '#888', fontSize: '0.65rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>ACTIVO</span>
        <span style={{ color: '#f5c518', fontSize: '1rem', fontFamily: "'Roboto Mono', monospace", fontWeight: 600 }}>{activeTime}</span>
      </div>

      <div style={{ width: '1px', height: '40px', background: '#333' }} />

      {/* TIEMPO RESTANTE */}
      <div className="flex flex-col items-start gap-1 flex-1 max-w-xs">
        <div className="flex items-center gap-2">
          <span style={{ color: '#888', fontSize: '0.65rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>TIEMPO RESTANTE</span>
          <span style={{ color: '#888', fontSize: '0.7rem', fontFamily: "'Roboto Mono', monospace" }}>{totalTime} seg</span>
        </div>
        <div className="flex items-center gap-3 w-full">
          <span style={{ color: '#fff', fontSize: '1.8rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, lineHeight: 1, minWidth: '80px' }}>
            {minutes}:{seconds}
          </span>
          {/* Progress bar */}
          <div className="flex-1 rounded-full" style={{ background: '#333', height: '10px' }}>
            <div
              className="progress-bar-fill rounded-full"
              style={{
                width: `${progressPct}%`,
                height: '10px',
                background: progressPct > 40 ? '#cc0000' : progressPct > 20 ? '#f5c518' : '#22c55e',
                boxShadow: '0 0 6px rgba(204,0,0,0.6)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ width: '1px', height: '40px', background: '#333' }} />

      {serverError && (
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded" 
          style={{ 
            background: 'rgba(127,29,29,0.4)', 
            border: '1px solid rgba(239,68,68,0.4)', 
            color: '#f87171', 
            fontSize: '0.78rem', 
            fontFamily: "'Barlow Condensed', sans-serif", 
            fontWeight: 700, 
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          ⚠️ SIN CONEXIÓN CON SERVIDOR
        </div>
      )}

      {serverError && <div style={{ width: '1px', height: '40px', background: '#333' }} />}

      {/* ESTADO */}
      <div className="flex flex-col items-center">
        <span style={{ color: '#888', fontSize: '0.65rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>ESTADO</span>
        {serverError ? (
          <span className="race-status-badge status-closed" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', whiteSpace: 'nowrap' }}>
            DESCONECTADO
          </span>
        ) : (
          <span className={`race-status-badge ${statusClass}`}>
            {raceStatus}
          </span>
        )}
      </div>
    </div>
  )
}

const Header: React.FC = () => {
  const { activeTab, setActiveTab } = usePOSStore()
  const session = getAuthSession()

  const NAV_TABS = ['JUGADA', 'RESULTADOS', 'CUOTAS', 'VENTAS', 'CAJA'] as const

  return (
    <div
      style={{
        background: '#000',
        border: '1px solid #1a1a1a',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 10px 28px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top bar */}
      <div
        className="relative flex items-center justify-between gap-3 px-3 py-2 xl:px-4"
        style={{
          borderBottom: '1px solid #1a1a1a',
          minHeight: '56px',
        }}
      >
        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          <BrandLogo size="sm" showFlag={false} />
        </div>

        {/* Nav tabs */}
        <div
          className="absolute left-1/2 top-1/2 flex items-center justify-center gap-x-1"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {NAV_TABS.map(tab => (
            <button
              key={tab}
              id={`nav-tab-${tab.toLowerCase()}`}
              className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right info */}
        <div className="flex flex-shrink-0 items-center gap-2.5" style={{ marginLeft: 'auto' }}>
          {/* Agency / User */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span style={{ color: '#f5c518', fontSize: '0.75rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
                {session?.user?.agencyId ? `AGENCIA ${session.user.agencyId}` : 'AGENCIA CENTRAL'}
              </span>
              <span style={{ color: '#aaa', fontSize: '0.7rem', fontFamily: "'Roboto Mono', monospace" }}>{session?.user?.username ?? 'admin'}</span>
              <span style={{ color: '#22c55e', fontSize: '0.65rem', fontFamily: "'Inter', sans-serif" }}>● En línea</span>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#222',
                border: '2px solid #444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aaa',
                fontSize: '1.2rem',
              }}
            >
              👤
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', background: '#333' }} />

          {/* QID */}
          <div className="flex flex-col">
            <span style={{ color: '#f5c518', fontSize: '0.75rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
              QID
            </span>
            <span style={{ color: '#aaa', fontSize: '0.68rem', fontFamily: "'Roboto Mono', monospace" }}>881-151-615-613</span>
            <span style={{ color: '#aaa', fontSize: '0.68rem', fontFamily: "'Roboto Mono', monospace" }}>g0llha7yyhjhb</span>
            <span style={{ color: '#555', fontSize: '0.62rem', fontFamily: "'Roboto Mono', monospace" }}>v 2.51.04</span>
          </div>

          <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}>⚙️</button>
        </div>
      </div>

      {/* Race info bar */}
      <RaceInfoBar />
    </div>
  )
}

export default Header
