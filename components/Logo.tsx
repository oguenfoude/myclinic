export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background shape with sleek gradient */}
      <defs>
        <linearGradient id="logo-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
          <stop offset="100%" stopColor="#4338ca" /> {/* indigo-700 */}
        </linearGradient>
      </defs>
      
      <rect width="32" height="32" rx="10" fill="url(#logo-bg-gradient)" />
      
      {/* Abstract Medical Cross / Eco shape */}
      <path 
        d="M16 8V24M8 16H24" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
      <circle 
        cx="16" 
        cy="16" 
        r="12" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeOpacity="0.3" 
      />
      <circle 
        cx="16" 
        cy="16" 
        r="5" 
        fill="white" 
      />
      {/* Inner Heart/Pulse shape */}
      <path 
        d="M14.5 15.5L16 17.5L18 14" 
        stroke="#4338ca" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  )
}
