import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateRatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  multiplier: z.number().min(0.01).max(10).optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.ratePlan.findFirst({
    where: { id, hotelId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Rate plan not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateRatePlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.dateFrom !== undefined) updateData.dateFrom = new Date(data.dateFrom)
  if (data.dateTo !== undefined) updateData.dateTo = new Date(data.dateTo)
  if (data.multiplier !== undefined) updateData.multiplier = data.multiplier
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  // Validate date range if both are provided
  const from = updateData.dateFrom ?? existing.dateFrom
  const to = updateData.dateTo ?? existing.dateTo
  if (to <= from) {
    return NextResponse.json(
      { error: "Дата окончания должна быть после даты начала" },
      { status: 400 }
    )
  }

  const ratePlan = await prisma.ratePlan.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(ratePlan)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.ratePlan.findFirst({
    where: { id, hotelId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Rate plan not found" }, { status: 404 })
  }

  await prisma.ratePlan.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
