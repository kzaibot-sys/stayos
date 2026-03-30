import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  perNight: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get("hotelId")

  if (hotelId) {
    // Public access for booking widget
    const services = await prisma.extraService.findMany({
      where: { hotelId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(services)
  }

  const session = await auth()
  const sessionHotelId = (session?.user as any)?.hotelId
  if (!sessionHotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const services = await prisma.extraService.findMany({
    where: { hotelId: sessionHotelId },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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

  const service = await prisma.extraService.create({
    data: {
      hotelId,
      ...parsed.data,
    },
  })

  return NextResponse.json(service, { status: 201 })
}
