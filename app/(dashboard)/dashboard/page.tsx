import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { startOfDay, endOfDay, subDays } from "date-fns"
import { ru } from "date-fns/locale"
import { format } from "date-fns"
import {
  CalendarCheck,
  LogOut,
  Percent,
  Banknote,
  Plus,
  AlertTriangle,
  BedDouble,
  Settings,
  ArrowRight,
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    redirect("/login")
  }

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { name: true, address: true, phone: true },
  })

  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  const yesterdayStart = startOfDay(subDays(today, 1))
  const yesterdayEnd = endOfDay(subDays(today, 1))

  // ── Today's stats ───────────────────────────────────────────────────────
  const checkInsToday = await prisma.booking.count({
    where: {
      hotelId,
      checkIn: { gte: todayStart, lte: todayEnd },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
  })

  const checkOutsToday = await prisma.booking.count({
    where: {
      hotelId,
      checkOut: { gte: todayStart, lte: todayEnd },
      status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
    },
  })

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

  const paymentsToday = await prisma.payment.findMany({
    where: {
      createdAt: { gte: todayStart, lte: todayEnd },
      booking: { hotelId },
    },
    select: { amount: true },
  })
  const revenueToday = paymentsToday.reduce((sum, p) => sum + p.amount, 0)

  // ── Yesterday's stats for trends ────────────────────────────────────────
  const checkInsYesterday = await prisma.booking.count({
    where: {
      hotelId,
      checkIn: { gte: yesterdayStart, lte: yesterdayEnd },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
  })

  const checkOutsYesterday = await prisma.booking.count({
    where: {
      hotelId,
      checkOut: { gte: yesterdayStart, lte: yesterdayEnd },
      status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
    },
  })

  const paymentsYesterday = await prisma.payment.findMany({
    where: {
      createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      booking: { hotelId },
    },
    select: { amount: true },
  })
  const revenueYesterday = paymentsYesterday.reduce((sum, p) => sum + p.amount, 0)

  function calcTrend(today: number, yesterday: number): number {
    if (yesterday === 0) return today > 0 ? 100 : 0
    return Math.round(((today - yesterday) / yesterday) * 100)
  }

  // ── Today's check-ins list ──────────────────────────────────────────────
  const checkInsList = await prisma.booking.findMany({
    where: {
      hotelId,
      checkIn: { gte: todayStart, lte: todayEnd },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
    include: { room: { select: { name: true, roomNumber: true } } },
    orderBy: { checkIn: "asc" },
    take: 10,
  })

  const checkOutsList = await prisma.booking.findMany({
    where: {
      hotelId,
      checkOut: { gte: todayStart, lte: todayEnd },
      status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
    },
    include: { room: { select: { name: true, roomNumber: true } } },
    orderBy: { checkOut: "asc" },
    take: 10,
  })

  // ── No-show detection ────────────────────────────────────────────────────
  const overdueCheckIns = await prisma.booking.count({
    where: {
      hotelId,
      status: "CONFIRMED",
      checkIn: { lt: todayStart },
    },
  })

  // ── Onboarding checks ────────────────────────────────────────────────────
  const totalBookings = await prisma.booking.count({ where: { hotelId } })
  const isNewHotel = totalActiveRooms === 0 && totalBookings === 0
  const hasRooms = totalActiveRooms > 0
  const hasProfile = !!(hotel?.address || hotel?.phone)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ru-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-2">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Панель управления
        </h1>
        {hotel && (
          <p className="text-sm text-muted-foreground mt-0.5">{hotel.name}</p>
        )}
      </div>

      {/* Onboarding banner for new hotels */}
      {isNewHotel && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Добро пожаловать в StayOS!
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Давайте настроим ваш отель за три шага.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: 1,
                done: hasProfile,
                label: "Заполните профиль отеля",
                href: "/dashboard/settings",
              },
              {
                step: 2,
                done: hasRooms,
                label: "Добавьте номера",
                href: "/dashboard/rooms/new",
              },
              {
                step: 3,
                done: totalBookings > 0,
                label: "Получите первую бронь",
                href: "/dashboard/bookings/new",
              },
            ].map(({ step, done, label, href }) => (
              <Link
                key={step}
                href={href}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-sm ${
                  done
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    done
                      ? "bg-green-500 text-white"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {done ? "✓" : step}
                </div>
                <span className={`text-sm font-medium ${done ? "text-green-700 line-through" : "text-gray-800"}`}>
                  {label}
                </span>
                {!done && <ArrowRight className="size-4 text-gray-400 ml-auto shrink-0" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No-show warning */}
      {overdueCheckIns > 0 && (
        <Link
          href="/dashboard/bookings?status=CONFIRMED"
          className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 hover:bg-orange-100 transition-colors"
        >
          <AlertTriangle className="size-5 text-orange-500 shrink-0" />
          <span className="text-sm font-medium text-orange-800">
            {overdueCheckIns}{" "}
            {overdueCheckIns === 1
              ? "бронирование с просроченным заездом"
              : overdueCheckIns < 5
              ? "бронирования с просроченным заездом"
              : "бронирований с просроченным заездом"}
            — проверьте статусы
          </span>
          <ArrowRight className="size-4 text-orange-500 ml-auto shrink-0" />
        </Link>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Быстрые действия
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/bookings/new"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Plus className="size-4" />
            Новая бронь
          </Link>
          <Link
            href="/dashboard/rooms/new"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BedDouble className="size-4" />
            Новый номер
          </Link>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="size-4" />
            Настройки
          </Link>
          <Link
            href={`/dashboard/bookings?checkIn=${today.toISOString().split("T")[0]}`}
            className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            <CalendarCheck className="size-4" />
            Заезды сегодня
            {checkInsToday > 0 && (
              <span className="ml-1 inline-flex items-center justify-center size-5 rounded-full bg-green-600 text-white text-xs font-bold">
                {checkInsToday}
              </span>
            )}
          </Link>
          <Link
            href={`/dashboard/bookings?checkOut=${today.toISOString().split("T")[0]}`}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <LogOut className="size-4" />
            Выезды сегодня
            {checkOutsToday > 0 && (
              <span className="ml-1 inline-flex items-center justify-center size-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                {checkOutsToday}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Заездов сегодня"
          value={checkInsToday}
          icon={CalendarCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          trend={{ value: calcTrend(checkInsToday, checkInsYesterday), label: "вчера" }}
        />
        <StatsCard
          title="Выездов сегодня"
          value={checkOutsToday}
          icon={LogOut}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
          trend={{ value: calcTrend(checkOutsToday, checkOutsYesterday), label: "вчера" }}
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
          trend={{ value: calcTrend(revenueToday, revenueYesterday), label: "вчера" }}
        />
      </div>

      {/* Today's check-ins and check-outs */}
      {(checkInsList.length > 0 || checkOutsList.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-ins */}
          {checkInsList.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarCheck className="size-4 text-blue-600" />
                  Заезды сегодня
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                  {checkInsList.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {checkInsList.map((b) => (
                  <li key={b.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {b.guestFirstName} {b.guestLastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.room.name}
                        {b.room.roomNumber ? ` #${b.room.roomNumber}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="text-xs text-blue-600 hover:underline font-medium shrink-0"
                    >
                      Открыть →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Check-outs */}
          {checkOutsList.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <LogOut className="size-4 text-orange-500" />
                  Выезды сегодня
                </h3>
                <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">
                  {checkOutsList.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {checkOutsList.map((b) => (
                  <li key={b.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {b.guestFirstName} {b.guestLastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.room.name}
                        {b.room.roomNumber ? ` #${b.room.roomNumber}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="text-xs text-blue-600 hover:underline font-medium shrink-0"
                    >
                      Открыть →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recent bookings */}
      <RecentBookings hotelId={hotelId} />
    </div>
  )
}
