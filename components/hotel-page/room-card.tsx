"use client"

import { useState } from "react"
import Link from "next/link"
import { BedDouble, Users, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
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
  const { t, lang } = useLang()
  const [photoIndex, setPhotoIndex] = useState(0)
  const hasPhotos = room.photos && room.photos.length > 0
  const visibleAmenities = room.amenities?.slice(0, 4) ?? []
  const typeLabel = roomTypeLabels[room.type]?.[lang] ?? room.type

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoIndex((i) => (i === 0 ? room.photos.length - 1 : i - 1))
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotoIndex((i) => (i === room.photos.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Photo carousel */}
        <div className="md:w-80 shrink-0 relative bg-[#1b4332]/5 min-h-[240px] overflow-hidden">
          {hasPhotos ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={room.photos[photoIndex]}
                alt={room.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {room.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Prev"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {room.photos.map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === photoIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Detail button */}
              {onOpenModal && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenModal() }}
                  className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Details"
                >
                  <Maximize2 className="size-4" />
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BedDouble className="size-16 text-[#1b4332]/20" />
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-3 left-3 bg-[#1b4332] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {typeLabel}
          </div>
        </div>

        {/* Room info */}
        <div className="flex-1 p-6 flex flex-col justify-between gap-4">
          <div>
            <h3
              className="text-xl font-bold text-[#1b4332] mb-2 cursor-pointer hover:text-[#2d6a4f] transition-colors"
              onClick={onOpenModal}
            >
              {room.name}
            </h3>

            {room.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{room.description}</p>
            )}

            {/* Capacity & bed */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
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
            </div>

            {/* Amenities */}
            {visibleAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {visibleAmenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-block text-xs px-2.5 py-1 rounded-full bg-[#1b4332]/5 text-[#1b4332] border border-[#1b4332]/10"
                  >
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 4 && (
                  <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    +{room.amenities.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-2xl font-bold text-[#1b4332]">
                {formatPrice(room.pricePerNight)}
                <span className="text-sm font-normal text-gray-400"> / {t.nightShort}</span>
              </p>
              {room.weekendPrice && room.weekendPrice !== room.pricePerNight && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.weekend}: {formatPrice(room.weekendPrice)} / {t.nightShort}
                </p>
              )}
            </div>
            <Link
              href={`/${slug}/book`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 bg-[#d4a373] hover:bg-[#c4956a] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {t.book}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
