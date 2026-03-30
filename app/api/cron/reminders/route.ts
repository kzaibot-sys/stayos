import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendReminderEmail } from "@/lib/resend"
import { addDays, startOfDay, endOfDay } from "date-fns"

export async function GET(req: Request) {
  // Optional bearer token protection for cron services
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tomorrow = addDays(new Date(), 1)
  const tomorrowStart = startOfDay(tomorrow)
  const tomorrowEnd = endOfDay(tomorrow)

  // Find all CONFIRMED bookings where checkIn is tomorrow
  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkIn: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
      guestEmail: { not: null },
    },
    include: {
      room: { select: { name: true } },
      hotel: {
        select: {
          name: true,
          address: true,
          phone: true,
          checkInTime: true,
        },
      },
    },
  })

  let sent = 0
  const errors: string[] = []

  for (const booking of bookings) {
    if (!booking.guestEmail) continue

    try {
      const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      await sendReminderEmail(booking.guestEmail, {
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
        hotelName: booking.hotel.name,
        roomName: booking.room.name,
        checkIn: fmt.format(booking.checkIn),
        checkInTime: booking.hotel.checkInTime,
        hotelAddress: booking.hotel.address || undefined,
        hotelPhone: booking.hotel.phone || undefined,
      })
      sent++
    } catch (err) {
      errors.push(`Booking ${booking.bookingNumber}: ${err}`)
    }
  }

  return NextResponse.json({
    success: true,
    total: bookings.length,
    sent,
    errors,
  })
}
