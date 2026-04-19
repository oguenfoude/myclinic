import { ImageResponse } from 'next/og'

export const runtime = 'edge'

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
          background: 'linear-gradient(to bottom right, #3b82f6, #4338ca)',
          borderRadius: '24px',
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '70%', height: '70%' }}
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
