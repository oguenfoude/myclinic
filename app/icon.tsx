import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
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
          background: 'linear-gradient(to bottom right, #3b82f6, #4338ca)',
          borderRadius: '8px',
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '80%', height: '80%' }}
        >
          <path d="M16 8V24M8 16H24" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          <circle cx="16" cy="16" r="4" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
