import React from 'react'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFlag?: boolean
  align?: 'start' | 'center'
}

const sizes = {
  sm: {
    brand: '1.5rem',
    sub: '0.55rem',
    iconWidth: 28,
    iconHeight: 22,
    gap: '0.5rem',
  },
  md: {
    brand: '2rem',
    sub: '0.65rem',
    iconWidth: 36,
    iconHeight: 28,
    gap: '0.5rem',
  },
  lg: {
    brand: '2.6rem',
    sub: '0.8rem',
    iconWidth: 44,
    iconHeight: 34,
    gap: '0.75rem',
  },
  xl: {
    brand: '3.05rem',
    sub: '0.9rem',
    iconWidth: 52,
    iconHeight: 40,
    gap: '0.8rem',
  },
} as const

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showFlag = true, align = 'start' }) => {
  const currentSize = sizes[size]

  return (
    <div className="flex items-center" style={{ gap: currentSize.gap }}>
      <div className={`flex flex-col leading-none ${align === 'center' ? 'items-center' : 'items-start'}`}>
        <div className="flex items-center gap-1">
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: currentSize.brand,
              color: '#f5c518',
              letterSpacing: '0.05em',
              lineHeight: 1,
              textShadow: size === 'xl' ? '0 0 12px rgba(245,197,24,0.16)' : undefined,
            }}
          >
            MB
          </span>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: currentSize.brand,
              color: '#fff',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            RACES
          </span>
          <svg
            width={currentSize.iconWidth}
            height={currentSize.iconHeight}
            viewBox="0 0 36 28"
            fill="none"
            style={{ marginLeft: '4px', filter: size === 'xl' ? 'drop-shadow(0 0 12px rgba(245,197,24,0.18))' : 'drop-shadow(0 0 10px rgba(245,197,24,0.15))' }}
          >
            <path
              d="M2 22 C4 18, 8 14, 12 12 C14 11, 16 10, 18 8 C20 6, 22 4, 25 3 C27 2, 30 2, 32 4 C34 6, 34 9, 32 11 C30 13, 28 13, 26 14 C24 15, 22 16, 20 18 C18 20, 16 23, 14 25 L10 25 L10 22 L8 25 L4 25 Z"
              fill="#f5c518"
            />
            <circle cx="30" cy="7" r="2" fill="#f5c518" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 400,
            fontSize: currentSize.sub,
            color: '#888',
            letterSpacing: '0.2em',
            lineHeight: 1,
          }}
        >
          RACING DOGS
        </span>
      </div>
      {showFlag && <div style={{ marginLeft: '4px', fontSize: size === 'xl' ? '1.5rem' : size === 'lg' ? '1.35rem' : '1.1rem' }}>🇩🇴</div>}
    </div>
  )
}

export default BrandLogo
