import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createRatePlanSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional().nullable(),
  dateFrom: z.string(),
  dateTo: z.string(),
  multiplier: z.number().min(0.01).max(10),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ratePlans = await prisma.ratePlan.findMany({
    where: { hotelId },
    orderBy: { dateFrom: "asc" },
  })

  return NextResponse.json({ ratePlans })
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

  const parsed = createRatePlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { name, description, dateFrom, dateTo, multiplier, isActive } = parsed.data

  const from = new Date(dateFrom)
  const to = new Date(dateTo)

  if (to <= from) {
    return NextResponse.json(
      { error: "Дата окончания должна быть после даты начала" },
      { status: 400 }
    )
  }

  const ratePlan = await prisma.ratePlan.create({
    data: {
      hotelId,
      name,
      description: description ?? null,
      dateFrom: from,
      dateTo: to,
      multiplier,
      isActive,
    },
  })

  return NextResponse.json(ratePlan, { status: 201 })
}
