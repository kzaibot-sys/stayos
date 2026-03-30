import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.enum(["PERCENT", "FIXED"]).default("PERCENT"),
  discountValue: z.number().positive(),
  maxUses: z.number().int().positive().optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const promoCodes = await prisma.promoCode.findMany({
    where: { hotelId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(promoCodes)
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

  const data = parsed.data

  // Check uniqueness
  const existing = await prisma.promoCode.findFirst({
    where: { hotelId, code: data.code.toUpperCase() },
  })
  if (existing) {
    return NextResponse.json({ error: "Промокод с таким кодом уже существует" }, { status: 409 })
  }

  const promoCode = await prisma.promoCode.create({
    data: {
      hotelId,
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses ?? null,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validTo: data.validTo ? new Date(data.validTo) : null,
      isActive: data.isActive,
    },
  })

  return NextResponse.json(promoCode, { status: 201 })
}
