import Logo from '@/components/Logo'

export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface">
      <div className="flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
          <Logo className="relative w-16 h-16 rounded-2xl shadow-sm animate-pulse" />
        </div>
        <div className="relative">
          <span className="block w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
          </span>
        </div>
        {message && (
          <p className="mt-5 text-sm text-gray-400 font-medium">{message}</p>
        )}
      </div>
    </div>
  )
}
