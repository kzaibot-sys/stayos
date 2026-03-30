import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { differenceInDays, isWeekend, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { sendBookingConfirmationEmail } from "@/lib/resend"
import { sendTelegramNotification, formatNewBookingMessage } from "@/lib/telegram"
import { canCreateBooking } from "@/lib/plan-limits"

const createBookingSchema = z.object({
  roomId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().optional().nullable(),
  adults: z.number().int().min(1).default(2),
  children: z.number().int().min(0).default(0),
  specialRequests: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  status: z
    .enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"])
    .default("CONFIRMED"),
  paymentStatus: z
    .enum(["UNPAID", "PARTIAL", "PAID", "REFUNDED"])
    .default("UNPAID"),
  source: z
    .enum(["DIRECT", "WIDGET", "MANUAL", "BOOKING_COM", "AIRBNB", "OTHER"])
    .default("MANUAL"),
  priceOverride: z.number().optional().nullable(),
})

export async function GET(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const roomId = searchParams.get("roomId")
  const source = searchParams.get("source")
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "20", 10)

  const where: any = { hotelId }

  if (status && status !== "ALL") {
    where.status = status
  }
  if (roomId) {
    where.roomId = roomId
  }
  if (source && source !== "ALL") {
    where.source = source
  }
  if (dateFrom || dateTo) {
    where.checkIn = {}
    if (dateFrom) where.checkIn.gte = new Date(dateFrom)
    if (dateTo) where.checkIn.lte = new Date(dateTo)
  }

  const skip = (page - 1) * limit

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        room: { select: { id: true, name: true, roomNumber: true, type: true } },
        guest: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { checkIn: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ])

  return NextResponse.json({ bookings, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data
  const checkIn = new Date(data.checkIn)
  const checkOut = new Date(data.checkOut)

  // Check plan limits for booking creation
  const hotelData = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { plan: true },
  })

  const currentDate = new Date()
  const thisMonthBookings = await prisma.booking.count({
    where: {
      hotelId,
      createdAt: {
        gte: startOfMonth(currentDate),
        lte: endOfMonth(currentDate),
      },
    },
  })

  if (!canCreateBooking(hotelData?.plan || 'FREE', thisMonthBookings)) {
    return NextResponse.json(
      { error: "Достигнут лимит бронирований для вашего тарифа" },
      { status: 403 }
    )
  }

  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: "Дата выезда должна быть после даты заезда" },
      { status: 400 }
    )
  }

  // Check room exists and belongs to hotel
  const room = await prisma.room.findFirst({
    where: { id: data.roomId, hotelId, isActive: true },
  })
  if (!room) {
    return NextResponse.json({ error: "Номер не найден" }, { status: 404 })
  }

  // Check availability
  const conflicting = await prisma.booking.findFirst({
    where: {
      roomId: data.roomId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  })
  if (conflicting) {
    return NextResponse.json({ error: "Номер занят на выбранные даты" }, { status: 409 })
  }

  // Find applicable rate plan (active plan covering the booking date range)
  const applicableRatePlan = await prisma.ratePlan.findFirst({
    where: {
      hotelId,
      isActive: true,
      dateFrom: { lte: checkOut },
      dateTo: { gte: checkIn },
    },
    orderBy: { createdAt: "desc" },
  })

  // Calculate pricing
  const nights = differenceInDays(checkOut, checkIn)
  const days = eachDayOfInterval({ start: checkIn, end: new Date(checkOut.getTime() - 86400000) })

  let subtotal = 0
  const basePrice = data.priceOverride ?? room.pricePerNight
  const multiplier = applicableRatePlan ? applicableRatePlan.multiplier : 1.0

  for (const day of days) {
    let dayPrice: number
    if (isWeekend(day) && room.weekendPrice && !data.priceOverride) {
      dayPrice = room.weekendPrice
    } else {
      dayPrice = basePrice
    }
    subtotal += dayPrice * multiplier
  }
  const pricePerNight = basePrice * multiplier
  const totalPrice = subtotal

  // Generate booking number
  const year = new Date().getFullYear()
  const count = await prisma.booking.count({ where: { hotelId } })
  const bookingNumber = `STY-${year}-${String(count + 1).padStart(4, "0")}`

  // Find or create guest
  let guestId: string | undefined
  if (data.guestEmail) {
    let guest = await prisma.guest.findFirst({
      where: { hotelId, email: data.guestEmail },
    })
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          hotelId,
          firstName: data.guestFirstName,
          lastName: data.guestLastName,
          email: data.guestEmail,
          phone: data.guestPhone ?? null,
        },
      })
    }
    guestId = guest.id
  }

  // Status timestamps
  const now = new Date()
  const statusTimestamps: any = {}
  if (data.status === "CHECKED_IN") statusTimestamps.checkedInAt = now
  if (data.status === "CHECKED_OUT") {
    statusTimestamps.checkedInAt = now
    statusTimestamps.checkedOutAt = now
  }
  if (data.status === "CANCELLED") statusTimestamps.cancelledAt = now

  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      hotelId,
      roomId: data.roomId,
      guestId: guestId ?? null,
      guestFirstName: data.guestFirstName,
      guestLastName: data.guestLastName,
      guestEmail: data.guestEmail ?? null,
      guestPhone: data.guestPhone ?? null,
      checkIn,
      checkOut,
      nights,
      adults: data.adults,
      children: data.children,
      status: data.status,
      paymentStatus: data.paymentStatus,
      source: data.source,
      pricePerNight,
      subtotal,
      totalPrice,
      specialRequests: data.specialRequests ?? null,
      internalNotes: data.internalNotes ?? null,
      ratePlanId: applicableRatePlan?.id ?? null,
      ...statusTimestamps,
    },
    include: {
      room: { select: { id: true, name: true, roomNumber: true, type: true } },
      guest: true,
    },
  })

  // Send notifications (non-blocking)
  prisma.hotel.findUnique({
    where: { id: hotelId },
    select: {
      telegramBotToken: true,
      telegramChatId: true,
      name: true,
      address: true,
      phone: true,
      checkInTime: true,
    },
  }).then((hotel) => {
    if (!hotel) return

    // Send Telegram notification
    if (hotel.telegramBotToken && hotel.telegramChatId) {
      const message = formatNewBookingMessage({
        bookingNumber: booking.bookingNumber,
        guestFirstName: booking.guestFirstName,
        guestLastName: booking.guestLastName,
        guestPhone: booking.guestPhone,
        room: { name: booking.room.name },
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
      })
      sendTelegramNotification(hotel.telegramBotToken, hotel.telegramChatId, message).catch((err) => {
        console.error('[Telegram] Failed to send booking notification:', err)
      })
    }

    // Send email confirmation if guest has email
    if (booking.guestEmail) {
      const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      sendBookingConfirmationEmail(booking.guestEmail, {
        bookingNumber: booking.bookingNumber,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
        hotelName: hotel.name,
        roomName: booking.room.name,
        checkIn: fmt.format(booking.checkIn),
        checkOut: fmt.format(booking.checkOut),
        nights: booking.nights,
        totalPrice: new Intl.NumberFormat('ru-RU').format(booking.totalPrice) + ' ₸',
        hotelAddress: hotel.address || undefined,
        hotelPhone: hotel.phone || undefined,
        checkInTime: hotel.checkInTime,
      }).catch((err) => {
        console.error('[Email] Failed to send booking confirmation:', err)
      })
    }
  }).catch((err) => {
    console.error('[Notifications] Failed to fetch hotel settings:', err)
  })

  return NextResponse.json(booking, { status: 201 })
}
