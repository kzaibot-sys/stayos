"use client"

import { useState } from "react"
import { RoomCard } from "./room-card"
import { RoomDetailModal } from "./room-detail-modal"

interface Room {
  id: string
  name: string
  type: string
  capacity: number
  bedType?: string | null
  floor?: number | null
  pricePerNight: number
  weekendPrice?: number | null
  amenities: string[]
  photos: string[]
  description?: string | null
}

interface RoomsSectionProps {
  rooms: Room[]
  slug: string
}

export function RoomsSection({ rooms, slug }: RoomsSectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  return (
    <>
      <div className="space-y-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            slug={slug}
            onOpenModal={() => setSelectedRoom(room)}
          />
        ))}
      </div>

      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          slug={slug}
          isOpen={true}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </>
  )
}
