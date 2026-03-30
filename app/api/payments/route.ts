import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createPaymentSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
  method: z.enum(["STRIPE", "KASPI", "CASH", "BANK_TRANSFER", "OTHER"]).default("CASH"),
  notes: z.string().optional().nullable(),
})

export async function GET(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const method = searchParams.get("method")
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "20", 10)

  const where: any = {
    booking: { hotelId },
  }

  if (method && method !== "ALL") {
    where.method = method
  }
  if (status && status !== "ALL") {
    where.status = status
  }
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const skip = (page - 1) * limit

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ])

  return NextResponse.json({ payments, total, page, limit })
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

  const parsed = createPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  // Verify booking belongs to hotel
  const booking = await prisma.booking.findFirst({
    where: { id: data.bookingId, hotelId },
  })

  if (!booking) {
    return NextResponse.json({ error: "Бронь не найдена" }, { status: 404 })
  }

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      method: data.method,
      status: "succeeded",
      notes: data.notes ?? null,
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingNumber: true,
          guestFirstName: true,
          guestLastName: true,
        },
      },
    },
  })

  // Update booking paidAmount
  const newPaidAmount = booking.paidAmount + data.amount
  let paymentStatus: string = booking.paymentStatus

  if (newPaidAmount >= booking.totalPrice) {
    paymentStatus = "PAID"
  } else if (newPaidAmount > 0) {
    paymentStatus = "PARTIAL"
  }

  await prisma.booking.update({
    where: { id: data.bookingId },
    data: {
      paidAmount: newPaidAmount,
      paymentStatus: paymentStatus as any,
    },
  })

  return NextResponse.json(payment, { status: 201 })
}
