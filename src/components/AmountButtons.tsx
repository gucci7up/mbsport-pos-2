import React from 'react'
import { usePOSStore } from '../store/posStore'

const AMOUNTS = [25, 50, 100, 200]

export const AmountButtons: React.FC = () => {
  const addAmountToPending = usePOSStore(s => s.addAmountToPending)
  const pendingAmount = usePOSStore(s => s.pendingAmount)

  return (
    <div className="flex flex-col gap-2">
      <div
        className="rounded px-3 py-3"
        style={{
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(245,197,24,0.28)',
          boxShadow: pendingAmount > 0 ? '0 0 12px rgba(245,197,24,0.18)' : 'none',
        }}
      >
        <div style={{ color: '#f5c518', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: '0.18em', fontSize: '0.8rem', textAlign: 'center' }}>
          MONTO ACTUAL
        </div>
        <div
          style={{
            color: pendingAmount > 0 ? '#f5c518' : '#666',
            fontFamily: "'Roboto Mono', monospace",
            fontWeight: 900,
            fontSize: 'clamp(2.625rem, 3.8vw, 3.3rem)',
            minHeight: '42px',
            lineHeight: 1,
            textAlign: 'center',
            textShadow: pendingAmount > 0 ? '0 0 18px rgba(245,197,24,0.22)' : 'none',
            marginTop: '6px',
          }}
        >
          RD$ {pendingAmount.toFixed(0)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {AMOUNTS.map(amt => (
          <button
            key={amt}
            id={`btn-amount-${amt}`}
            className="amount-btn rounded-lg"
            style={{ height: 'clamp(52px, 7vh, 64px)' }}
            onClick={() => addAmountToPending(amt)}
          >
            {amt}
          </button>
        ))}
      </div>
    </div>
  )
}
