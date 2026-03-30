import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { differenceInDays, isWeekend, eachDayOfInterval } from "date-fns"

const bookingSchema = z.object({
  hotelId: z.string(),
  roomId: z.string(),
  checkIn: z.string(), // ISO date
  checkOut: z.string(), // ISO date
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  adults: z.number().min(1).default(2),
  children: z.number().min(0).default(0),
  specialRequests: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = bookingSchema.parse(body)

    const checkIn = new Date(data.checkIn)
    const checkOut = new Date(data.checkOut)

    // Validate dates
    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "Дата выезда должна быть после даты заезда" }, { status: 400 })
    }

    // Check room exists and belongs to hotel
    const room = await prisma.room.findFirst({
      where: { id: data.roomId, hotelId: data.hotelId, isActive: true },
    })
    if (!room) {
      return NextResponse.json({ error: "Номер не найден" }, { status: 404 })
    }

    // Check availability (no overlapping bookings)
    const conflicting = await prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: { not: "CANCELLED" },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    })
    if (conflicting) {
      return NextResponse.json({ error: "Номер занят на выбранные даты" }, { status: 409 })
    }

    // Calculate pricing
    const nights = differenceInDays(checkOut, checkIn)
    const days = eachDayOfInterval({ start: checkIn, end: new Date(checkOut.getTime() - 86400000) })

    let subtotal = 0
    const pricePerNight = room.pricePerNight
    for (const day of days) {
      if (isWeekend(day) && room.weekendPrice) {
        subtotal += room.weekendPrice
      } else {
        subtotal += room.pricePerNight
      }
    }
    const totalPrice = subtotal // No taxes/discount for now

    // Generate booking number
    const year = new Date().getFullYear()
    const count = await prisma.booking.count({ where: { hotelId: data.hotelId } })
    const bookingNumber = `STY-${year}-${String(count + 1).padStart(4, "0")}`

    // Find or create guest
    let guestId: string | undefined
    if (data.guestEmail) {
      let guest = await prisma.guest.findFirst({
        where: { hotelId: data.hotelId, email: data.guestEmail },
      })
      if (!guest) {
        guest = await prisma.guest.create({
          data: {
            hotelId: data.hotelId,
            firstName: data.guestFirstName,
            lastName: data.guestLastName,
            email: data.guestEmail,
            phone: data.guestPhone,
          },
        })
      }
      guestId = guest.id
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        hotelId: data.hotelId,
        roomId: data.roomId,
        guestId,
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        checkIn,
        checkOut,
        nights,
        adults: data.adults,
        children: data.children,
        pricePerNight,
        subtotal,
        totalPrice,
        specialRequests: data.specialRequests,
        source: "DIRECT",
        status: "CONFIRMED",
        paymentStatus: "UNPAID",
      },
      include: { room: true },
    })

    return NextResponse.json(booking)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
