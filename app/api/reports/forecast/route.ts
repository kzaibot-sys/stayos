import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addDays, format, startOfDay, endOfDay } from "date-fns"

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = startOfDay(new Date())
  const end = endOfDay(addDays(today, 29))

  // Get total active rooms
  const totalRooms = await prisma.room.count({
    where: { hotelId, isActive: true },
  })

  // Get all confirmed bookings overlapping the next 30 days
  const bookings = await prisma.booking.findMany({
    where: {
      hotelId,
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
      checkIn: { lte: end },
      checkOut: { gte: today },
    },
    select: { checkIn: true, checkOut: true },
  })

  const result = Array.from({ length: 30 }, (_, i) => {
    const day = addDays(today, i)
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)

    const overlapping = bookings.filter(
      (b) => b.checkIn <= dayEnd && b.checkOut > dayStart
    )

    const occupancy =
      totalRooms > 0
        ? Math.round((overlapping.length / totalRooms) * 100)
        : 0

    return {
      date: format(day, "yyyy-MM-dd"),
      occupancy,
      bookings: overlapping.length,
      rooms_total: totalRooms,
    }
  })

  return NextResponse.json({ data: result })
}
