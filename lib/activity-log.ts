import { prisma } from "@/lib/prisma"

export async function logActivity(params: {
  hotelId: string
  userId?: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, any>
}) {
  try {
    await prisma.activityLog.create({
      data: {
        hotelId: params.hotelId,
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details ? JSON.stringify(params.details) : undefined,
      },
    })
  } catch (err) {
    // Non-blocking: log errors but don't surface them to callers
    console.error("[ActivityLog] Failed to log activity:", err)
  }
}
