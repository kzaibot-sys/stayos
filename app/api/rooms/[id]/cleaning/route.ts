import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logActivity } from "@/lib/activity-log"

const cleaningSchema = z.object({
  cleaningStatus: z.enum(["CLEAN", "DIRTY", "CLEANING", "INSPECTION"]),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  const userId = (session?.user as any)?.id

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.room.findFirst({
    where: { id, hotelId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = cleaningSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const room = await prisma.room.update({
    where: { id },
    data: { cleaningStatus: parsed.data.cleaningStatus },
  })

  logActivity({
    hotelId,
    userId,
    action: "ROOM_STATUS_CHANGED",
    entity: "room",
    entityId: id,
    details: {
      from: existing.cleaningStatus,
      to: parsed.data.cleaningStatus,
    },
  })

  return NextResponse.json(room)
}
