import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      address: true,
      city: true,
      country: true,
      phone: true,
      email: true,
      website: true,
      checkInTime: true,
      checkOutTime: true,
      currency: true,
      timezone: true,
      language: true,
      amenities: true,
      plan: true,
      stripeCustomerId: true,
      stripeSubId: true,
      planExpiresAt: true,
      telegramBotToken: true,
      telegramChatId: true,
      prepaymentPercent: true,
    },
  })

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...hotel,
    amenities: (() => {
      try {
        return JSON.parse(hotel.amenities || '[]')
      } catch {
        return []
      }
    })(),
  })
}

const hotelUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens").optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().optional().nullable(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  prepaymentPercent: z.number().int().min(0).max(100).optional(),
})

export async function PUT(req: Request) {
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

  const parsed = hotelUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  // Check slug uniqueness if slug is being updated
  if (data.slug) {
    const existing = await prisma.hotel.findFirst({
      where: { slug: data.slug, id: { not: hotelId } },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Этот URL уже занят другим отелем" },
        { status: 409 }
      )
    }
  }

  const updateData: any = { ...data }
  if (data.amenities !== undefined) {
    updateData.amenities = JSON.stringify(data.amenities)
  }

  const hotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: updateData,
  })

  return NextResponse.json({
    ...hotel,
    amenities: (() => {
      try {
        return JSON.parse(hotel.amenities || '[]')
      } catch {
        return []
      }
    })(),
  })
}
