"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  BedDouble,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Star,
  Tag,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { format } from "date-fns"
import { ru, enUS, kk } from "date-fns/locale"

import { LangProvider, useLang } from "@/lib/language-context"
import { HotelHero } from "@/components/hotel-page/hotel-hero"
import { AmenitiesList } from "@/components/hotel-page/amenities-list"
import { RoomsSection } from "@/components/hotel-page/rooms-section"
import { PhotoGallery } from "@/components/hotel-page/photo-gallery"
import { LanguageSwitcher } from "@/components/hotel-page/language-switcher"

// --- Types ---

interface HotelData {
  id: string
  name: string
  slug: string
  city?: string | null
  country: string
  shortDescription?: string | null
  description?: string | null
  coverImageUrl?: string | null
  checkInTime: string
  checkOutTime: string
  phone?: string | null
  email?: string | null
  address?: string | null
  cancellationHours: number
  amenities: string[]
  galleryUrls: string[]
  rooms: RoomData[]
  reviews: ReviewData[]
  activePromos: PromoData[]
  minRoomPrice: number | null
}

interface RoomData {
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

interface ReviewData {
  id: string
  guestName: string
  rating: number
  comment?: string | null
  createdAt: string
}

interface PromoData {
  id: string
  code: string
  discountType: string
  discountValue: number
}

// --- Animated section wrapper ---

function AnimatedSection({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode
  id?: string
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  )
}

// --- Inner page content (uses useLang) ---

function HotelPageInner({ hotel }: { hotel: HotelData }) {
  const { t, lang } = useLang()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const dateFnsLocale = lang === "en" ? enUS : lang === "kz" ? kk : ru

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const hasContacts = hotel.phone || hotel.email || hotel.address
  const whatsappLink = hotel.phone
    ? `https://wa.me/${hotel.phone.replace(/\D/g, "")}`
    : null
  const telegramLink = hotel.phone
    ? `https://t.me/+${hotel.phone.replace(/\D/g, "")}`
    : null

  const navLinks = [
    { href: "#rooms", label: t.rooms },
    { href: "#gallery", label: t.gallery },
    { href: "#reviews", label: t.reviews },
    { href: "#contacts", label: t.contacts },
  ]

  const avgRating =
    hotel.reviews.length > 0
      ? hotel.reviews.reduce((sum, r) => sum + r.rating, 0) / hotel.reviews.length
      : 0

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Hotel name */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}
            className={`font-heading font-bold text-lg transition-colors ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            {hotel.name}
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${
                  scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
            <LanguageSwitcher />
            <Link
              href={`/${hotel.slug}/book`}
              className="inline-flex items-center gap-2 bg-[#1a56db] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#1e429f] transition-colors shadow-sm"
            >
              {t.book}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? "text-gray-900 hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
              aria-label={t.menu}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={`/${hotel.slug}/book`}
                className="block text-center bg-[#1a56db] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1e429f] transition-colors mt-2"
              >
                {t.book}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <HotelHero hotel={hotel} minPrice={hotel.minRoomPrice} />

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">

          {/* About / Description */}
          {hotel.description && (
            <AnimatedSection id="about">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6">
                {t.aboutHotel}
              </h2>
              <div className="max-w-3xl">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {hotel.description}
                </p>
              </div>
            </AnimatedSection>
          )}

          {/* Rooms */}
          <AnimatedSection id="rooms">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-8">
              {t.rooms}
            </h2>
            {hotel.rooms.length > 0 ? (
              <RoomsSection rooms={hotel.rooms} slug={hotel.slug} />
            ) : (
              <p className="text-gray-500">{t.noRooms}</p>
            )}
          </AnimatedSection>

          {/* Gallery */}
          {hotel.galleryUrls.length > 0 && (
            <AnimatedSection id="gallery">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-8">
                {t.gallery}
              </h2>
              <PhotoGallery photos={hotel.galleryUrls} hotelName={hotel.name} />
            </AnimatedSection>
          )}

          {/* Reviews */}
          {hotel.reviews.length > 0 && (
            <AnimatedSection id="reviews">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                  {t.reviews}
                </h2>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
                  <Star className="size-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({hotel.reviews.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hotel.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-2xl p-6 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.guestName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(review.createdAt), "d MMMM yyyy", { locale: dateFnsLocale })}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${
                              i < review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 fill-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Amenities */}
          {hotel.amenities.length > 0 && (
            <AnimatedSection id="amenities">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-8">
                {t.amenities}
              </h2>
              <AmenitiesList amenities={hotel.amenities} />
            </AnimatedSection>
          )}

          {/* Promotions banner */}
          {hotel.activePromos.length > 0 && (
            <AnimatedSection>
              <div className="bg-gradient-to-r from-[#1a56db] via-[#4f46e5] to-[#6366f1] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS0yLTRoMnYyaC0ydi0yek0zNiAyNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 rounded-full p-2">
                      <Tag className="size-5" />
                    </div>
                    <span className="font-bold text-xl">{t.specialOffer}!</span>
                  </div>
                  <div className="space-y-3">
                    {hotel.activePromos.map((promo) => (
                      <div key={promo.id} className="flex flex-wrap items-center gap-3">
                        <div>
                          <p className="text-white/90 text-sm">
                            {promo.discountType === "PERCENT"
                              ? t.discountPercent.replace("{value}", String(promo.discountValue))
                              : t.discountFixed.replace(
                                  "{value}",
                                  new Intl.NumberFormat("ru-RU").format(promo.discountValue)
                                )}
                          </p>
                          <p className="font-semibold text-base mt-1">
                            {t.useCode}:{" "}
                            <span className="bg-white/20 rounded-lg px-3 py-1 font-mono tracking-wider">
                              {promo.code}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/60 text-xs mt-4">{t.enterPromo}</p>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* FAQ accordion */}
          <AnimatedSection id="faq">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-8">
              {t.faqTitle}
            </h2>
            <div className="space-y-3 max-w-3xl">
              {[
                {
                  q: t.faqBookQ,
                  a: t.faqBookA,
                },
                {
                  q: t.faqPayQ,
                  a: t.faqPayA,
                },
                {
                  q: t.faqCancelQ,
                  a: hotel.cancellationHours > 0
                    ? t.faqCancelA.replace("{hours}", String(hotel.cancellationHours))
                    : t.faqCancelADefault,
                },
                {
                  q: t.faqTimesQ,
                  a: t.faqTimesA
                    .replace("{checkIn}", hotel.checkInTime)
                    .replace("{checkOut}", hotel.checkOutTime),
                },
              ].map(({ q, a }) => (
                <FaqAccordion key={q} question={q} answer={a} />
              ))}
            </div>
          </AnimatedSection>

          {/* Map + Contacts side by side */}
          {hasContacts && (
            <AnimatedSection id="contacts">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-8">
                {t.contacts}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map */}
                {hotel.address && (
                  <div className="bg-gray-50 rounded-2xl overflow-hidden">
                    <div className="w-full h-72 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage:
                            "linear-gradient(#1a56db 1px, transparent 1px), linear-gradient(90deg, #1a56db 1px, transparent 1px)",
                          backgroundSize: "40px 40px",
                        }}
                      />
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="size-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <MapPin className="size-8 text-[#1a56db]" />
                        </div>
                        <div className="text-center px-4">
                          <p className="text-sm font-medium text-gray-700 mb-3">
                            {hotel.address}
                            {hotel.city ? `, ${hotel.city}` : ""}
                          </p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              (hotel.address || "") + (hotel.city ? " " + hotel.city : "")
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#1a56db] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#1e429f] transition-colors shadow-sm"
                          >
                            <ExternalLink className="size-3.5" />
                            {t.openInMaps}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact info */}
                <div className="bg-gray-50 rounded-2xl p-8 flex flex-col justify-center space-y-5">
                  {hotel.phone && (
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-[#1a56db]/10 flex items-center justify-center shrink-0">
                        <Phone className="size-5 text-[#1a56db]" />
                      </div>
                      <a
                        href={`tel:${hotel.phone}`}
                        className="text-gray-900 font-medium hover:text-[#1a56db] transition-colors"
                      >
                        {hotel.phone}
                      </a>
                    </div>
                  )}
                  {hotel.email && (
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-[#1a56db]/10 flex items-center justify-center shrink-0">
                        <Mail className="size-5 text-[#1a56db]" />
                      </div>
                      <a
                        href={`mailto:${hotel.email}`}
                        className="text-gray-900 hover:text-[#1a56db] transition-colors"
                      >
                        {hotel.email}
                      </a>
                    </div>
                  )}
                  {hotel.address && (
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-full bg-[#1a56db]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="size-5 text-[#1a56db]" />
                      </div>
                      <span className="text-gray-700">{hotel.address}</span>
                    </div>
                  )}

                  {/* Messenger buttons */}
                  {hotel.phone && (
                    <div className="flex flex-wrap gap-3 pt-3">
                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white px-5 py-3 text-sm font-medium transition-colors shadow-sm"
                        >
                          <MessageCircle className="size-4" />
                          WhatsApp
                        </a>
                      )}
                      <a
                        href={telegramLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white px-5 py-3 text-sm font-medium transition-colors shadow-sm"
                      >
                        <Send className="size-4" />
                        Telegram
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {hotel.name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{t.poweredBy.replace(" StayOS", "").replace("StayOS", "")}</span>
            <Link
              href="/"
              className="flex items-center gap-1 font-semibold text-[#1a56db] hover:underline"
            >
              <BedDouble className="size-4" />
              StayOS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// --- FAQ Accordion ---

function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-5 text-left font-medium text-gray-900"
      >
        <span>{question}</span>
        <ChevronDown
          className={`size-5 shrink-0 ml-4 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{answer}</div>
      </div>
    </div>
  )
}

// --- Wrapper with LangProvider ---

export function HotelPageClient({ hotel }: { hotel: HotelData }) {
  return (
    <LangProvider>
      <HotelPageInner hotel={hotel} />
    </LangProvider>
  )
}
