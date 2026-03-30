'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-xl font-semibold text-foreground">
        Что-то пошло не так
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {error.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-lg bg-[#1b4332] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d6a4f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:ring-offset-2"
      >
        Попробовать снова
      </button>
    </div>
  )
}
