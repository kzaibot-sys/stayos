"use client"

import { useState } from "react"
import Link from "next/link"
import { BedDouble, Users, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/language-context"

const roomTypeLabels: Record<string, Record<string, string>> = {
  STANDARD: { ru: "Стандарт", en: "Standard", kz: "Стандарт" },
  DELUXE: { ru: "Делюкс", en: "Deluxe", kz: "Делюкс" },
  SUITE: { ru: "Люкс", en: "Suite", kz: "Люкс" },
  APARTMENT: { ru: "Апартаменты", en: "Apartment", kz: "Апартамент" },
  DORMITORY: { ru: "Общий", en: "Dormitory", kz: "Жалпы" },
  VILLA: { ru: "Вилла", en: "Villa", kz: "Вилла" },
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
  const { t, lang } = useLang()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const typeLabel = roomTypeLabels[room.type]?.[lang] ?? room.type
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
        <div className="relative bg-[#1b4332]/5 w-full" style={{ minHeight: "280px" }}>
          {hasPhotos ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={room.photos[currentPhotoIndex]}
                alt={`${room.name} — ${currentPhotoIndex + 1}`}
                className="w-full object-cover"
                style={{ maxHeight: "340px", width: "100%" }}
              />
              {room.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                    aria-label="Prev"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {room.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhotoIndex(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          i === currentPhotoIndex ? "bg-white" : "bg-white/50"
                        )}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ minHeight: "280px" }}>
              <BedDouble className="size-20 text-[#1b4332]/20" />
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-3 left-3 bg-[#1b4332] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {typeLabel}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1b4332]">
              {room.name}
            </DialogTitle>
          </DialogHeader>

          {/* Key info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-[#1b4332]" />
              {t.upTo} {room.capacity} {t.guests}
            </span>
            {room.bedType && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="size-4 text-[#1b4332]" />
                {room.bedType}
              </span>
            )}
            {room.floor && (
              <span className="text-gray-500">
                {room.floor} {t.floor}
              </span>
            )}
          </div>

          {/* Description */}
          {room.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{room.description}</p>
          )}

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#1b4332] mb-3">{t.amenities}</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-block text-xs px-3 py-1 rounded-full bg-[#1b4332]/5 text-[#1b4332] border border-[#1b4332]/10"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex flex-wrap items-end justify-between gap-4 pt-5 border-t border-gray-100">
            <div>
              <p className="text-3xl font-bold text-[#1b4332]">
                {formatPrice(room.pricePerNight)}
                <span className="text-sm font-normal text-gray-400"> / {t.nightShort}</span>
              </p>
              {room.weekendPrice && room.weekendPrice !== room.pricePerNight && (
                <p className="text-xs text-gray-400 mt-1">
                  {t.weekend}: {formatPrice(room.weekendPrice)} / {t.nightShort}
                </p>
              )}
            </div>
            <Link
              href={`/${slug}/book`}
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-[#d4a373] hover:bg-[#c4956a] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Sparkles className="size-4" />
              {t.book}
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
