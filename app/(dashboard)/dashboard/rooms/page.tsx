import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoomGrid } from "@/components/dashboard/room-grid"

export default async function RoomsPage() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    redirect("/login")
  }

  const rooms = await prisma.room.findMany({
    where: { hotelId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  const parsedRooms = rooms.map((room) => ({
    ...room,
    amenities: (() => {
      try {
        return JSON.parse(room.amenities || "[]")
      } catch {
        return []
      }
    })(),
    photos: (() => {
      try {
        return JSON.parse(room.photos || "[]")
      } catch {
        return []
      }
    })(),
  }))

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Номера
        </h1>
        <Link href="/dashboard/rooms/new">
          <Button>
            <Plus className="size-4 mr-2" />
            Добавить номер
          </Button>
        </Link>
      </div>

      <RoomGrid rooms={parsedRooms} />
    </div>
  )
}
