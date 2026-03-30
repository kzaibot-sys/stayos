import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, Mail, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingActions } from "@/components/dashboard/booking-actions"
import { PaymentForm } from "@/components/dashboard/payment-form"
import { RefundButton } from "@/components/dashboard/refund-button"
import { InternalNotes } from "@/components/dashboard/internal-notes"

const bookingStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Ожидает", className: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Подтверждена", className: "bg-[#1b4332]/10 text-[#1b4332]" },
  CHECKED_IN: { label: "Заселён", className: "bg-green-100 text-green-700" },
  CHECKED_OUT: { label: "Выселился", className: "bg-muted text-foreground" },
  CANCELLED: { label: "Отменена", className: "bg-red-100 text-red-700" },
  NO_SHOW: { label: "Не приехал", className: "bg-orange-100 text-orange-700" },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  UNPAID: { label: "Не оплачено", className: "bg-red-100 text-red-700" },
  PARTIAL: { label: "Частично", className: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Оплачено", className: "bg-green-100 text-green-700" },
  REFUNDED: { label: "Возврат", className: "bg-muted text-foreground" },
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

  // Check if email is configured (server-side env check)
  const emailConfigured = !!process.env.RESEND_API_KEY

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
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {booking.bookingNumber}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {sourceLabels[booking.source] ?? booking.source}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Создана {formatDateTime(booking.createdAt)}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking info card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Информация о брони</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Guest info */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Гость
                </h3>
                <p className="font-medium text-foreground text-lg">
                  {booking.guestFirstName} {booking.guestLastName}
                </p>
                {booking.guestEmail && (
                  <p className="text-sm text-muted-foreground mt-1">{booking.guestEmail}</p>
                )}
                {booking.guestPhone && (
                  <p className="text-sm text-muted-foreground">{booking.guestPhone}</p>
                )}
              </div>

              {/* Room info */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Номер
                </h3>
                <p className="font-medium text-foreground">
                  {booking.room.name}
                  {booking.room.roomNumber && (
                    <span className="text-muted-foreground font-normal ml-1 text-sm">
                      #{booking.room.roomNumber}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {roomTypeLabels[booking.room.type] ?? booking.room.type}
                </p>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Даты
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Заезд:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(booking.checkIn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Выезд:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ночей:</span>
                    <span className="font-medium text-foreground">{booking.nights}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Гостей:</span>
                    <span className="font-medium text-foreground">
                      {booking.adults} взр.{booking.children > 0 ? `, ${booking.children} дет.` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price per night */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Тариф
                </h3>
                <p className="font-medium text-foreground">
                  {formatPrice(booking.pricePerNight)} / ночь
                </p>
                {booking.discount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Скидка: {formatPrice(booking.discount)}
                  </p>
                )}
              </div>
            </div>

            {/* Special requests */}
            {booking.specialRequests && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Особые пожелания
                </h3>
                <p className="text-sm text-foreground">{booking.specialRequests}</p>
              </div>
            )}

            {/* Internal notes — editable */}
            <InternalNotes bookingId={booking.id} initialNotes={booking.internalNotes} />

            {/* Cancel reason */}
            {booking.cancelReason && (
              <div className="mt-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Причина отмены
                </h3>
                <p className="text-sm text-red-600">{booking.cancelReason}</p>
              </div>
            )}
          </div>

          {/* Payments */}
          {booking.payments.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Платежи</h2>
              <div className="space-y-3">
                {booking.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {payment.method}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-medium ${payment.amount < 0 ? "text-red-600" : "text-foreground"}`}>
                        {payment.amount < 0 ? "-" : ""}{formatPrice(Math.abs(payment.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">{payment.status}</p>
                    </div>
                    {payment.amount > 0 && payment.status !== "refunded" && (
                      <RefundButton paymentId={payment.id} maxAmount={payment.amount} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column (1/3 width) */}
        <div className="space-y-6">
          {/* Payment summary card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Оплата</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Итого:</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(booking.totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Оплачено:</span>
                <span className="font-medium text-green-600">
                  {formatPrice(booking.paidAmount)}
                </span>
              </div>
              {remaining > 0 && (
                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Остаток:</span>
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

            {/* Payment form */}
            <PaymentForm
              bookingId={booking.id}
              totalPrice={booking.totalPrice}
              paidAmount={booking.paidAmount}
              paymentStatus={booking.paymentStatus}
              status={booking.status}
            />
          </div>

          {/* Status timeline */}
          {timeline.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">История</h2>
              <div className="relative">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 pl-6 relative">
                      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#1b4332]/10 border-2 border-[#2d6a4f] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{event.label}</p>
                        {event.date && (
                          <p className="text-xs text-muted-foreground">{formatDateTime(event.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Действия</h2>
            <div className="space-y-2">
              <BookingActions
                bookingId={booking.id}
                status={booking.status}
                checkIn={booking.checkIn}
                checkOut={booking.checkOut}
              />
              <a href={`/api/invoices/${booking.id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="w-full">
                  <Printer className="size-4 mr-2" />
                  Печать счёта
                </Button>
              </a>
              {emailConfigured && (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Mail className="size-4 mr-2" />
                  Отправить email повторно
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
