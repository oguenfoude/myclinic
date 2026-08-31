import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed)',
          borderRadius: '28px',
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '68%', height: '68%' }}
        >
          <path d="M16 9.5V22.5M9.5 16H22.5" stroke="white" strokeWidth="3.4" strokeLinecap="round" />
          <path
            d="M7 16h2.2l1.6-2.6 2.4 4.2 1.8-3 1.6 1.4h8.4"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
