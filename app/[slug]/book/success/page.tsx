import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale/ru"
import {
  CheckCircle2,
  BedDouble,
  CalendarDays,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₸"
}

function formatDate(date: Date): string {
  try {
    return format(date, "d MMMM yyyy", { locale: ru })
  } catch {
    return date.toLocaleDateString()
  }
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ booking?: string }>
}) {
  const { slug } = await params
  const { booking: bookingNumber } = await searchParams

  // Try to fetch the booking if bookingNumber is provided
  let booking = null
  if (bookingNumber) {
    booking = await prisma.booking.findUnique({
      where: { bookingNumber },
      include: {
        room: true,
        hotel: true,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-1.5 font-semibold text-[#1a56db]"
          >
            <BedDouble className="size-5" />
            {booking?.hotel.name ?? "StayOS"}
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="size-20 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Бронирование подтверждено!
            </h1>
            {bookingNumber && (
              <p className="text-2xl font-bold text-[#1a56db]">
                #{bookingNumber}
              </p>
            )}
            <p className="text-gray-500 max-w-md mx-auto">
              Ваше бронирование успешно оформлено. Ждём вас!
            </p>
          </div>

          {booking ? (
            <>
              {/* Booking details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Детали бронирования
                </h2>

                <div className="space-y-4">
                  {/* Room */}
                  <div className="flex items-start gap-3">
                    <BedDouble className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Номер</p>
                      <p className="font-medium text-gray-900">
                        {booking.room.name}
                      </p>
                    </div>
                  </div>

                  {/* Check-in */}
                  <div className="flex items-start gap-3">
                    <CalendarDays className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Заезд</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(booking.checkIn)}
                      </p>
                      <p className="text-sm text-gray-400">
                        с {booking.hotel.checkInTime}
                      </p>
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="flex items-start gap-3">
                    <CalendarDays className="size-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Выезд</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(booking.checkOut)}
                      </p>
                      <p className="text-sm text-gray-400">
                        до {booking.hotel.checkOutTime}
                      </p>
                    </div>
                  </div>

                  {/* Guest */}
                  <div className="flex items-start gap-3">
                    <User className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Гость</p>
                      <p className="font-medium text-gray-900">
                        {booking.guestFirstName} {booking.guestLastName}
                      </p>
                      {booking.guestEmail && (
                        <p className="text-sm text-gray-400">
                          {booking.guestEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Сумма</span>
                    <span className="text-xl font-bold text-[#1a56db]">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-in info */}
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Информация для заезда
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Clock className="size-4 text-[#1a56db] shrink-0" />
                    <span>
                      Заезд с {booking.hotel.checkInTime}, выезд до{" "}
                      {booking.hotel.checkOutTime}
                    </span>
                  </div>
                  {booking.hotel.address && (
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <MapPin className="size-4 text-[#1a56db] shrink-0 mt-0.5" />
                      <span>{booking.hotel.address}</span>
                    </div>
                  )}
                  {booking.hotel.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Phone className="size-4 text-[#1a56db] shrink-0" />
                      <a
                        href={`tel:${booking.hotel.phone}`}
                        className="hover:text-[#1a56db] transition-colors"
                      >
                        {booking.hotel.phone}
                      </a>
                    </div>
                  )}
                  {booking.hotel.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Mail className="size-4 text-[#1a56db] shrink-0" />
                      <a
                        href={`mailto:${booking.hotel.email}`}
                        className="hover:text-[#1a56db] transition-colors"
                      >
                        {booking.hotel.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Generic message if booking not found */
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-2">
              <p className="text-gray-600">
                Ваше бронирование принято. Мы свяжемся с вами для подтверждения.
              </p>
              {bookingNumber && (
                <p className="text-sm text-gray-400">
                  Номер бронирования: {bookingNumber}
                </p>
              )}
            </div>
          )}

          {/* Back to hotel link */}
          <div className="text-center">
            <Link
              href={`/${slug}`}
              className="inline-flex items-center gap-2 text-[#1a56db] hover:underline font-medium"
            >
              ← Вернуться на сайт отеля
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-center gap-2 text-sm text-gray-400">
          <span>Powered by</span>
          <Link
            href="/"
            className="flex items-center gap-1 font-semibold text-[#1a56db] hover:underline"
          >
            <BedDouble className="size-4" />
            StayOS
          </Link>
        </div>
      </footer>
    </div>
  )
}
