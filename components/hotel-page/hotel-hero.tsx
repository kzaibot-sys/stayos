"use client"

import Link from "next/link"
import { Star, MapPin, Shield, Clock, Sparkles } from "lucide-react"
import { useLang } from "@/lib/language-context"

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
  reviewCount?: number
  avgRating?: number
}

export function HotelHero({ hotel, minPrice, reviewCount = 0, avgRating = 0 }: HotelHeroProps) {
  const { t } = useLang()
  const hasCover = !!hotel.coverImageUrl

  return (
    <section className="relative w-full min-h-[100vh] flex items-center overflow-hidden">
      {/* Background image */}
      {hasCover && (
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${hotel.coverImageUrl})` }}
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1b4332]/95 via-[#1b4332]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b4332]/60 via-transparent to-[#1b4332]/30" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">
          {/* Location badge */}
          {(hotel.city || hotel.country) && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <MapPin className="size-3.5 text-[#d4a373]" />
              <span className="text-sm text-white/90 font-medium">
                {[hotel.city, hotel.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {/* Hotel name */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            {hotel.name}
          </h1>

          {/* Description */}
          {(hotel.shortDescription || hotel.description) && (
            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
              {hotel.shortDescription || hotel.description}
            </p>
          )}

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/90">
              <Clock className="size-4 text-[#d4a373]" />
              <span>{t.checkIn} {hotel.checkInTime}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/90">
              <Clock className="size-4 text-[#d4a373]" />
              <span>{t.checkOut} {hotel.checkOutTime}</span>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/90">
                <Star className="size-4 text-[#d4a373] fill-[#d4a373]" />
                <span>{avgRating.toFixed(1)} ({reviewCount})</span>
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/${hotel.slug}/book`}
              className="inline-flex items-center gap-2 bg-[#d4a373] hover:bg-[#c4956a] text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Sparkles className="size-4" />
              {t.book}
            </Link>
            {minPrice != null && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4">
                <p className="text-xs text-white/60 uppercase tracking-wider">{t.bestPrice}</p>
                <p className="text-2xl font-bold text-white">
                  {new Intl.NumberFormat("ru-RU").format(minPrice)} <span className="text-sm font-normal text-[#d4a373]">₸{t.perNight}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
