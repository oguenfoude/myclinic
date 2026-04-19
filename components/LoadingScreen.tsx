// Shared full-screen loading screen — used during auth redirects.
// Keeps every page from flashing its content while localStorage is checked.
export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Logo mark */}
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>

      {/* Spinner */}
      <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />

      {/* Message */}
      {message && (
        <p className="text-sm text-gray-400 font-medium">{message}</p>
      )}
    </div>
  )
}
