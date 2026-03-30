import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  isPublished: z.boolean().optional(),
  comment: z.string().optional().nullable(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const review = await prisma.review.findFirst({ where: { id, hotelId } })
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error" }, { status: 422 })
  }

  const updated = await prisma.review.update({ where: { id }, data: parsed.data })
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

  const review = await prisma.review.findFirst({ where: { id, hotelId } })
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.review.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
