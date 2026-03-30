import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateGuestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const guest = await prisma.guest.findFirst({
    where: { id, hotelId },
    include: {
      bookings: {
        include: {
          room: { select: { id: true, name: true, roomNumber: true, type: true } },
        },
        orderBy: { checkIn: "desc" },
      },
    },
  })

  if (!guest) {
    return NextResponse.json({ error: "Гость не найден" }, { status: 404 })
  }

  return NextResponse.json({
    ...guest,
    tags: JSON.parse(guest.tags || "[]"),
    bookings: guest.bookings,
  })
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

  const existing = await prisma.guest.findFirst({ where: { id, hotelId } })
  if (!existing) {
    return NextResponse.json({ error: "Гость не найден" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateGuestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  const updateData: any = {}
  if (data.firstName !== undefined) updateData.firstName = data.firstName
  if (data.lastName !== undefined) updateData.lastName = data.lastName
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.passportNumber !== undefined) updateData.passportNumber = data.passportNumber
  if (data.nationality !== undefined) updateData.nationality = data.nationality
  if (data.birthDate !== undefined) {
    updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
  }
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)

  const updated = await prisma.guest.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({
    ...updated,
    tags: JSON.parse(updated.tags || "[]"),
  })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const guest = await prisma.guest.findFirst({
    where: { id, hotelId },
    include: { _count: { select: { bookings: true } } },
  })

  if (!guest) {
    return NextResponse.json({ error: "Гость не найден" }, { status: 404 })
  }

  if (guest._count.bookings > 0) {
    return NextResponse.json(
      { error: "Невозможно удалить гостя с бронированиями" },
      { status: 409 }
    )
  }

  await prisma.guest.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
