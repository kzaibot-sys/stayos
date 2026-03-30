"use client"

import Link from "next/link"
import { Clock } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HotelHeroProps {
  hotel: {
    name: string
    slug: string
    city?: string | null
    country: string
    shortDescription?: string | null
    description?: string | null
    coverImageUrl?: string | null
    checkInTime: string
    checkOutTime: string
  }
  minPrice?: number | null
}

export function HotelHero({ hotel, minPrice }: HotelHeroProps) {
  const hasCover = !!hotel.coverImageUrl

  return (
    <section
      className="relative w-full min-h-[420px] flex items-end"
      style={
        hasCover
          ? {
              backgroundImage: `url(${hotel.coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0",
          hasCover
            ? "bg-gradient-to-t from-black/80 via-black/40 to-black/10"
            : "bg-gradient-to-br from-[#1a56db] to-[#6366f1]"
        )}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-12 pt-24">
        {/* Location */}
        {(hotel.city || hotel.country) && (
          <p className="text-sm font-medium text-white/70 mb-2 uppercase tracking-wide">
            {[hotel.city, hotel.country].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Hotel name */}
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">
          {hotel.name}
        </h1>

        {/* Short description */}
        {(hotel.shortDescription || hotel.description) && (
          <p className="text-lg text-white/80 mb-6 max-w-2xl">
            {hotel.shortDescription || hotel.description}
          </p>
        )}

        {/* Check-in / Check-out times */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="size-4 shrink-0" />
            <span>Заезд: {hotel.checkInTime}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="size-4 shrink-0" />
            <span>Выезд: {hotel.checkOutTime}</span>
          </div>
        </div>

        {/* CTA + Best price */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/${hotel.slug}/book`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white text-[#1a56db] hover:bg-white/90 font-semibold text-base px-8"
            )}
          >
            Забронировать
          </Link>
          {minPrice != null && (
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm font-medium">
              от {new Intl.NumberFormat("ru-RU").format(minPrice)} ₸ / ночь
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
