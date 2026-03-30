import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { startOfDay, endOfDay } from "date-fns"
import { CalendarCheck, LogOut, Percent, Banknote } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentBookings } from "@/components/dashboard/recent-bookings"

export default async function DashboardPage() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    redirect("/login")
  }

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { name: true },
  })

  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

  // 1. Заездов сегодня
  const checkInsToday = await prisma.booking.count({
    where: {
      hotelId,
      checkIn: { gte: todayStart, lte: todayEnd },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
  })

  // 2. Выездов сегодня
  const checkOutsToday = await prisma.booking.count({
    where: {
      hotelId,
      checkOut: { gte: todayStart, lte: todayEnd },
      status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
    },
  })

  // 3. Занятость — rooms occupied today / total active rooms
  const totalActiveRooms = await prisma.room.count({
    where: { hotelId, isActive: true },
  })

  const occupiedRooms = await prisma.booking.count({
    where: {
      hotelId,
      checkIn: { lte: todayEnd },
      checkOut: { gte: todayStart },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
  })

  const occupancy =
    totalActiveRooms > 0
      ? Math.round((occupiedRooms / totalActiveRooms) * 100)
      : 0

  // 4. Выручка сегодня — sum of payments created today
  const paymentsToday = await prisma.payment.findMany({
    where: {
      createdAt: { gte: todayStart, lte: todayEnd },
      booking: { hotelId },
    },
    select: { amount: true },
  })

  const revenueToday = paymentsToday.reduce((sum, p) => sum + p.amount, 0)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ru-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Панель управления
        </h1>
        {hotel && (
          <p className="text-sm text-muted-foreground mt-0.5">{hotel.name}</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Заездов сегодня"
          value={checkInsToday}
          icon={CalendarCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Выездов сегодня"
          value={checkOutsToday}
          icon={LogOut}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
        <StatsCard
          title="Занятость"
          value={`${occupancy}%`}
          icon={Percent}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Выручка сегодня"
          value={formatCurrency(revenueToday)}
          icon={Banknote}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Recent bookings */}
      <RecentBookings hotelId={hotelId} />
    </div>
  )
}
