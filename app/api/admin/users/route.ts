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
  const role = searchParams.get("role")
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "20", 10)

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  if (role) {
    where.role = role
  }

  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { hotels: true, memberships: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    hotelsOwned: u._count.hotels,
    memberships: u._count.memberships,
    createdAt: u.createdAt,
  }))

  return NextResponse.json({ users: result, total, page, limit })
}
