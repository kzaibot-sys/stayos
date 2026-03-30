import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, Plus, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GuestProfileClient } from "@/components/dashboard/guest-profile-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function GuestProfilePage({ params }: Props) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    redirect("/login")
  }

  const { id } = await params

  const guest = await prisma.guest.findFirst({
    where: { id, hotelId },
    include: {
      bookings: {
        include: {
          room: { select: { id: true, name: true, roomNumber: true, type: true } },
        },
        orderBy: { checkIn: "desc" },
        take: 10,
      },
    },
  })

  if (!guest) {
    notFound()
  }

  const tags = JSON.parse(guest.tags || "[]") as string[]

  // Compute stats
  const completedBookings = guest.bookings.filter(
    (b) => b.status === "CHECKED_OUT"
  )
  const totalSpent = guest.totalSpent
  const totalVisits = guest.totalVisits
  const avgCheck = totalVisits > 0 ? totalSpent / totalVisits : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/guests">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-1" />
            Назад
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {guest.firstName} {guest.lastName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Профиль гостя
          </p>
        </div>
        <Link href={`/dashboard/bookings/new?guestId=${guest.id}`}>
          <Button>
            <Plus className="size-4 mr-2" />
            Создать бронь
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Guest info */}
        <div className="lg:col-span-1 space-y-6">
          <GuestProfileClient
            guest={{
              id: guest.id,
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
              phone: guest.phone,
              passportNumber: guest.passportNumber,
              nationality: guest.nationality,
              birthDate: guest.birthDate ? guest.birthDate.toISOString() : null,
              notes: guest.notes,
              tags,
            }}
          />
        </div>

        {/* Right: Stats + Booking history */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Всего визитов</p>
              <p className="text-2xl font-bold text-foreground">{totalVisits}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Итого потрачено</p>
              <p className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(totalSpent)} ₸
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Средний чек</p>
              <p className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(avgCheck)} ₸
              </p>
            </div>
          </div>

          {/* Booking history */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-medium text-foreground">История бронирований</h2>
            </div>
            {guest.bookings.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarDays className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Нет бронирований</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">№ брони</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Номер</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Заезд</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Выезд</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {guest.bookings.map((booking) => {
                      const statusConfig: Record<string, { label: string; className: string }> = {
                        PENDING: { label: "Ожидает", className: "bg-yellow-100 text-yellow-700" },
                        CONFIRMED: { label: "Подтверждена", className: "bg-blue-100 text-blue-700" },
                        CHECKED_IN: { label: "Заселён", className: "bg-green-100 text-green-700" },
                        CHECKED_OUT: { label: "Выселился", className: "bg-gray-100 text-gray-700" },
                        CANCELLED: { label: "Отменена", className: "bg-red-100 text-red-700" },
                        NO_SHOW: { label: "Не приехал", className: "bg-orange-100 text-orange-700" },
                      }
                      const sc = statusConfig[booking.status] ?? statusConfig["PENDING"]

                      return (
                        <tr key={booking.id} className="hover:bg-muted transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              href={`/dashboard/bookings/${booking.id}`}
                              className="font-mono text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              {booking.bookingNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {booking.room.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {format(booking.checkIn, "d MMM yyyy", { locale: ru })}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {format(booking.checkOut, "d MMM yyyy", { locale: ru })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.className}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-foreground whitespace-nowrap">
                            {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(booking.totalPrice)} ₸
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
