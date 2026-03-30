"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const TAG_COLORS: Record<string, string> = {
  VIP: "bg-purple-100 text-purple-700",
  Постоянный: "bg-blue-100 text-blue-700",
  Проблемный: "bg-red-100 text-red-700",
  Корпоративный: "bg-orange-100 text-orange-700",
}

function getTagColor(tag: string) {
  return TAG_COLORS[tag] ?? "bg-gray-100 text-gray-700"
}

function formatPrice(amount: number) {
  return (
    new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 0,
    }).format(amount) + " ₸"
  )
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  tags: string[]
  totalVisits: number
  totalSpent: number
  bookingCount: number
}

interface GuestTableProps {
  guests: Guest[]
  total: number
  page: number
  limit: number
}

export function GuestTable({ guests, total, page, limit }: GuestTableProps) {
  const router = useRouter()
  const totalPages = Math.ceil(total / limit)

  if (guests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
        <Users className="size-10 text-gray-300 mx-auto mb-4" />
        <p className="text-base font-medium text-gray-600 mb-1">
          Гостей не найдено
        </p>
        <p className="text-sm text-muted-foreground">
          Попробуйте изменить фильтры поиска
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Имя
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Телефон
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Визитов
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Потрачено
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Теги
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guests.map((guest) => (
              <tr
                key={guest.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/guests/${guest.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {guest.firstName} {guest.lastName}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {guest.email ?? (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {guest.phone ?? (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-700 font-medium">
                  {guest.totalVisits}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                  {formatPrice(guest.totalSpent)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {guest.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {guest.tags.length === 0 && (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/dashboard/guests/${guest.id}`}>
                    <Button variant="outline" size="sm">
                      Профиль
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Показано {Math.min((page - 1) * limit + 1, total)}–
            {Math.min(page * limit, total)} из {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set("page", String(page - 1))
                router.push(`/dashboard/guests?${params.toString()}`)
              }}
            >
              Назад
            </Button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set("page", String(page + 1))
                router.push(`/dashboard/guests?${params.toString()}`)
              }}
            >
              Вперёд
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
