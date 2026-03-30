import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const members = await prisma.hotelMember.findMany({
    where: { hotelId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Also include the owner
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  })

  const ownerEntry = hotel
    ? {
        id: `owner-${hotel.owner.id}`,
        hotelId,
        userId: hotel.owner.id,
        role: 'OWNER' as const,
        user: hotel.owner,
        createdAt: hotel.createdAt,
        isOwner: true,
      }
    : null

  const result = [
    ...(ownerEntry ? [ownerEntry] : []),
    ...members.map((m) => ({ ...m, isOwner: false })),
  ]

  return NextResponse.json(result)
}

const inviteSchema = z.object({
  email: z.string().email("Некорректный email"),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  const userId = (session?.user as any)?.id

  if (!hotelId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only OWNER or ADMIN can invite members
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { ownerId: true },
  })

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  const isOwner = hotel.ownerId === userId
  if (!isOwner) {
    const member = await prisma.hotelMember.findUnique({
      where: { hotelId_userId: { hotelId, userId } },
    })
    if (!member || member.role === 'STAFF') {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { email, role, name } = parsed.data

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    // Create user with temporary password
    const tempPassword = await bcrypt.hash(Math.random().toString(36), 10)
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: tempPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'STAFF',
      },
    })
  }

  // Check if already a member
  const existing = await prisma.hotelMember.findUnique({
    where: { hotelId_userId: { hotelId, userId: user.id } },
  })

  if (existing) {
    return NextResponse.json({ error: "Пользователь уже является членом команды" }, { status: 409 })
  }

  // Check if this user is the owner
  if (user.id === hotel.ownerId) {
    return NextResponse.json({ error: "Владелец уже состоит в команде" }, { status: 409 })
  }

  const member = await prisma.hotelMember.create({
    data: {
      hotelId,
      userId: user.id,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  })

  return NextResponse.json(member, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  const userId = (session?.user as any)?.id

  if (!hotelId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const memberId = searchParams.get('memberId')

  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 })
  }

  // Only OWNER or ADMIN can remove members
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { ownerId: true },
  })

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  const isOwner = hotel.ownerId === userId
  if (!isOwner) {
    const member = await prisma.hotelMember.findUnique({
      where: { hotelId_userId: { hotelId, userId } },
    })
    if (!member || member.role === 'STAFF') {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 })
    }
  }

  const memberToDelete = await prisma.hotelMember.findFirst({
    where: { id: memberId, hotelId },
  })

  if (!memberToDelete) {
    return NextResponse.json({ error: "Участник не найден" }, { status: 404 })
  }

  await prisma.hotelMember.delete({ where: { id: memberId } })

  return NextResponse.json({ success: true })
}
