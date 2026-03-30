import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")
  const plan = searchParams.get("plan")
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "20", 10)

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { owner: { email: { contains: search, mode: "insensitive" } } },
    ]
  }

  if (plan) {
    where.plan = plan
  }

  const skip = (page - 1) * limit

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      include: {
        owner: { select: { email: true, name: true } },
        _count: { select: { rooms: true, bookings: true, guests: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.hotel.count({ where }),
  ])

  const result = hotels.map((h) => ({
    id: h.id,
    name: h.name,
    slug: h.slug,
    plan: h.plan,
    ownerEmail: h.owner.email,
    ownerName: h.owner.name,
    roomsCount: h._count.rooms,
    bookingsCount: h._count.bookings,
    guestsCount: h._count.guests,
    currency: h.currency,
    country: h.country,
    createdAt: h.createdAt,
  }))

  return NextResponse.json({ hotels: result, total, page, limit })
}
