import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { GuestPreArrivalForm } from "./guest-pre-arrival-form"
import Link from "next/link"
import { BedDouble, CalendarDays, User, MapPin } from "lucide-react"

function formatDate(d: Date) {
  return format(d, "d MMMM yyyy", { locale: ru })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₸"
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Ожидает подтверждения", color: "text-yellow-700 bg-yellow-100" },
  CONFIRMED: { label: "Подтверждена", color: "text-blue-700 bg-blue-100" },
  CHECKED_IN: { label: "Заселён", color: "text-green-700 bg-green-100" },
  CHECKED_OUT: { label: "Выселился", color: "text-gray-700 bg-gray-100" },
  CANCELLED: { label: "Отменена", color: "text-red-700 bg-red-100" },
  NO_SHOW: { label: "Не приехал", color: "text-orange-700 bg-orange-100" },
}

export default async function GuestBookingPage({
  params,
}: {
  params: Promise<{ slug: string; bookingNumber: string }>
}) {
  const { slug, bookingNumber } = await params

  const hotel = await prisma.hotel.findUnique({ where: { slug } })
  if (!hotel) notFound()

  const booking = await prisma.booking.findFirst({
    where: { bookingNumber, hotelId: hotel.id },
    include: { room: true },
  })

  if (!booking) notFound()

  const nights = booking.nights
  const statusCfg = statusLabels[booking.status] ?? statusLabels["PENDING"]
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED"

  // Check cancellation window
  const now = new Date()
  const checkInTime = new Date(booking.checkIn)
  const hoursUntilCheckIn = (checkInTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  const withinFreeCancellation = hoursUntilCheckIn >= hotel.cancellationHours

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <BedDouble className="size-5 text-[#1a56db]" />
          <span className="font-semibold text-gray-900">{hotel.name}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ваше бронирование</h1>
          <p className="text-gray-500 mt-1">#{booking.bookingNumber}</p>
        </div>

        {/* Status */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusCfg.color}`}>
          {statusCfg.label}
        </span>

        {/* Booking Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Детали бронирования</h2>

          <div className="flex items-start gap-3">
            <User className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Гость</p>
              <p className="font-medium">{booking.guestFirstName} {booking.guestLastName}</p>
              {booking.guestEmail && <p className="text-sm text-gray-500">{booking.guestEmail}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BedDouble className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Номер</p>
              <p className="font-medium">{booking.room.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Даты</p>
              <p className="font-medium">{formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}</p>
              <p className="text-sm text-gray-500">{nights} {nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"}</p>
            </div>
          </div>

          {hotel.address && (
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Адрес</p>
                <p className="font-medium">{hotel.address}</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{formatPrice(booking.pricePerNight)} × {nights} ноч.</span>
              <span>{formatPrice(booking.subtotal)}</span>
            </div>
            {booking.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Скидка</span>
                <span className="text-red-600">-{formatPrice(booking.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-1">
              <span>Итого</span>
              <span className="text-[#1a56db]">{formatPrice(booking.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-medium text-amber-800 mb-1">Политика отмены</p>
          <p className="text-amber-700">
            Бесплатная отмена до {hotel.cancellationHours} ч. до заезда.
            {hotel.cancellationPenalty > 0 && ` При поздней отмене взимается штраф ${hotel.cancellationPenalty}% от стоимости.`}
          </p>
        </div>

        {/* Pre-arrival form */}
        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
          <GuestPreArrivalForm
            bookingId={booking.id}
            bookingNumber={booking.bookingNumber}
            canCancel={canCancel}
            withinFreeCancellation={withinFreeCancellation}
            cancellationPenalty={hotel.cancellationPenalty}
            hotelSlug={slug}
          />
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-center gap-2 text-sm text-gray-400">
          <span>Powered by</span>
          <Link href="/" className="flex items-center gap-1 font-semibold text-[#1a56db] hover:underline">
            <BedDouble className="size-4" />
            StayOS
          </Link>
        </div>
      </footer>
    </div>
  )
}
