import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { subDays, subYears, format, eachDayOfInterval, startOfDay, endOfDay } from "date-fns"

function getPeriodDates(period: string, dateFrom?: string | null, dateTo?: string | null) {
  const now = new Date()
  let from: Date
  let to: Date = now

  if (period === "custom" && dateFrom && dateTo) {
    from = new Date(dateFrom)
    to = new Date(dateTo)
  } else if (period === "7d") {
    from = subDays(now, 6)
  } else if (period === "30d") {
    from = subDays(now, 29)
  } else if (period === "90d") {
    from = subDays(now, 89)
  } else if (period === "1y") {
    from = subYears(now, 1)
  } else {
    from = subDays(now, 29)
  }

  return { from: startOfDay(from), to: endOfDay(to) }
}

export async function GET(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") ?? "30d"
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  const { from, to } = getPeriodDates(period, dateFrom, dateTo)

  // Get total active rooms
  const totalRooms = await prisma.room.count({
    where: { hotelId, isActive: true },
  })

  if (totalRooms === 0) {
    return NextResponse.json({ data: [], period: { from: from.toISOString(), to: to.toISOString() } })
  }

  // Get all bookings that overlap with the period
  const bookings = await prisma.booking.findMany({
    where: {
      hotelId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      checkIn: { lt: to },
      checkOut: { gt: from },
    },
    select: {
      checkIn: true,
      checkOut: true,
    },
  })

  // For each day, count how many bookings overlap
  const days = eachDayOfInterval({ start: from, end: to })
  const dailyData = days.map((day) => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)

    const occupiedRooms = bookings.filter(
      (b) => b.checkIn < dayEnd && b.checkOut > dayStart
    ).length

    const occupancyPercent =
      totalRooms > 0
        ? Math.round((occupiedRooms / totalRooms) * 100)
        : 0

    return {
      date: format(day, "yyyy-MM-dd"),
      occupancy: occupancyPercent,
      rooms_occupied: occupiedRooms,
      rooms_total: totalRooms,
    }
  })

  return NextResponse.json({
    data: dailyData,
    period: { from: from.toISOString(), to: to.toISOString() },
  })
}
