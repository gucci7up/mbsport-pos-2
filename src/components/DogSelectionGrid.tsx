import React, { useState } from 'react'
import { usePOSStore } from '../store/posStore'

const DOG_COLORS: Record<number, string> = {
  1: '#ff0000',
  2: '#005eff',
  3: '#ffffff',
  4: '#111111',
  5: '#e8760a',
  6: 'stripes',
}

const DOG_TEXT_COLORS: Record<number, string> = {
  1: '#ffffff',
  2: '#ffffff',
  3: '#111111',
  4: '#ffffff',
  5: '#ffffff',
  6: '#ff0000',
}

const DOG_NAMES: Record<number, string> = {
  1: 'BRAVO',
  2: 'RELAMPAGO',
  3: 'TIGRE',
  4: 'NEGRO',
  5: 'FURIA',
  6: 'BANDIDO',
}

const DOG_COLOR_LABELS: Record<number, string> = {
  1: 'ROJO',
  2: 'AZUL',
  3: 'BLANCO',
  4: 'NEGRO',
  5: 'NARANJA',
  6: 'BLANCO / NEGRO',
}

const DOG_ODDS: Record<number, { ganar: string; exacta: string; trifecta: string }> = {
  1: { ganar: '2.60', exacta: '8.50', trifecta: '45.00' },
  2: { ganar: '3.20', exacta: '9.80', trifecta: '52.00' },
  3: { ganar: '4.10', exacta: '11.50', trifecta: '61.00' },
  4: { ganar: '6.60', exacta: '15.00', trifecta: '78.00' },
  5: { ganar: '7.50', exacta: '18.00', trifecta: '90.00' },
  6: { ganar: '9.90', exacta: '22.00', trifecta: '120.00' },
}

const DOG_IMAGES: Record<number, string> = {
  1: '/images/dogs/1.png',
  2: '/images/dogs/2.png',
  3: '/images/dogs/3.png',
  4: '/images/dogs/4.png',
  5: '/images/dogs/5.png',
  6: '/images/dogs/6.png',
}

interface DogButtonProps {
  dog: number
  row: number
  selectedDogs: (number | null)[]
  onSelect: (row: number, dog: number) => void
}

const DogButton: React.FC<DogButtonProps> = ({ dog, row, selectedDogs, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false)
  const isSelected = selectedDogs[row] === dog
  const bg = DOG_COLORS[dog]
  const textColor = DOG_TEXT_COLORS[dog]
  const isStripes = bg === 'stripes'
  const odds = DOG_ODDS[dog]
  const colorLabel = DOG_COLOR_LABELS[dog]
  const dogName = DOG_NAMES[dog]
  const cardHeight = 'clamp(142px, 13.2vh, 144px)'
  const imageHeight = 'clamp(70px, 7.3vh, 75px)'

  const badgeBackground = isStripes
    ? 'repeating-linear-gradient(0deg, #111 0px, #111 7px, #fff 7px, #fff 14px)'
    : bg

  const cardBorder = isSelected ? '1px solid rgba(245,197,24,0.98)' : '1px solid rgba(255,255,255,0.08)'
  const cardShadow = isSelected
    ? '0 0 0 2px rgba(245,197,24,0.72), 0 0 22px rgba(245,197,24,0.34), 0 10px 24px rgba(0,0,0,0.46)'
    : isHovered
      ? '0 10px 22px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.03)'
      : '0 8px 18px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.03)'

  return (
    <button
      id={`dog-btn-row${row}-dog${dog}`}
      className="rounded-lg"
      style={{
        minWidth: 0,
        height: cardHeight,
        display: 'grid',
        gridTemplateRows: `${imageHeight} auto auto`,
        background: 'linear-gradient(180deg, rgba(12,12,12,0.99) 0%, rgba(5,5,5,0.99) 100%)',
        border: cardBorder,
        boxShadow: cardShadow,
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
        cursor: 'pointer',
        transform: 'translateZ(0)',
      }}
      onClick={() => onSelect(row, dog)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          height: imageHeight,
          overflow: 'hidden',
          background: '#080808',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '3px',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={DOG_IMAGES[dog]}
          alt={`Perro ${dog} ${dogName}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            display: 'block',
            borderRadius: '6px',
            filter: `${isHovered ? 'brightness(1.08)' : 'brightness(1)'} contrast(1.04)`,
            transform: `scale(${isHovered ? 1.03 : 1})`,
            transition: 'transform 200ms ease, filter 200ms ease',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(24px, 1.7vw, 30px) minmax(0, 1fr)',
          gap: '6px',
          alignItems: 'start',
          padding: '4px 6px 3px',
          minWidth: 0,
          background: 'linear-gradient(180deg, rgba(13,13,13,0.98) 0%, rgba(7,7,7,0.98) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            width: 'clamp(24px, 1.7vw, 30px)',
            height: 'clamp(24px, 1.7vw, 30px)',
            borderRadius: '5px',
            background: badgeBackground,
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(0.95rem, 1.25vw, 1.15rem)',
            lineHeight: 1,
            border: isStripes ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 10px rgba(0,0,0,0.22)',
          }}
        >
          {dog}
        </div>
        <div style={{ minWidth: 0, textAlign: 'left' }}>
          <div
            style={{
              color: '#f1f1f1',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              letterSpacing: '0.06em',
              fontSize: 'clamp(0.62rem, 0.8vw, 0.8rem)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {dogName}
          </div>
          <div
            style={{
              marginTop: '2px',
              color: isStripes ? '#cfcfcf' : bg,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.08em',
              fontSize: 'clamp(0.45rem, 0.58vw, 0.58rem)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {colorLabel}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '3px',
          padding: '3px 5px 4px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, rgba(7,7,7,0.98) 0%, rgba(4,4,4,0.99) 100%)',
        }}
      >
        {[
          ['GANAR', odds.ganar],
          ['EXACTA', odds.exacta],
          ['TRIFECTA', odds.trifecta],
        ].map(([label, value]) => (
          <div key={label} style={{ minWidth: 0, textAlign: 'center' }}>
            <div
              style={{
                color: '#7e7e7e',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(0.34rem, 0.46vw, 0.46rem)',
                letterSpacing: '0.08em',
                lineHeight: 1,
              }}
            >
              {label}
            </div>
            <div
              style={{
                marginTop: '1px',
                color: '#f1f1f1',
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: 700,
                fontSize: 'clamp(0.42rem, 0.58vw, 0.58rem)',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </button>
  )
}

export const DogSelectionGrid: React.FC = () => {
  const selectedDogs = usePOSStore(s => s.selectedDogs)
  const selectDog = usePOSStore(s => s.selectDog)

  const ROWS = [
    { label: '1°', sublabel: 'LUGAR', row: 0 },
    { label: '2°', sublabel: 'LUGAR', row: 1 },
    { label: '3°', sublabel: 'LUGAR', row: 2 },
  ]

  return (
    <div className="flex flex-col gap-2" style={{ minHeight: 0 }}>
      {ROWS.map(({ label, sublabel, row }) => (
        <div key={row} className="flex items-stretch gap-3">
          <div
            className="shrink-0"
            style={{
              width: 'clamp(42px, 4.5vw, 52px)',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(10,10,10,0.92) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 4px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
            }}
          >
            <div
              className="text-white font-black text-center"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.45rem, 2vw, 2rem)', lineHeight: 1 }}
            >
              {label}
            </div>
            <div
              style={{
                color: '#888',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(0.52rem, 0.62vw, 0.62rem)',
                letterSpacing: '0.08em',
                lineHeight: 1,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              {sublabel}
            </div>
          </div>
          <div
            className="flex-1 overflow-x-auto overflow-y-hidden"
            style={{
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <div
              className="grid"
              style={{
                minHeight: 0,
                minWidth: 'max(980px, 100%)',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map(dog => (
                <DogButton key={dog} dog={dog} row={row} selectedDogs={selectedDogs} onSelect={selectDog} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
