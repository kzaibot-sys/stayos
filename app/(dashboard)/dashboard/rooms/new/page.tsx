"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RoomForm } from "@/components/dashboard/room-form"

export default function NewRoomPage() {
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
          Новый номер
        </h1>
      </div>

      <RoomForm mode="create" />
    </div>
  )
}
