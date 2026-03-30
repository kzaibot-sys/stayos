import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  discountType: z.enum(["PERCENT", "FIXED"]).optional(),
  discountValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const promo = await prisma.promoCode.findFirst({ where: { id, hotelId } })
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const updateData: any = { ...data }
  if (data.code) updateData.code = data.code.toUpperCase()
  if (data.validFrom !== undefined) updateData.validFrom = data.validFrom ? new Date(data.validFrom) : null
  if (data.validTo !== undefined) updateData.validTo = data.validTo ? new Date(data.validTo) : null

  const updated = await prisma.promoCode.update({ where: { id }, data: updateData })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const promo = await prisma.promoCode.findFirst({ where: { id, hotelId } })
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.promoCode.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
