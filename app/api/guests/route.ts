import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
})

export async function GET(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")
  const tags = searchParams.get("tags")
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "20", 10)

  const where: any = { hotelId }

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ]
  }

  if (tags) {
    // Filter by tag - check if tags JSON contains the tag
    where.tags = { contains: tags }
  }

  const skip = (page - 1) * limit

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.guest.count({ where }),
  ])

  const guestsWithStats = guests.map((g) => ({
    ...g,
    tags: JSON.parse(g.tags || "[]"),
    bookingCount: g._count.bookings,
  }))

  return NextResponse.json({ guests: guestsWithStats, total, page, limit })
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

  const parsed = createGuestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  // Check if email already exists for this hotel
  if (data.email) {
    const existing = await prisma.guest.findFirst({
      where: { hotelId, email: data.email },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Гость с таким email уже существует" },
        { status: 409 }
      )
    }
  }

  const guest = await prisma.guest.create({
    data: {
      hotelId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      passportNumber: data.passportNumber ?? null,
      nationality: data.nationality ?? null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      notes: data.notes ?? null,
      tags: JSON.stringify(data.tags ?? []),
    },
  })

  return NextResponse.json(
    { ...guest, tags: JSON.parse(guest.tags || "[]") },
    { status: 201 }
  )
}
