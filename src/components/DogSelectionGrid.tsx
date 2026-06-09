import React from 'react'
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

interface DogButtonProps {
  dog: number
  row: number
  selectedDogs: (number | null)[]
  onSelect: (row: number, dog: number) => void
}

const DogButton: React.FC<DogButtonProps> = ({ dog, row, selectedDogs, onSelect }) => {
  const isSelected = selectedDogs[row] === dog
  const bg = DOG_COLORS[dog]
  const textColor = DOG_TEXT_COLORS[dog]
  const isStripes = bg === 'stripes'

  return (
    <button
      id={`dog-btn-row${row}-dog${dog}`}
      className={`dog-btn rounded-lg flex-1 ${isSelected ? 'selected' : ''}`}
      style={{
        minWidth: 0,
        height: '100%',
        background: isStripes
          ? 'repeating-linear-gradient(0deg, #111 0px, #111 10px, #fff 10px, #fff 20px)'
          : bg,
        color: textColor,
        fontSize: 'clamp(1.9rem, 3.3vw, 2.4rem)',
        fontWeight: '900',
        fontFamily: "'Barlow Condensed', sans-serif",
        boxShadow: isSelected
          ? '0 0 0 2px rgba(245,197,24,0.9), 0 0 18px rgba(245,197,24,0.55), 0 4px 18px rgba(0,0,0,0.65)'
          : '0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        filter: isSelected ? 'brightness(1.25) saturate(1.05)' : undefined,
        border: isSelected ? '3px solid #f5c518' : '2px solid rgba(255,255,255,0.15)',
      }}
      onClick={() => onSelect(row, dog)}
    >
      {dog}
    </button>
  )
}

export const DogSelectionGrid: React.FC = () => {
  const selectedDogs = usePOSStore(s => s.selectedDogs)
  const selectDog = usePOSStore(s => s.selectDog)

  const ROWS = [
    { label: '1°', row: 0 },
    { label: '2°', row: 1 },
    { label: '3°', row: 2 },
  ]

  return (
    <div className="flex flex-col gap-2 flex-1">
      {ROWS.map(({ label, row }) => (
        <div key={row} className="flex items-center gap-2 flex-1">
          <div
            className="text-white font-black text-3xl w-10 text-center shrink-0"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem' }}
          >
            {label}
          </div>
          <div className="flex gap-2 flex-1 h-full">
            {[1, 2, 3, 4, 5, 6].map(dog => (
              <DogButton key={dog} dog={dog} row={row} selectedDogs={selectedDogs} onSelect={selectDog} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
