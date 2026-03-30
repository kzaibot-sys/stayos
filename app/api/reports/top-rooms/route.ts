import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { subDays, subMonths, subYears } from "date-fns"

function getPeriodStart(period: string): Date {
  const now = new Date()
  if (period === "90d") return subDays(now, 89)
  if (period === "1y") return subYears(now, 1)
  return subDays(now, 29)
}

export async function GET(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") ?? "30d"
  const from = getPeriodStart(period)

  // Get all active rooms
  const rooms = await prisma.room.findMany({
    where: { hotelId, isActive: true },
    select: { id: true, name: true, roomNumber: true, type: true },
  })

  // Get bookings per room in the period
  const bookings = await prisma.booking.findMany({
    where: {
      hotelId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      checkIn: { gte: from },
    },
    select: { roomId: true, totalPrice: true, nights: true },
  })

  const periodDays =
    period === "1y" ? 365 : period === "90d" ? 90 : 30

  const roomStats = rooms.map((room) => {
    const rb = bookings.filter((b) => b.roomId === room.id)
    const revenue = rb.reduce((s, b) => s + b.totalPrice, 0)
    const count = rb.length
    const nightsOccupied = rb.reduce((s, b) => s + b.nights, 0)
    const occupancy = Math.round((nightsOccupied / periodDays) * 100)
    const avgPrice = count > 0 ? Math.round(revenue / count) : 0

    return {
      roomId: room.id,
      roomName: room.name,
      roomNumber: room.roomNumber,
      type: room.type,
      bookings: count,
      revenue,
      occupancy,
      avgPrice,
    }
  })

  // Sort by revenue descending for "top by revenue"
  const byRevenue = [...roomStats].sort((a, b) => b.revenue - a.revenue)
  // Sort by bookings descending for "top by bookings"
  const byBookings = [...roomStats].sort((a, b) => b.bookings - a.bookings)

  return NextResponse.json({ byRevenue, byBookings, period })
}
