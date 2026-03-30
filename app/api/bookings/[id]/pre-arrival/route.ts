import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  arrivalTime: z.string().optional(),
  transport: z.string().optional(),
  requests: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  if (booking.status === "CANCELLED" || booking.status === "CHECKED_OUT") {
    return NextResponse.json({ error: "Нельзя обновить завершённое бронирование" }, { status: 400 })
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

  const { arrivalTime, transport, requests } = parsed.data

  // Compose internal note
  const parts: string[] = []
  if (arrivalTime) parts.push(`Ожидаемое время прибытия: ${arrivalTime}`)
  if (transport) parts.push(`Транспорт: ${transport}`)
  if (requests) parts.push(`Пожелания: ${requests}`)

  const preArrivalNote = parts.join(" | ")

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      specialRequests: requests || booking.specialRequests,
      internalNotes: preArrivalNote
        ? `[Pre-arrival] ${preArrivalNote}`
        : booking.internalNotes,
    },
  })

  return NextResponse.json({ success: true, booking: updated })
}
