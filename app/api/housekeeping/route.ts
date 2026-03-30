import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTaskSchema = z.object({
  roomId: z.string().min(1),
  type: z.enum(["CLEANING", "MAINTENANCE", "INSPECTION"]).default("CLEANING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  checklist: z
    .array(z.object({ item: z.string(), checked: z.boolean() }))
    .optional()
    .default([]),
})

export async function GET(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const roomId = searchParams.get("roomId")
  const assignedToId = searchParams.get("assignedToId")
  const type = searchParams.get("type")
  const date = searchParams.get("date")

  const where: any = { hotelId }
  if (status) where.status = status
  if (roomId) where.roomId = roomId
  if (assignedToId) where.assignedToId = assignedToId
  if (type) where.type = type
  if (date) {
    const d = new Date(date)
    const start = new Date(d)
    start.setHours(0, 0, 0, 0)
    const end = new Date(d)
    end.setHours(23, 59, 59, 999)
    where.createdAt = { gte: start, lte: end }
  }

  const tasks = await prisma.housekeepingTask.findMany({
    where,
    include: {
      room: { select: { id: true, name: true, roomNumber: true, floor: true } },
      assignedTo: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(tasks)
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

  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  // Verify room belongs to this hotel
  const room = await prisma.room.findFirst({
    where: { id: data.roomId, hotelId },
  })
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  const task = await prisma.housekeepingTask.create({
    data: {
      hotelId,
      roomId: data.roomId,
      type: data.type,
      priority: data.priority,
      assignedToId: data.assignedToId ?? null,
      notes: data.notes ?? null,
      checklist: JSON.stringify(data.checklist),
    },
    include: {
      room: { select: { id: true, name: true, roomNumber: true, floor: true } },
      assignedTo: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  return NextResponse.json(task, { status: 201 })
}
