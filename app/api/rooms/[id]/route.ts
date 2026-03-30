import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const roomUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  roomNumber: z.string().optional().nullable(),
  type: z
    .enum(["STANDARD", "DELUXE", "SUITE", "APARTMENT", "DORMITORY", "VILLA"])
    .optional(),
  floor: z.number().int().optional().nullable(),
  capacity: z.number().int().min(1).optional(),
  bedCount: z.number().int().min(1).optional(),
  bedType: z.string().optional().nullable(),
  pricePerNight: z.number().min(0).optional(),
  weekendPrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  status: z
    .enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE", "BLOCKED"])
    .optional(),
})

async function getVerifiedRoom(id: string, hotelId: string) {
  return prisma.room.findFirst({
    where: { id, hotelId },
  })
}

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
  const room = await getVerifiedRoom(id, hotelId)

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...room,
    amenities: (() => {
      try {
        return JSON.parse(room.amenities || "[]")
      } catch {
        return []
      }
    })(),
    photos: (() => {
      try {
        return JSON.parse(room.photos || "[]")
      } catch {
        return []
      }
    })(),
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
  const existing = await getVerifiedRoom(id, hotelId)

  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = roomUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber
  if (data.type !== undefined) updateData.type = data.type
  if (data.floor !== undefined) updateData.floor = data.floor
  if (data.capacity !== undefined) updateData.capacity = data.capacity
  if (data.bedCount !== undefined) updateData.bedCount = data.bedCount
  if (data.bedType !== undefined) updateData.bedType = data.bedType
  if (data.pricePerNight !== undefined)
    updateData.pricePerNight = data.pricePerNight
  if (data.weekendPrice !== undefined)
    updateData.weekendPrice = data.weekendPrice
  if (data.description !== undefined) updateData.description = data.description
  if (data.amenities !== undefined)
    updateData.amenities = JSON.stringify(data.amenities)
  if (data.photos !== undefined)
    updateData.photos = JSON.stringify(data.photos)
  if (data.status !== undefined) updateData.status = data.status

  const room = await prisma.room.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({
    ...room,
    amenities: (() => {
      try {
        return JSON.parse(room.amenities || "[]")
      } catch {
        return []
      }
    })(),
    photos: (() => {
      try {
        return JSON.parse(room.photos || "[]")
      } catch {
        return []
      }
    })(),
  })
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
  const room = await getVerifiedRoom(id, hotelId)

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  // Check if room has any bookings
  const bookingCount = await prisma.booking.count({
    where: { roomId: id },
  })

  if (bookingCount > 0) {
    // Soft delete: set isActive = false
    await prisma.room.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ deleted: false, deactivated: true })
  }

  // Hard delete if no bookings
  await prisma.room.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
