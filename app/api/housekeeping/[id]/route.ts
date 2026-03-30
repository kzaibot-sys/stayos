import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logActivity } from "@/lib/activity-log"

const updateTaskSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  checklist: z
    .array(z.object({ item: z.string(), checked: z.boolean() }))
    .optional(),
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

  const existing = await prisma.housekeepingTask.findFirst({
    where: { id, hotelId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data
  const updateData: any = {}

  if (data.status !== undefined) {
    updateData.status = data.status
    if (data.status === "IN_PROGRESS" && !existing.startedAt) {
      updateData.startedAt = new Date()
    }
    if (data.status === "COMPLETED") {
      updateData.completedAt = new Date()
    }
  }

  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.checklist !== undefined) {
    updateData.checklist = JSON.stringify(data.checklist)
  }

  const task = await prisma.housekeepingTask.update({
    where: { id },
    data: updateData,
    include: {
      room: { select: { id: true, name: true, roomNumber: true, floor: true } },
      assignedTo: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  // When task is completed → set room cleaningStatus to CLEAN
  if (data.status === "COMPLETED") {
    await prisma.room.update({
      where: { id: existing.roomId },
      data: { cleaningStatus: "CLEAN" },
    })

    logActivity({
      hotelId,
      userId,
      action: "ROOM_CLEANED",
      entity: "room",
      entityId: existing.roomId,
      details: { taskId: id },
    })
  }

  return NextResponse.json(task)
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

  const existing = await prisma.housekeepingTask.findFirst({
    where: { id, hotelId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const task = await prisma.housekeepingTask.update({
    where: { id },
    data: { status: "CANCELLED" },
  })

  return NextResponse.json(task)
}
