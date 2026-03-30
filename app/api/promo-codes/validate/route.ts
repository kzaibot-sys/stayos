import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const validateSchema = z.object({
  hotelId: z.string(),
  code: z.string(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = validateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error" }, { status: 422 })
  }

  const { hotelId, code } = parsed.data

  const promo = await prisma.promoCode.findFirst({
    where: {
      hotelId,
      code: code.toUpperCase(),
      isActive: true,
    },
  })

  if (!promo) {
    return NextResponse.json({ error: "Промокод не найден или недействителен" }, { status: 404 })
  }

  const now = new Date()

  if (promo.validFrom && promo.validFrom > now) {
    return NextResponse.json({ error: "Промокод ещё не активен" }, { status: 400 })
  }

  if (promo.validTo && promo.validTo < now) {
    return NextResponse.json({ error: "Срок действия промокода истёк" }, { status: 400 })
  }

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: "Промокод исчерпал лимит использования" }, { status: 400 })
  }

  return NextResponse.json({
    id: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
  })
}
