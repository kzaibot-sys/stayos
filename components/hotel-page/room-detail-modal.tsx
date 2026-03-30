"use client"

import { useState } from "react"
import Link from "next/link"
import { BedDouble, Users, X, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface RoomDetailModalProps {
  room: {
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
  slug: string
  isOpen: boolean
  onClose: () => void
}

export function RoomDetailModal({ room, slug, isOpen, onClose }: RoomDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const typeLabel = roomTypeLabels[room.type] ?? room.type
  const hasPhotos = room.photos && room.photos.length > 0

  const prevPhoto = () => {
    setCurrentPhotoIndex((i) => (i === 0 ? room.photos.length - 1 : i - 1))
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((i) => (i === room.photos.length - 1 ? 0 : i + 1))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        showCloseButton={false}
      >
        {/* Photo gallery */}
        <div className="relative bg-gray-100 w-full" style={{ minHeight: "260px" }}>
          {hasPhotos ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={room.photos[currentPhotoIndex]}
                alt={`${room.name} — фото ${currentPhotoIndex + 1}`}
                className="w-full object-cover"
                style={{ maxHeight: "320px", width: "100%" }}
              />
              {room.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {room.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhotoIndex(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          i === currentPhotoIndex ? "bg-white" : "bg-white/50"
                        )}
                        aria-label={`Фото ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ minHeight: "260px" }}>
              <BedDouble className="size-20 text-gray-300" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
            aria-label="Закрыть"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <DialogHeader>
            <div className="flex flex-wrap items-start gap-3">
              <DialogTitle className="text-xl font-heading font-semibold text-gray-900">
                {room.name}
              </DialogTitle>
              <Badge variant="secondary" className="text-xs">
                {typeLabel}
              </Badge>
            </div>
          </DialogHeader>

          {/* Key info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
            {room.floor && (
              <span className="text-gray-500">
                {room.floor}-й этаж
              </span>
            )}
          </div>

          {/* Description */}
          {room.description && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {room.description}
            </p>
          )}

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Удобства</h3>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

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
              onClick={onClose}
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-[#1a56db] text-white hover:bg-[#1e429f]"
              )}
            >
              Забронировать
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
