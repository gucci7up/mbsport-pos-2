import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { usePOSStore } from '../store/posStore'

type DogColorKey = 1 | 2 | 3 | 4 | 5 | 6

interface DogOddsRow {
  dog: DogColorKey
  name: string
  win: number
  place: number
  exacta: number
  trifecta: number
}

interface TrifectaOddsRow {
  combo: string
  odds: number
}

const DOG_COLORS: Record<DogColorKey, string> = {
  1: '#ff0000',
  2: '#005eff',
  3: '#ffffff',
  4: '#111111',
  5: '#e8760a',
  6: 'stripes',
}

const DOG_TEXT_COLORS: Record<DogColorKey, string> = {
  1: '#ffffff',
  2: '#ffffff',
  3: '#111111',
  4: '#ffffff',
  5: '#ffffff',
  6: '#ff0000',
}

const DOG_NAMES: Record<DogColorKey, string> = {
  1: 'BRAVO',
  2: 'RELAMPAGO',
  3: 'TIGRE',
  4: 'NEGRO',
  5: 'FURIA',
  6: 'BANDIDO',
}

const DogChip: React.FC<{ dog: number; size?: 'sm' | 'md' }> = ({ dog, size = 'sm' }) => {
  const n = Math.min(6, Math.max(1, dog)) as DogColorKey
  const bg = DOG_COLORS[n]
  const textColor = DOG_TEXT_COLORS[n]
  const isStripes = bg === 'stripes'

  return (
    <span
      className={`results-dog-chip ${size}`}
      style={{
        background: isStripes
          ? 'repeating-linear-gradient(0deg, #111 0px, #111 7px, #fff 7px, #fff 14px)'
          : bg,
        color: textColor,
      }}
    >
      {n}
    </span>
  )
}

const currency = (value: number) => value.toFixed(2)

const buildMockDogOdds = (): DogOddsRow[] => ([
  { dog: 1, name: DOG_NAMES[1], win: 2.6, place: 1.55, exacta: 8.5, trifecta: 45 },
  { dog: 2, name: DOG_NAMES[2], win: 3.2, place: 1.8, exacta: 9.8, trifecta: 52 },
  { dog: 3, name: DOG_NAMES[3], win: 4.1, place: 2.15, exacta: 11.5, trifecta: 61 },
  { dog: 4, name: DOG_NAMES[4], win: 6.6, place: 3.1, exacta: 15, trifecta: 78 },
  { dog: 5, name: DOG_NAMES[5], win: 7.5, place: 3.55, exacta: 18, trifecta: 90 },
  { dog: 6, name: DOG_NAMES[6], win: 9.9, place: 4.25, exacta: 22, trifecta: 120 },
])

const buildExactaMatrix = (rows: DogOddsRow[]) => {
  const baseByDog = new Map<number, DogOddsRow>()
  rows.forEach(r => baseByDog.set(r.dog, r))
  const dogs: DogColorKey[] = [1, 2, 3, 4, 5, 6]

  return dogs.map(from => {
    return dogs.map(to => {
      if (from === to) return null
      const a = baseByDog.get(from)?.win ?? 5
      const b = baseByDog.get(to)?.win ?? 5
      const factor = 1.35
      const val = Math.max(2.0, (a + b) * factor)
      return Number(val.toFixed(2))
    })
  })
}

const buildTopTrifectas = (rows: DogOddsRow[]): TrifectaOddsRow[] => {
  const dogs: DogColorKey[] = [1, 2, 3, 4, 5, 6]
  const winByDog = new Map<number, number>()
  rows.forEach(r => winByDog.set(r.dog, r.win))

  const combos: TrifectaOddsRow[] = []
  for (let i = 0; i < dogs.length; i++) {
    for (let j = 0; j < dogs.length; j++) {
      for (let k = 0; k < dogs.length; k++) {
        if (i === j || i === k || j === k) continue
        const a = winByDog.get(dogs[i]) ?? 5
        const b = winByDog.get(dogs[j]) ?? 5
        const c = winByDog.get(dogs[k]) ?? 5
        const val = Math.max(10, (a + b + c) * 6.5)
        combos.push({ combo: `${dogs[i]}-${dogs[j]}-${dogs[k]}`, odds: Number(val.toFixed(2)) })
      }
    }
  }

  return combos.sort((x, y) => x.odds - y.odds).slice(0, 18)
}

const OddsPage: React.FC = () => {
  const { raceNumber, raceStatus, timeRemaining } = usePOSStore()
  const rows = useMemo(() => buildMockDogOdds(), [])
  const matrix = useMemo(() => buildExactaMatrix(rows), [rows])
  const trifectas = useMemo(() => buildTopTrifectas(rows), [rows])
  const rootRef = useRef<HTMLDivElement | null>(null)

  const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0')
  const seconds = (timeRemaining % 60).toString().padStart(2, '0')

  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current
      if (!root) return

      const shell = document.querySelector('.pos-shell') as HTMLElement | null
      const screen = document.querySelector('.pos-screen') as HTMLElement | null
      if (!shell) return

      const headerEl = (shell.children?.[0] as HTMLElement | undefined) ?? null
      const navbarEl = (shell.children?.[shell.children.length - 1] as HTMLElement | undefined) ?? null
      if (!headerEl || !navbarEl) return

      const headerH = headerEl.getBoundingClientRect().height
      const navbarH = navbarEl.getBoundingClientRect().height

      const screenStyles = screen ? getComputedStyle(screen) : null
      const padTop = screenStyles ? Number.parseFloat(screenStyles.paddingTop) || 0 : 0
      const padBottom = screenStyles ? Number.parseFloat(screenStyles.paddingBottom) || 0 : 0

      const shellStyles = getComputedStyle(shell)
      const gapY = Number.parseFloat(shellStyles.rowGap || shellStyles.gap) || 0

      root.style.setProperty('--odds-header-block', `${headerH + padTop + gapY}px`)
      root.style.setProperty('--odds-navbar-block', `${navbarH + padBottom + gapY}px`)
    }

    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div ref={rootRef} className="odds-shell">
      <div className="odds-top pos-panel-surface rounded-lg p-3">
        <div className="odds-top-item">
          <span className="odds-top-label">CARRERA ACTUAL</span>
          <span className="odds-top-value">{raceNumber}</span>
        </div>
        <div className="odds-top-item">
          <span className="odds-top-label">ESTADO</span>
          <span className="odds-top-value" style={{ color: raceStatus === 'OPEN' ? '#22c55e' : raceStatus === 'RUNNING' ? '#f5c518' : '#ef4444' }}>
            {raceStatus}
          </span>
        </div>
        <div className="odds-top-item">
          <span className="odds-top-label">TIEMPO RESTANTE</span>
          <span className="odds-top-value" style={{ fontFamily: "'Roboto Mono', monospace" }}>
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      <div className="odds-main-grid">
        <div className="odds-center-col">
          <div className="odds-table-panel pos-panel-surface rounded-lg overflow-hidden">
            <div className="results-panel-header">
              <span className="results-panel-title">CUOTAS - TABLA PRINCIPAL</span>
              <span className="results-panel-meta">{rows.length} perros</span>
            </div>

            <div className="odds-table-head">
              {['Número', 'Perro', 'Ganar', 'Place', 'Exacta', 'Trifecta'].map(col => (
                <span key={col}>{col}</span>
              ))}
            </div>
            <div className="odds-table-body">
              {rows.map(r => (
                <div key={r.dog} className="odds-table-row">
                  <span className="odds-cell">
                    <DogChip dog={r.dog} />
                  </span>
                  <span className="odds-cell odds-dog-name">{r.name}</span>
                  <span className="odds-cell odds-num">{currency(r.win)}</span>
                  <span className="odds-cell odds-num">{currency(r.place)}</span>
                  <span className="odds-cell odds-num">{currency(r.exacta)}</span>
                  <span className="odds-cell odds-num">{currency(r.trifecta)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="odds-lower-grid">
            <div className="odds-matrix-panel pos-panel-surface rounded-lg overflow-hidden">
              <div className="results-panel-header">
                <span className="results-panel-title">MATRIZ EXACTA</span>
                <span className="results-panel-meta">1° vs 2°</span>
              </div>

              <div className="odds-matrix-wrap">
                <div className="odds-matrix-grid">
                  <div className="odds-matrix-corner" />
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <div key={`col-${d}`} className="odds-matrix-head">
                      <DogChip dog={d} />
                    </div>
                  ))}
                  {[1, 2, 3, 4, 5, 6].map((from, i) => (
                    <React.Fragment key={`row-${from}`}>
                      <div className="odds-matrix-head">
                        <DogChip dog={from} />
                      </div>
                      {[1, 2, 3, 4, 5, 6].map((to, j) => {
                        const val = matrix[i][j]
                        return (
                          <div key={`${from}-${to}`} className={`odds-matrix-cell ${val === null ? 'disabled' : ''}`}>
                            {val === null ? '—' : currency(val)}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="odds-trifecta-panel pos-panel-surface rounded-lg overflow-hidden">
              <div className="results-panel-header">
                <span className="results-panel-title">TRIFECTAS</span>
                <span className="results-panel-meta">Top {trifectas.length}</span>
              </div>
              <div className="odds-tri-body">
                {trifectas.map(row => (
                  <div key={row.combo} className="odds-tri-row">
                    <span className="odds-tri-combo">{row.combo}</span>
                    <span className="odds-tri-odds">{currency(row.odds)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="odds-right-panel pos-panel-surface rounded-lg overflow-hidden">
          <div className="results-panel-header">
            <span className="results-panel-title">ESTADO CUOTAS</span>
            <span className="results-panel-meta">Mock</span>
          </div>
          <div className="odds-right-body">
            <div className="results-detail-item">
              <span className="results-detail-label">Carrera activa</span>
              <span className="results-detail-value">{raceNumber}</span>
            </div>
            <div className="results-detail-item">
              <span className="results-detail-label">Ultima actualizacion</span>
              <span className="results-detail-value" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                {new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="results-detail-item">
              <span className="results-detail-label">Estado API</span>
              <span className="results-status-badge" style={{ color: '#f5c518', border: '1px solid rgba(245,197,24,0.28)', background: 'rgba(38,30,5,0.88)' }}>
                NO CONECTADO
              </span>
            </div>
            <div className="results-detail-item">
              <span className="results-detail-label">Estado WebSocket</span>
              <span className="results-status-badge" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)', background: 'rgba(44,11,11,0.88)' }}>
                DESCONECTADO
              </span>
            </div>
            <div className="results-detail-item">
              <span className="results-detail-label">Cantidad de cuotas</span>
              <span className="results-detail-value">{rows.length + (6 * 6 - 6) + trifectas.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OddsPage
