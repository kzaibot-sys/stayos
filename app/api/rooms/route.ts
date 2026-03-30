import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { canAddRoom } from "@/lib/plan-limits"

const roomSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  roomNumber: z.string().optional().nullable(),
  type: z
    .enum(["STANDARD", "DELUXE", "SUITE", "APARTMENT", "DORMITORY", "VILLA"])
    .default("STANDARD"),
  floor: z.number().int().optional().nullable(),
  capacity: z.number().int().min(1).default(2),
  bedCount: z.number().int().min(1).default(1),
  bedType: z.string().optional().nullable(),
  pricePerNight: z.number().min(0),
  weekendPrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  amenities: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]),
  status: z
    .enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE", "BLOCKED"])
    .default("AVAILABLE"),
  minNights: z.number().int().min(1).default(1),
})

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rooms = await prisma.room.findMany({
    where: { hotelId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  const parsed = rooms.map((room) => ({
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
  }))

  return NextResponse.json(parsed)
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

  const parsed = roomSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  // Check plan limits for room creation
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { plan: true },
  })

  const currentRoomCount = await prisma.room.count({
    where: { hotelId, isActive: true },
  })

  if (!canAddRoom(hotel?.plan || 'FREE', currentRoomCount)) {
    return NextResponse.json(
      { error: "Достигнут лимит номеров для вашего тарифа" },
      { status: 403 }
    )
  }

  const room = await prisma.room.create({
    data: {
      hotelId,
      name: data.name,
      roomNumber: data.roomNumber ?? null,
      type: data.type,
      floor: data.floor ?? null,
      capacity: data.capacity,
      bedCount: data.bedCount,
      bedType: data.bedType ?? null,
      pricePerNight: data.pricePerNight,
      weekendPrice: data.weekendPrice ?? null,
      description: data.description ?? null,
      amenities: JSON.stringify(data.amenities),
      photos: JSON.stringify(data.photos),
      status: data.status,
      minNights: data.minNights,
    },
  })

  return NextResponse.json(
    {
      ...room,
      amenities: data.amenities,
      photos: data.photos,
    },
    { status: 201 }
  )
}
