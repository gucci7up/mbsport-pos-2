import React from 'react'
import { usePOSStore } from '../store/posStore'

export const SpecialPlaysPanel: React.FC = () => {
  const {
    applyPaTraPaLante,
    applyReverseForecast,
    applyRulay,
    applyMitad,
    selectedDogs,
    pendingAmount,
    bets,
  } = usePOSStore()

  const hasTwo = selectedDogs[0] !== null && selectedDogs[1] !== null
  const hasOne = selectedDogs[0] !== null
  const hasAmount = pendingAmount > 0
  const hasTicketBets = bets.length > 0

  return (
    <div className="grid grid-cols-2 gap-2" style={{ height: '100%' }}>
      {/* PA' TRÁ Y PA' LANTE */}
      <button
        id="btn-pa-tra-pa-lante"
        className="special-btn rounded-lg flex flex-col items-center justify-center gap-1"
        onClick={applyPaTraPaLante}
        disabled={!hasTwo || !hasAmount}
        style={{ opacity: hasTwo && hasAmount ? 1 : 0.5 }}
      >
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>↑↓</span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.05em',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          PA' TRÁ<br />Y PA' LANTE
        </span>
      </button>

      {/* REVERSE FORECAST */}
      <button
        id="btn-reverse-forecast"
        className="special-btn rounded-lg flex flex-col items-center justify-center gap-1"
        onClick={applyReverseForecast}
        disabled={!hasTwo || !hasAmount}
        style={{ opacity: hasTwo && hasAmount ? 1 : 0.5 }}
      >
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>↔</span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.05em',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          REVERSE<br />FORECAST
        </span>
      </button>

      {/* RULAY */}
      <button
        id="btn-rulay"
        className="special-btn rounded-lg flex flex-col items-center justify-center gap-1"
        onClick={applyRulay}
        disabled={!hasOne || !hasAmount}
        style={{ opacity: hasOne && hasAmount ? 1 : 0.5 }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '2.4rem',
            lineHeight: 1,
          }}
        >
          R
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.1em',
          }}
        >
          RULAY
        </span>
      </button>

      {/* MITAD */}
      <button
        id="btn-mitad"
        className="special-btn rounded-lg flex flex-col items-center justify-center gap-1"
        onClick={applyMitad}
        disabled={!hasTicketBets}
        style={{ opacity: hasTicketBets ? 1 : 0.5 }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '2.0rem',
            lineHeight: 1,
          }}
        >
          R/2
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.1em',
          }}
        >
          MITAD
        </span>
      </button>
    </div>
  )
}
