import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"
import { ru } from "date-fns/locale"

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Revenue by payment method
  const payments = await prisma.payment.findMany({
    where: {
      booking: { hotelId },
      status: "paid",
      amount: { gt: 0 },
    },
    select: { method: true, amount: true },
  })

  const byMethod: Record<string, number> = {}
  for (const p of payments) {
    byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount
  }
  const revenueByMethod = Object.entries(byMethod).map(([method, total]) => ({ method, total }))

  // Monthly totals for last 6 months
  const monthlyTotals = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const bookings = await prisma.booking.findMany({
      where: {
        hotelId,
        status: { notIn: ["CANCELLED"] },
        createdAt: { gte: start, lte: end },
      },
      select: { totalPrice: true },
    })

    const revenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0)
    monthlyTotals.push({
      month: format(date, "LLL", { locale: ru }),
      revenue,
      bookings: bookings.length,
    })
  }

  // Top 5 rooms by revenue
  const bookingsByRoom = await prisma.booking.groupBy({
    by: ["roomId"],
    where: { hotelId, status: { notIn: ["CANCELLED"] } },
    _sum: { totalPrice: true },
    _count: { id: true },
    orderBy: { _sum: { totalPrice: "desc" } },
    take: 5,
  })

  const roomIds = bookingsByRoom.map((b) => b.roomId)
  const roomDetails = await prisma.room.findMany({
    where: { id: { in: roomIds } },
    select: { id: true, name: true },
  })
  const roomMap = Object.fromEntries(roomDetails.map((r) => [r.id, r.name]))

  const topRooms = bookingsByRoom.map((b) => ({
    roomId: b.roomId,
    roomName: roomMap[b.roomId] ?? "Удалён",
    revenue: b._sum.totalPrice ?? 0,
    bookings: b._count.id,
  }))

  // Summary totals
  const allBookings = await prisma.booking.findMany({
    where: { hotelId, status: { notIn: ["CANCELLED"] } },
    select: { totalPrice: true },
  })
  const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalPrice, 0)
  const avgCheck = allBookings.length > 0 ? totalRevenue / allBookings.length : 0

  return NextResponse.json({
    summary: {
      totalRevenue,
      avgCheck,
      totalBookings: allBookings.length,
    },
    revenueByMethod,
    monthlyTotals,
    topRooms,
  })
}
