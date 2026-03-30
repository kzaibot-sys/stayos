"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RoomForm } from "@/components/dashboard/room-form"

interface RoomData {
  id: string
  name: string
  roomNumber: string | null
  type: string
  floor: number | null
  capacity: number
  bedCount: number
  bedType: string | null
  pricePerNight: number
  weekendPrice: number | null
  description: string | null
  amenities: string[]
  status: string
}

export default function EditRoomPage() {
  const params = useParams<{ id: string }>()
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${params.id}`)
        if (!res.ok) {
          setError("Номер не найден")
          return
        }
        const data = await res.json()
        setRoom(data)
      } catch {
        setError("Ошибка загрузки данных")
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <p className="text-red-500 font-medium mb-2">
          {error ?? "Ошибка загрузки"}
        </p>
        <Link
          href="/dashboard/rooms"
          className="text-sm text-blue-600 hover:underline"
        >
          Вернуться к номерам
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-3 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Назад к номерам
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Редактирование номера
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{room.name}</p>
      </div>

      <RoomForm
        mode="edit"
        roomId={room.id}
        defaultValues={{
          name: room.name,
          roomNumber: room.roomNumber ?? "",
          type: room.type,
          floor: room.floor,
          capacity: room.capacity,
          bedCount: room.bedCount,
          bedType: room.bedType ?? "",
          pricePerNight: room.pricePerNight,
          weekendPrice: room.weekendPrice,
          description: room.description ?? "",
          amenities: room.amenities,
          status: room.status,
        }}
      />
    </div>
  )
}
