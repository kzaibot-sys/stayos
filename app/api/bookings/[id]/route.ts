import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendTelegramNotification, formatCancelledBookingMessage } from "@/lib/telegram"

const updateBookingSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"])
    .optional(),
  paymentStatus: z
    .enum(["UNPAID", "PARTIAL", "PAID", "REFUNDED"])
    .optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guestFirstName: z.string().min(1).optional(),
  guestLastName: z.string().min(1).optional(),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().optional().nullable(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  specialRequests: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const booking = await prisma.booking.findFirst({
    where: { id, hotelId },
    include: {
      room: true,
      guest: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Бронь не найдена" }, { status: 404 })
  }

  return NextResponse.json(booking)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.booking.findFirst({
    where: { id, hotelId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Бронь не найдена" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data
  const updateData: any = {}

  if (data.status !== undefined) {
    updateData.status = data.status
    const now = new Date()
    if (data.status === "CHECKED_IN") updateData.checkedInAt = now
    if (data.status === "CHECKED_OUT") updateData.checkedOutAt = now
    if (data.status === "CANCELLED") {
      updateData.cancelledAt = now
      if (data.cancelReason) updateData.cancelReason = data.cancelReason
    }
  }

  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus
  if (data.guestFirstName !== undefined) updateData.guestFirstName = data.guestFirstName
  if (data.guestLastName !== undefined) updateData.guestLastName = data.guestLastName
  if (data.guestEmail !== undefined) updateData.guestEmail = data.guestEmail
  if (data.guestPhone !== undefined) updateData.guestPhone = data.guestPhone
  if (data.adults !== undefined) updateData.adults = data.adults
  if (data.children !== undefined) updateData.children = data.children
  if (data.specialRequests !== undefined) updateData.specialRequests = data.specialRequests
  if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes
  if (data.cancelReason !== undefined) updateData.cancelReason = data.cancelReason

  if (data.checkIn !== undefined) updateData.checkIn = new Date(data.checkIn)
  if (data.checkOut !== undefined) updateData.checkOut = new Date(data.checkOut)

  const booking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      room: { select: { id: true, name: true, roomNumber: true, type: true } },
      guest: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  })

  // Send Telegram cancellation notification (non-blocking)
  if (data.status === "CANCELLED") {
    prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { telegramBotToken: true, telegramChatId: true },
    }).then((hotel) => {
      if (hotel?.telegramBotToken && hotel?.telegramChatId) {
        const message = formatCancelledBookingMessage({
          bookingNumber: booking.bookingNumber,
          guestFirstName: booking.guestFirstName,
          guestLastName: booking.guestLastName,
          room: { name: booking.room.name },
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        })
        sendTelegramNotification(hotel.telegramBotToken, hotel.telegramChatId, message).catch((err) => {
          console.error('[Telegram] Failed to send cancellation notification:', err)
        })
      }
    }).catch((err) => {
      console.error('[Telegram] Failed to fetch hotel for notification:', err)
    })
  }

  return NextResponse.json(booking)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.booking.findFirst({
    where: { id, hotelId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Бронь не найдена" }, { status: 404 })
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  })

  return NextResponse.json(booking)
}
