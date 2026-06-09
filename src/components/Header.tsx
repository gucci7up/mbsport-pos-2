import React from 'react'
import { usePOSStore } from '../store/posStore'

const RaceInfoBar: React.FC = () => {
  const { raceNumber, raceStatus, startTime, activeTime, timeRemaining, totalTime } = usePOSStore()

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
      className="flex items-center gap-4 px-4 py-2"
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

      {/* ESTADO */}
      <div className="flex flex-col items-center">
        <span style={{ color: '#888', fontSize: '0.65rem', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>ESTADO</span>
        <span className={`font-black ${statusClass}`} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem', letterSpacing: '0.1em' }}>
          {raceStatus}
        </span>
      </div>
    </div>
  )
}

const Header: React.FC = () => {
  const { activeTab, setActiveTab } = usePOSStore()

  const NAV_TABS = ['JUGADA', 'RESULTADOS', 'CUOTAS', 'VENTAS', 'CAJA'] as const

  return (
    <div style={{ background: '#000', borderBottom: '2px solid #1a1a1a' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4" style={{ height: '60px', borderBottom: '1px solid #1a1a1a' }}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1">
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: '#f5c518',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                }}
              >
                MB
              </span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: '#fff',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                }}
              >
                RACES
              </span>
              {/* Dog silhouette */}
              <svg width="36" height="28" viewBox="0 0 36 28" fill="none" style={{ marginLeft: '4px' }}>
                <path d="M2 22 C4 18, 8 14, 12 12 C14 11, 16 10, 18 8 C20 6, 22 4, 25 3 C27 2, 30 2, 32 4 C34 6, 34 9, 32 11 C30 13, 28 13, 26 14 C24 15, 22 16, 20 18 C18 20, 16 23, 14 25 L10 25 L10 22 L8 25 L4 25 Z" fill="#f5c518" />
                <circle cx="30" cy="7" r="2" fill="#f5c518" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 400,
                fontSize: '0.65rem',
                color: '#888',
                letterSpacing: '0.2em',
                lineHeight: 1,
              }}
            >
              RACING DOGS
            </span>
          </div>
          {/* Dominican flag */}
          <div style={{ marginLeft: '4px', fontSize: '1.1rem' }}>🇩🇴</div>
        </div>

        {/* Nav tabs */}
        <div className="flex items-end h-full">
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
        <div className="flex items-center gap-4">
          {/* Agency / User */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span style={{ color: '#f5c518', fontSize: '0.75rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
                AGENCIA DEMO
              </span>
              <span style={{ color: '#aaa', fontSize: '0.7rem', fontFamily: "'Roboto Mono', monospace" }}>admin</span>
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

          <div style={{ width: '1px', height: '36px', background: '#333' }} />

          {/* QID */}
          <div className="flex flex-col">
            <span style={{ color: '#f5c518', fontSize: '0.75rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
              QID
            </span>
            <span style={{ color: '#aaa', fontSize: '0.68rem', fontFamily: "'Roboto Mono', monospace" }}>881-151-615-613</span>
            <span style={{ color: '#aaa', fontSize: '0.68rem', fontFamily: "'Roboto Mono', monospace" }}>g0llha7yyhjhb</span>
            <span style={{ color: '#555', fontSize: '0.62rem', fontFamily: "'Roboto Mono', monospace" }}>v 2.51.04</span>
          </div>

          <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>⚙️</button>
        </div>
      </div>

      {/* Race info bar */}
      <RaceInfoBar />
    </div>
  )
}

export default Header
