import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { subDays, subMonths, subYears, format, eachDayOfInterval, startOfDay, endOfDay } from "date-fns"

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

  // Get all bookings in the period
  const bookings = await prisma.booking.findMany({
    where: {
      hotelId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      checkIn: { gte: from, lte: to },
    },
    select: {
      checkIn: true,
      totalPrice: true,
    },
  })

  // Group by day
  const days = eachDayOfInterval({ start: from, end: to })
  const dailyData = days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    const dayBookings = bookings.filter(
      (b) => format(b.checkIn, "yyyy-MM-dd") === dateStr
    )
    return {
      date: dateStr,
      revenue: dayBookings.reduce((sum, b) => sum + b.totalPrice, 0),
      bookings: dayBookings.length,
    }
  })

  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0)
  const totalBookings = dailyData.reduce((sum, d) => sum + d.bookings, 0)

  return NextResponse.json({
    data: dailyData,
    total: {
      revenue: totalRevenue,
      bookings: totalBookings,
    },
    period: { from: from.toISOString(), to: to.toISOString() },
  })
}
