import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const refundSchema = z.object({
  amount: z.number().positive(),
  notes: z.string().optional().nullable(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Verify payment belongs to hotel
  const payment = await prisma.payment.findFirst({
    where: { id, booking: { hotelId } },
    include: { booking: true },
  })

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = refundSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 422 })
  }

  const { amount, notes } = parsed.data

  if (amount > payment.amount) {
    return NextResponse.json({ error: "Сумма возврата не может превышать сумму платежа" }, { status: 400 })
  }

  // Create refund record (negative amount)
  const refund = await prisma.payment.create({
    data: {
      bookingId: payment.bookingId,
      amount: -amount,
      currency: payment.currency,
      method: payment.method,
      status: "refunded",
      notes: notes ?? `Возврат по платежу #${payment.id.slice(-6)}`,
    },
  })

  // Update booking paidAmount and paymentStatus
  const booking = payment.booking
  const newPaidAmount = Math.max(0, booking.paidAmount - amount)
  let paymentStatus: string = "UNPAID"

  if (newPaidAmount >= booking.totalPrice) {
    paymentStatus = "PAID"
  } else if (newPaidAmount > 0) {
    paymentStatus = "PARTIAL"
  } else {
    paymentStatus = "REFUNDED"
  }

  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: {
      paidAmount: newPaidAmount,
      paymentStatus: paymentStatus as any,
    },
  })

  return NextResponse.json(refund, { status: 201 })
}
