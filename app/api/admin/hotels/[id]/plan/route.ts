import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePlanSchema = z.object({
  plan: z.enum(["FREE", "STARTER", "PRO", "ENTERPRISE"]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updatePlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const hotel = await prisma.hotel.findUnique({ where: { id } })
  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  const updated = await prisma.hotel.update({
    where: { id },
    data: { plan: parsed.data.plan },
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    plan: updated.plan,
  })
}
