import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

  // Recent stats - last 30 days
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

  // Plan distribution
  const planDistribution = await prisma.hotel.groupBy({
    by: ["plan"],
    _count: { plan: true },
  })

  return NextResponse.json({
    totalHotels,
    totalUsers,
    totalBookings,
    totalRevenue,
    newHotels30d,
    newBookings30d,
    revenue30d: revenue30d._sum.totalPrice ?? 0,
    planDistribution: planDistribution.map((p) => ({
      plan: p.plan,
      count: p._count.plan,
    })),
  })
}
