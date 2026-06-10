import React from 'react'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFlag?: boolean
  align?: 'start' | 'center'
}

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showFlag = true, align = 'start' }) => {
  return (
    <div
      className={`flex ${align === 'center' ? 'justify-center' : 'justify-start'} items-center`}
      style={{ gap: showFlag ? '0.45rem' : 0 }}
    >
      <div className={`flex ${align === 'center' ? 'justify-center' : 'justify-start'} items-center`}>
        <img
          src="/mbsport-logo.png"
          alt="MBSPORT Racing Dogs"
          style={{
            width: 'min(220px, 100%)',
            height: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 0 20px rgba(245, 197, 24, 0.12))',
          }}
        />
      </div>
      {showFlag && <div style={{ marginLeft: '4px', fontSize: size === 'xl' ? '1.5rem' : size === 'lg' ? '1.35rem' : '1.1rem' }}>🇩🇴</div>}
    </div>
  )
}

export default BrandLogo
