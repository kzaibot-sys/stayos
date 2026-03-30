import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AdminDashboardPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  const [totalHotels, totalUsers, totalBookings, revenueResult] =
    await Promise.all([
      prisma.hotel.count(),
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
        },
      }),
    ])

  const totalRevenue = revenueResult._sum.totalPrice ?? 0

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [newHotels30d, newBookings30d, revenue30d] = await Promise.all([
    prisma.hotel.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
      },
    }),
  ])

  const planDistribution = await prisma.hotel.groupBy({
    by: ["plan"],
    _count: { plan: true },
  })

  const recentHotels = await prisma.hotel.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { email: true, name: true } },
      _count: { select: { rooms: true, bookings: true } },
    },
  })

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      hotel: { select: { name: true } },
    },
  })

  const planColors: Record<string, string> = {
    FREE: "bg-muted text-foreground",
    STARTER: "bg-[#2d6a4f]/10 text-[#2d6a4f]",
    PRO: "bg-[#d4a373]/20 text-[#b8884a]",
    ENTERPRISE: "bg-[#1b4332]/10 text-[#1b4332]",
  }

  const stats = [
    {
      label: "Всего отелей",
      value: totalHotels,
      sub: `+${newHotels30d} за 30 дней`,
      color: "border-[#1b4332]",
    },
    {
      label: "Всего пользователей",
      value: totalUsers,
      sub: null,
      color: "border-[#d4a373]",
    },
    {
      label: "Всего бронирований",
      value: totalBookings,
      sub: `+${newBookings30d} за 30 дней`,
      color: "border-[#1b4332]",
    },
    {
      label: "Общий доход",
      value: formatCurrency(totalRevenue),
      sub: `+${formatCurrency(revenue30d._sum.totalPrice ?? 0)} за 30 дней`,
      color: "border-[#d4a373]",
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground,#111)] mb-6">
        Панель управления
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-[var(--color-card,#fff)] rounded-xl border-l-4 ${stat.color} p-5 shadow-sm`}
          >
            <p className="text-sm text-[var(--color-muted-foreground,#6b7280)] mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-[var(--color-foreground,#111)]">
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-xs text-[#1b4332] mt-1 font-medium">
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Plan Distribution */}
      <div className="bg-[var(--color-card,#fff)] rounded-xl p-5 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-foreground,#111)] mb-4">
          Распределение по тарифам
        </h2>
        <div className="flex flex-wrap gap-4">
          {(["FREE", "STARTER", "PRO", "ENTERPRISE"] as const).map((plan) => {
            const found = planDistribution.find((p) => p.plan === plan)
            const count = found?._count.plan ?? 0
            return (
              <div
                key={plan}
                className="flex items-center gap-3 bg-[var(--color-background,#f8f9fa)] rounded-lg px-4 py-3"
              >
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${planColors[plan]}`}
                >
                  {plan}
                </span>
                <span className="text-xl font-bold text-[var(--color-foreground,#111)]">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hotels */}
        <div className="bg-[var(--color-card,#fff)] rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-foreground,#111)] mb-4">
            Последние отели
          </h2>
          <div className="space-y-3">
            {recentHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="flex items-center justify-between py-2 border-b border-[var(--color-border,#e5e7eb)] last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--color-foreground,#111)]">
                    {hotel.name}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground,#6b7280)]">
                    {hotel.owner.email} &middot; {hotel._count.rooms} номеров
                    &middot; {hotel._count.bookings} бронирований
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${planColors[hotel.plan]}`}
                >
                  {hotel.plan}
                </span>
              </div>
            ))}
            {recentHotels.length === 0 && (
              <p className="text-sm text-[var(--color-muted-foreground,#6b7280)]">
                Нет отелей
              </p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-[var(--color-card,#fff)] rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-foreground,#111)] mb-4">
            Последние бронирования
          </h2>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-2 border-b border-[var(--color-border,#e5e7eb)] last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--color-foreground,#111)]">
                    {booking.guestFirstName} {booking.guestLastName}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground,#6b7280)]">
                    {booking.hotel.name} &middot; {booking.bookingNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--color-foreground,#111)]">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground,#6b7280)]">
                    {booking.status}
                  </p>
                </div>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <p className="text-sm text-[var(--color-muted-foreground,#6b7280)]">
                Нет бронирований
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount)
}
