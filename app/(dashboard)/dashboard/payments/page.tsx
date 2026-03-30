import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"
import { ru } from "date-fns/locale"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { PaymentFilters } from "@/components/dashboard/payment-filters"

interface SearchParams {
  dateFrom?: string
  dateTo?: string
  method?: string
  status?: string
  page?: string
  limit?: string
}

const methodLabels: Record<string, string> = {
  STRIPE: "Stripe",
  KASPI: "Kaspi",
  CASH: "Наличные",
  BANK_TRANSFER: "Перевод",
  OTHER: "Другое",
}

const statusConfig: Record<string, { label: string; className: string }> = {
  succeeded: { label: "Успешно", className: "bg-green-100 text-green-700" },
  pending: { label: "Ожидает", className: "bg-yellow-100 text-yellow-700" },
  failed: { label: "Ошибка", className: "bg-red-100 text-red-700" },
  refunded: { label: "Возврат", className: "bg-gray-100 text-gray-700" },
}

function formatPrice(amount: number) {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
      amount
    ) + " ₸"
  )
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    redirect("/login")
  }

  const sp = await searchParams
  const page = parseInt(sp.page ?? "1", 10)
  const limit = parseInt(sp.limit ?? "20", 10)
  const skip = (page - 1) * limit

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const where: any = { booking: { hotelId } }

  if (sp.method && sp.method !== "ALL") where.method = sp.method
  if (sp.status && sp.status !== "ALL") where.status = sp.status
  if (sp.dateFrom || sp.dateTo) {
    where.createdAt = {}
    if (sp.dateFrom) where.createdAt.gte = new Date(sp.dateFrom)
    if (sp.dateTo) {
      const toDate = new Date(sp.dateTo)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const [payments, total, todayTotal, monthTotal] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            guestFirstName: true,
            guestLastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: {
        booking: { hotelId },
        status: "succeeded",
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        booking: { hotelId },
        status: "succeeded",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Платежи
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Получено сегодня</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(todayTotal._sum.amount ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">За этот месяц</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(monthTotal._sum.amount ?? 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Suspense>
        <PaymentFilters
          defaultMethod={sp.method}
          defaultStatus={sp.status}
          defaultDateFrom={sp.dateFrom}
          defaultDateTo={sp.dateTo}
        />
      </Suspense>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
          <CreditCard className="size-10 text-gray-300 mx-auto mb-4" />
          <p className="text-base font-medium text-gray-600 mb-1">
            Платежей не найдено
          </p>
          <p className="text-sm text-muted-foreground">
            Попробуйте изменить фильтры
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                    Дата
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                    № брони
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                    Гость
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                    Сумма
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                    Метод
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                    Статус
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                    Чек
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => {
                  const sc =
                    statusConfig[payment.status] ?? statusConfig["pending"]
                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {format(payment.createdAt, "d MMM yyyy, HH:mm", {
                          locale: ru,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/bookings/${payment.booking.id}`}
                          className="font-mono text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          {payment.booking.bookingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {payment.booking.guestFirstName}{" "}
                        {payment.booking.guestLastName}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {methodLabels[payment.method] ?? payment.method}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.className}`}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {payment.stripeReceiptUrl ? (
                          <a
                            href={payment.stripeReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            Открыть
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
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
                <Link
                  href={{
                    pathname: "/dashboard/payments",
                    query: { ...sp, page: page - 1 },
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                  >
                    Назад
                  </Button>
                </Link>
                <span className="text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <Link
                  href={{
                    pathname: "/dashboard/payments",
                    query: { ...sp, page: page + 1 },
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                  >
                    Вперёд
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
