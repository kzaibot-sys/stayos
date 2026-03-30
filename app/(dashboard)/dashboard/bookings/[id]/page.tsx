import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingActions } from "@/components/dashboard/booking-actions"

const bookingStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Ожидает", className: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Подтверждена", className: "bg-blue-100 text-blue-700" },
  CHECKED_IN: { label: "Заселён", className: "bg-green-100 text-green-700" },
  CHECKED_OUT: { label: "Выселился", className: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "Отменена", className: "bg-red-100 text-red-700" },
  NO_SHOW: { label: "Не приехал", className: "bg-orange-100 text-orange-700" },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  UNPAID: { label: "Не оплачено", className: "bg-red-100 text-red-700" },
  PARTIAL: { label: "Частично", className: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Оплачено", className: "bg-green-100 text-green-700" },
  REFUNDED: { label: "Возврат", className: "bg-gray-100 text-gray-700" },
}

const sourceLabels: Record<string, string> = {
  DIRECT: "Сайт",
  WIDGET: "Виджет",
  MANUAL: "Вручную",
  BOOKING_COM: "Booking.com",
  AIRBNB: "Airbnb",
  OTHER: "Другое",
}

const roomTypeLabels: Record<string, string> = {
  STANDARD: "Стандарт",
  DELUXE: "Делюкс",
  SUITE: "Люкс",
  APARTMENT: "Апартаменты",
  DORMITORY: "Общая комната",
  VILLA: "Вилла",
}

function formatDate(date: Date) {
  return format(date, "d MMMM yyyy", { locale: ru })
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(amount) + " ₸"
}

function formatDateTime(date: Date | null) {
  if (!date) return null
  return format(date, "d MMM yyyy HH:mm", { locale: ru })
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) redirect("/login")

  const { id } = await params

  const booking = await prisma.booking.findFirst({
    where: { id, hotelId },
    include: {
      room: true,
      guest: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!booking) notFound()

  const statusCfg = bookingStatusConfig[booking.status] ?? bookingStatusConfig["PENDING"]
  const paymentCfg = paymentStatusConfig[booking.paymentStatus] ?? paymentStatusConfig["UNPAID"]
  const remaining = booking.totalPrice - booking.paidAmount

  // Build status timeline events
  const timeline: { label: string; date: Date | null }[] = [
    { label: "Создана", date: booking.createdAt },
    { label: "Заселён", date: booking.checkedInAt },
    { label: "Выселился", date: booking.checkedOutAt },
    { label: "Отменена", date: booking.cancelledAt },
  ].filter((e) => e.date !== null)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold text-gray-900">
              {booking.bookingNumber}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {sourceLabels[booking.source] ?? booking.source}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Создана {formatDateTime(booking.createdAt)}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking info card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Информация о брони</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Guest info */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Гость
                </h3>
                <p className="font-medium text-gray-900 text-lg">
                  {booking.guestFirstName} {booking.guestLastName}
                </p>
                {booking.guestEmail && (
                  <p className="text-sm text-gray-500 mt-1">{booking.guestEmail}</p>
                )}
                {booking.guestPhone && (
                  <p className="text-sm text-gray-500">{booking.guestPhone}</p>
                )}
              </div>

              {/* Room info */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Номер
                </h3>
                <p className="font-medium text-gray-900">
                  {booking.room.name}
                  {booking.room.roomNumber && (
                    <span className="text-gray-400 font-normal ml-1 text-sm">
                      #{booking.room.roomNumber}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {roomTypeLabels[booking.room.type] ?? booking.room.type}
                </p>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Даты
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Заезд:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(booking.checkIn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Выезд:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Ночей:</span>
                    <span className="font-medium text-gray-900">{booking.nights}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Гостей:</span>
                    <span className="font-medium text-gray-900">
                      {booking.adults} взр.{booking.children > 0 ? `, ${booking.children} дет.` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price per night */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Тариф
                </h3>
                <p className="font-medium text-gray-900">
                  {formatPrice(booking.pricePerNight)} / ночь
                </p>
                {booking.discount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Скидка: {formatPrice(booking.discount)}
                  </p>
                )}
              </div>
            </div>

            {/* Special requests */}
            {booking.specialRequests && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Особые пожелания
                </h3>
                <p className="text-sm text-gray-700">{booking.specialRequests}</p>
              </div>
            )}

            {/* Internal notes */}
            {booking.internalNotes && (
              <div className="mt-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Внутренние заметки
                </h3>
                <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                  {booking.internalNotes}
                </p>
              </div>
            )}

            {/* Cancel reason */}
            {booking.cancelReason && (
              <div className="mt-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Причина отмены
                </h3>
                <p className="text-sm text-red-600">{booking.cancelReason}</p>
              </div>
            )}
          </div>

          {/* Payments */}
          {booking.payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Платежи</h2>
              <div className="space-y-3">
                {booking.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.method}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column (1/3 width) */}
        <div className="space-y-6">
          {/* Payment summary card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Оплата</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Итого:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(booking.totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Оплачено:</span>
                <span className="font-medium text-green-600">
                  {formatPrice(booking.paidAmount)}
                </span>
              </div>
              {remaining > 0 && (
                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="text-gray-500">Остаток:</span>
                  <span className="font-semibold text-red-600">
                    {formatPrice(remaining)}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentCfg.className}`}
                >
                  {paymentCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {timeline.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">История</h2>
              <div className="relative">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 pl-6 relative">
                      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.label}</p>
                        {event.date && (
                          <p className="text-xs text-gray-500">{formatDateTime(event.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Действия</h2>
            <div className="space-y-2">
              <BookingActions
                bookingId={booking.id}
                status={booking.status}
              />
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Mail className="size-4 mr-2" />
                Отправить email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
