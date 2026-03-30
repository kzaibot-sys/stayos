import Link from 'next/link'
import { BedDouble, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1b4332]/10 mb-8">
          <Search className="size-12 text-[#2d6a4f]" />
        </div>

        {/* 404 number */}
        <p className="text-8xl font-extrabold text-gray-200 leading-none mb-2">
          404
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Страница не найдена
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-8">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#1b4332] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#2d6a4f] transition-colors gap-2"
          >
            <BedDouble className="size-4" />
            На главную
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Войти в систему
          </Link>
        </div>
      </div>
    </div>
  )
}
