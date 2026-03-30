import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  cancelReason: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { hotel: true },
  })

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Бронирование уже отменено" }, { status: 400 })
  }

  if (booking.status === "CHECKED_IN" || booking.status === "CHECKED_OUT") {
    return NextResponse.json({ error: "Нельзя отменить активное бронирование" }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error" }, { status: 422 })
  }

  const { cancelReason } = parsed.data

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelReason: cancelReason || "Отменено гостем",
    },
  })

  return NextResponse.json({ success: true, booking: updated })
}
