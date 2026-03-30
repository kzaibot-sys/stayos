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
      <h2 className="text-xl font-semibold text-gray-900">
        Что-то пошло не так
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {error.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Попробовать снова
      </button>
    </div>
  )
}
