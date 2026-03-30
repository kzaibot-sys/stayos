"use client"

import Link from "next/link"
import { BedDouble, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const roomTypeLabels: Record<string, string> = {
  STANDARD: "Стандарт",
  DELUXE: "Делюкс",
  SUITE: "Люкс",
  APARTMENT: "Апартаменты",
  DORMITORY: "Общий",
  VILLA: "Вилла",
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₸"
}

interface RoomCardProps {
  room: {
    id: string
    name: string
    type: string
    capacity: number
    bedType?: string | null
    pricePerNight: number
    weekendPrice?: number | null
    amenities: string[]
    photos: string[]
    description?: string | null
  }
  slug: string
  onOpenModal?: () => void
}

export function RoomCard({ room, slug, onOpenModal }: RoomCardProps) {
  const firstPhoto = room.photos?.[0]
  const visibleAmenities = room.amenities?.slice(0, 5) ?? []
  const typeLabel = roomTypeLabels[room.type] ?? room.type

  return (
    <div
      className="flex flex-col md:flex-row rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onOpenModal}
      role={onOpenModal ? "button" : undefined}
      tabIndex={onOpenModal ? 0 : undefined}
      onKeyDown={onOpenModal ? (e) => { if (e.key === "Enter" || e.key === " ") onOpenModal() } : undefined}
    >
      {/* Image / Placeholder */}
      <div className="md:w-64 shrink-0 relative bg-gradient-to-br from-[#1a56db]/10 to-[#6366f1]/10 flex items-center justify-center min-h-[200px]">
        {firstPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstPhoto}
            alt={room.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <BedDouble className="size-16 text-[#1a56db]/30" />
        )}
      </div>

      {/* Room info */}
      <div className="flex-1 p-6 flex flex-col justify-between gap-4">
        <div>
          {/* Name + type badge */}
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h3 className="text-xl font-heading font-semibold text-gray-900">
              {room.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {typeLabel}
            </Badge>
          </div>

          {/* Description */}
          {room.description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Capacity & bed */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-gray-400" />
              До {room.capacity} гостей
            </span>
            {room.bedType && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="size-4 text-gray-400" />
                {room.bedType}
              </span>
            )}
          </div>

          {/* Amenities */}
          {visibleAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 5 && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  +{room.amenities.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(room.pricePerNight)}
              <span className="text-sm font-normal text-gray-500">/ночь</span>
            </p>
            {room.weekendPrice && room.weekendPrice !== room.pricePerNight && (
              <p className="text-xs text-gray-500 mt-0.5">
                Выходные: {formatPrice(room.weekendPrice)}/ночь
              </p>
            )}
          </div>
          <Link
            href={`/${slug}/book`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-[#1a56db] text-white hover:bg-[#1e429f]"
            )}
          >
            Забронировать
          </Link>
        </div>
      </div>
    </div>
  )
}
