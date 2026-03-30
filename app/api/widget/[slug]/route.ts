import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      address: true,
      city: true,
      phone: true,
      email: true,
      checkInTime: true,
      checkOutTime: true,
      currency: true,
      language: true,
      amenities: true,
      logoUrl: true,
      coverImageUrl: true,
      rooms: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          roomNumber: true,
          type: true,
          capacity: true,
          bedCount: true,
          bedType: true,
          pricePerNight: true,
          weekendPrice: true,
          description: true,
          amenities: true,
          photos: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!hotel) {
    return NextResponse.json(
      { error: "Hotel not found" },
      { status: 404, headers: CORS_HEADERS }
    )
  }

  // Parse JSON fields
  const response = {
    ...hotel,
    amenities: (() => {
      try {
        return JSON.parse(hotel.amenities)
      } catch {
        return []
      }
    })(),
    rooms: hotel.rooms.map((room) => ({
      ...room,
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
    })),
  }

  return NextResponse.json(response, { headers: CORS_HEADERS })
}
