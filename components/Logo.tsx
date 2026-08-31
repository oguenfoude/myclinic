export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MyClinic logo"
    >
      <defs>
        <linearGradient id="logo-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="55%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="9" fill="url(#logo-bg-gradient)" />

      {/* Clean medical cross */}
      <path
        d="M16 9.5V22.5M9.5 16H22.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Pulse line overlay */}
      <path
        d="M7 16h2.2l1.6-2.6 2.4 4.2 1.8-3 1.6 1.4h8.4"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  )
}
