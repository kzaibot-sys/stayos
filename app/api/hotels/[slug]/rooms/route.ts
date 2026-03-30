import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateDynamicPrice } from "@/lib/dynamic-pricing"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const checkInParam = searchParams.get("checkIn")
  const checkOutParam = searchParams.get("checkOut")

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  // If dates are provided, filter out rooms with overlapping bookings
  let bookedRoomIds: string[] = []
  if (checkInParam && checkOutParam) {
    const checkIn = new Date(checkInParam)
    const checkOut = new Date(checkOutParam)

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        hotelId: hotel.id,
        status: { not: "CANCELLED" },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { roomId: true },
    })

    bookedRoomIds = overlappingBookings.map((b) => b.roomId)
  }

  const rooms = await prisma.room.findMany({
    where: {
      hotelId: hotel.id,
      isActive: true,
      ...(bookedRoomIds.length > 0 ? { id: { notIn: bookedRoomIds } } : {}),
    },
    orderBy: { sortOrder: "asc" },
  })

  // Calculate current occupancy for dynamic pricing
  const totalRooms = await prisma.room.count({
    where: { hotelId: hotel.id, isActive: true },
  })

  const now = new Date()
  const occupiedCount = await prisma.booking.count({
    where: {
      hotelId: hotel.id,
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkIn: { lte: now },
      checkOut: { gte: now },
    },
  })

  const occupancyPercent = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0

  // Parse amenities and photos from JSON strings, apply dynamic pricing
  const parsedRooms = rooms.map((room) => {
    const dynamicPrice = calculateDynamicPrice(room.pricePerNight, occupancyPercent)
    return {
      ...room,
      basePrice: room.pricePerNight,
      dynamicPrice: dynamicPrice !== room.pricePerNight ? dynamicPrice : null,
      amenities: (() => {
        try {
          return JSON.parse(room.amenities)
        } catch {
          return []
        }
      })(),
      photos: (() => {
        try {
          return JSON.parse(room.photos)
        } catch {
          return []
        }
      })(),
    }
  })

  return NextResponse.json(parsedRooms)
}
