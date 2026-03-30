import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  perNight: z.boolean().optional(),
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

  const service = await prisma.extraService.findFirst({ where: { id, hotelId } })
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 })

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

  const updated = await prisma.extraService.update({ where: { id }, data: parsed.data })
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

  const service = await prisma.extraService.findFirst({ where: { id, hotelId } })
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.extraService.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
