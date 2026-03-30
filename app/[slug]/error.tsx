'use client'

import Link from 'next/link'
import { BedDouble } from 'lucide-react'

export default function SlugError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Что-то пошло не так
        </h2>
        <p className="text-gray-500 mb-8">
          {error.message || 'Не удалось загрузить страницу. Попробуйте ещё раз.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-[#1b4332] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#2d6a4f] transition-colors"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors gap-1.5"
          >
            <BedDouble className="size-4" />
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
