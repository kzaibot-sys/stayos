import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createSchema = z.object({
  hotelId: z.string(),
  bookingId: z.string().optional().nullable(),
  guestName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get("hotelId")
  const all = searchParams.get("all") // for dashboard

  if (hotelId && !all) {
    // Public: only published
    const reviews = await prisma.review.findMany({
      where: { hotelId, isPublished: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(reviews)
  }

  // Dashboard: all reviews for hotel
  const session = await auth()
  const sessionHotelId = (session?.user as any)?.hotelId
  if (!sessionHotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const reviews = await prisma.review.findMany({
    where: { hotelId: sessionHotelId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reviews)
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data

  // Verify hotel exists
  const hotel = await prisma.hotel.findUnique({ where: { id: data.hotelId } })
  if (!hotel) return NextResponse.json({ error: "Hotel not found" }, { status: 404 })

  const review = await prisma.review.create({
    data: {
      hotelId: data.hotelId,
      bookingId: data.bookingId ?? null,
      guestName: data.guestName,
      rating: data.rating,
      comment: data.comment ?? null,
      isPublished: false,
    },
  })

  return NextResponse.json(review, { status: 201 })
}
