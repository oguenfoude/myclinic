// Shared full-screen loading screen — used during auth redirects.
// Keeps every page from flashing its content while localStorage is checked.
import Logo from '@/components/Logo'

export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Logo mark */}
      <Logo className="w-16 h-16 mb-8 shadow-sm rounded-2xl animate-pulse" />

      {/* Spinner */}
      <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />

      {/* Message */}
      {message && (
        <p className="text-sm text-gray-400 font-medium">{message}</p>
      )}
    </div>
  )
}
