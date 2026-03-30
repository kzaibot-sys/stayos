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
  Shield,
  Wifi,
  Car,
  Coffee,
  Sparkles,
  Heart,
  Clock,
  Users,
  Award,
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

// --- Advantages bento grid ---

function AdvantagesSection() {
  const { lang } = useLang()

  const advantages = [
    {
      icon: Shield,
      title: { ru: "Безопасное бронирование", en: "Secure Booking", kz: "Қауіпсіз брондау" },
      desc: { ru: "Защита данных и безопасная оплата", en: "Data protection and secure payment", kz: "Деректерді қорғау және қауіпсіз төлем" },
    },
    {
      icon: Clock,
      title: { ru: "Мгновенное подтверждение", en: "Instant Confirmation", kz: "Лездік растау" },
      desc: { ru: "Подтверждение бронирования за секунды", en: "Booking confirmed in seconds", kz: "Брондау бірнеше секундта расталады" },
    },
    {
      icon: Heart,
      title: { ru: "Лучшие цены", en: "Best Prices", kz: "Үздік бағалар" },
      desc: { ru: "Гарантия лучшей цены при прямом бронировании", en: "Best price guarantee for direct booking", kz: "Тікелей брондау үшін ең жақсы баға кепілдігі" },
    },
    {
      icon: Award,
      title: { ru: "Премиальный сервис", en: "Premium Service", kz: "Премиум қызмет" },
      desc: { ru: "Индивидуальный подход к каждому гостю", en: "Personal approach to every guest", kz: "Әрбір қонаққа жеке көзқарас" },
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {advantages.map((adv, i) => {
        const Icon = adv.icon
        return (
          <div
            key={i}
            className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#d4a373]/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="size-12 rounded-xl bg-[#1b4332]/10 flex items-center justify-center mb-4 group-hover:bg-[#d4a373]/10 transition-colors">
              <Icon className="size-6 text-[#1b4332] group-hover:text-[#d4a373] transition-colors" />
            </div>
            <h3 className="font-bold text-[#1b4332] mb-1">{adv.title[lang]}</h3>
            <p className="text-sm text-gray-500">{adv.desc[lang]}</p>
          </div>
        )
      })}
    </div>
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
      {/* ====== NAVBAR ====== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#1b4332] shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo / Hotel name */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}
            className="font-bold text-lg text-white tracking-tight"
          >
            {hotel.name}
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="ml-2">
              <LanguageSwitcher dark />
            </div>
            <Link
              href={`/${hotel.slug}/book`}
              className="ml-3 inline-flex items-center gap-2 bg-[#d4a373] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#c4956a] transition-colors shadow-sm"
            >
              <Sparkles className="size-3.5" />
              {t.book}
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher dark />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label={t.menu}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1b4332] border-t border-white/10">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-white/80 py-2.5 px-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={`/${hotel.slug}/book`}
                className="block text-center bg-[#d4a373] text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#c4956a] transition-colors mt-2"
              >
                {t.book}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ====== HERO ====== */}
      <HotelHero
        hotel={hotel}
        minPrice={hotel.minRoomPrice}
        reviewCount={hotel.reviews.length}
        avgRating={avgRating}
      />

      {/* ====== MAIN CONTENT ====== */}
      <main className="flex-1">
        {/* Advantages */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <AnimatedSection>
            <AdvantagesSection />
          </AnimatedSection>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

          {/* ====== ABOUT ====== */}
          {hotel.description && (
            <AnimatedSection id="about">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-3">
                  <div className="inline-block bg-[#1b4332]/10 rounded-full px-4 py-1.5 mb-4">
                    <span className="text-sm font-semibold text-[#1b4332]">{t.aboutHotel}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1b4332] mb-6 leading-tight">
                    {hotel.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {hotel.description}
                  </p>
                </div>
                {/* Amenities sidebar */}
                {hotel.amenities.length > 0 && (
                  <div className="lg:col-span-2">
                    <div className="bg-[#1b4332] rounded-2xl p-6 text-white">
                      <h3 className="font-bold text-lg mb-4">{t.amenities}</h3>
                      <div className="space-y-3">
                        {hotel.amenities.slice(0, 8).map((amenity) => (
                          <div key={amenity} className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-[#d4a373]" />
                            <span className="text-sm text-white/90">{amenity}</span>
                          </div>
                        ))}
                        {hotel.amenities.length > 8 && (
                          <p className="text-sm text-white/50 pt-1">
                            +{hotel.amenities.length - 8}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* ====== ROOMS ====== */}
          <AnimatedSection id="rooms">
            <div className="text-center mb-12">
              <div className="inline-block bg-[#1b4332]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="text-sm font-semibold text-[#1b4332]">{t.rooms}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b4332]">
                {lang === "ru" ? "Выберите свой номер" : lang === "kz" ? "Бөлмеңізді таңдаңыз" : "Choose Your Room"}
              </h2>
            </div>
            {hotel.rooms.length > 0 ? (
              <RoomsSection rooms={hotel.rooms} slug={hotel.slug} />
            ) : (
              <p className="text-gray-500 text-center">{t.noRooms}</p>
            )}
          </AnimatedSection>

          {/* ====== GALLERY ====== */}
          {hotel.galleryUrls.length > 0 && (
            <AnimatedSection id="gallery">
              <div className="text-center mb-12">
                <div className="inline-block bg-[#1b4332]/10 rounded-full px-4 py-1.5 mb-4">
                  <span className="text-sm font-semibold text-[#1b4332]">{t.gallery}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1b4332]">
                  {lang === "ru" ? "Фотографии отеля" : lang === "kz" ? "Қонақ үй суреттері" : "Hotel Photos"}
                </h2>
              </div>
              <PhotoGallery photos={hotel.galleryUrls} hotelName={hotel.name} />
            </AnimatedSection>
          )}

          {/* ====== PROMOTIONS ====== */}
          {hotel.activePromos.length > 0 && (
            <AnimatedSection>
              <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                {/* Decorative pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a373]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#d4a373]/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#d4a373] rounded-xl p-2.5">
                      <Tag className="size-5" />
                    </div>
                    <span className="font-bold text-2xl">{t.specialOffer}!</span>
                  </div>
                  <div className="space-y-4">
                    {hotel.activePromos.map((promo) => (
                      <div key={promo.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                        <p className="text-white/80 text-sm mb-2">
                          {promo.discountType === "PERCENT"
                            ? t.discountPercent.replace("{value}", String(promo.discountValue))
                            : t.discountFixed.replace(
                                "{value}",
                                new Intl.NumberFormat("ru-RU").format(promo.discountValue)
                              )}
                        </p>
                        <p className="font-semibold text-lg">
                          {t.useCode}:{" "}
                          <span className="bg-[#d4a373] rounded-lg px-4 py-1.5 font-mono tracking-widest text-base">
                            {promo.code}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-6">{t.enterPromo}</p>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ====== REVIEWS ====== */}
          {hotel.reviews.length > 0 && (
            <AnimatedSection id="reviews">
              <div className="text-center mb-12">
                <div className="inline-block bg-[#1b4332]/10 rounded-full px-4 py-1.5 mb-4">
                  <span className="text-sm font-semibold text-[#1b4332]">{t.reviews}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1b4332] mb-4">
                  {lang === "ru" ? "Отзывы гостей" : lang === "kz" ? "Қонақтар пікірлері" : "Guest Reviews"}
                </h2>
                <div className="inline-flex items-center gap-2 bg-[#d4a373]/10 border border-[#d4a373]/20 rounded-full px-5 py-2">
                  <Star className="size-5 text-[#d4a373] fill-[#d4a373]" />
                  <span className="font-bold text-[#1b4332] text-lg">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({hotel.reviews.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hotel.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl p-6 space-y-3 border border-gray-100 hover:border-[#d4a373]/20 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-[#1b4332] flex items-center justify-center text-white font-bold text-sm">
                          {review.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1b4332]">{review.guestName}</p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(review.createdAt), "d MMMM yyyy", { locale: dateFnsLocale })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${
                              i < review.rating
                                ? "text-[#d4a373] fill-[#d4a373]"
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

          {/* ====== FAQ ====== */}
          <AnimatedSection id="faq">
            <div className="text-center mb-12">
              <div className="inline-block bg-[#1b4332]/10 rounded-full px-4 py-1.5 mb-4">
                <span className="text-sm font-semibold text-[#1b4332]">{t.faqTitle}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b4332]">
                {t.faqTitle}
              </h2>
            </div>
            <div className="space-y-3 max-w-3xl mx-auto">
              {[
                { q: t.faqBookQ, a: t.faqBookA },
                { q: t.faqPayQ, a: t.faqPayA },
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
        </div>

        {/* ====== CONTACTS - Dark green section ====== */}
        {hasContacts && (
          <div className="bg-[#1b4332]" id="contacts">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <div className="inline-block bg-white/10 rounded-full px-4 py-1.5 mb-4">
                    <span className="text-sm font-semibold text-[#d4a373]">{t.contacts}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    {lang === "ru" ? "Свяжитесь с нами" : lang === "kz" ? "Бізбен байланысыңыз" : "Get in Touch"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Map */}
                  {hotel.address && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                      <div className="w-full h-80 flex flex-col items-center justify-center gap-5 relative p-6">
                        <div
                          className="absolute inset-0 opacity-5"
                          style={{
                            backgroundImage:
                              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                          }}
                        />
                        <div className="relative z-10 flex flex-col items-center gap-5">
                          <div className="size-16 rounded-full bg-[#d4a373] flex items-center justify-center shadow-lg">
                            <MapPin className="size-8 text-white" />
                          </div>
                          <div className="text-center">
                            <p className="text-white/90 font-medium mb-4">
                              {hotel.address}
                              {hotel.city ? `, ${hotel.city}` : ""}
                            </p>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                (hotel.address || "") + (hotel.city ? " " + hotel.city : "")
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-[#d4a373] hover:bg-[#c4956a] text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-sm"
                            >
                              <ExternalLink className="size-4" />
                              {t.openInMaps}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact info */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex flex-col justify-center space-y-6">
                    {hotel.phone && (
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-[#d4a373]/20 flex items-center justify-center shrink-0">
                          <Phone className="size-5 text-[#d4a373]" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">
                            {lang === "ru" ? "Телефон" : lang === "kz" ? "Телефон" : "Phone"}
                          </p>
                          <a
                            href={`tel:${hotel.phone}`}
                            className="text-white font-medium hover:text-[#d4a373] transition-colors"
                          >
                            {hotel.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-[#d4a373]/20 flex items-center justify-center shrink-0">
                          <Mail className="size-5 text-[#d4a373]" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Email</p>
                          <a
                            href={`mailto:${hotel.email}`}
                            className="text-white hover:text-[#d4a373] transition-colors"
                          >
                            {hotel.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {hotel.address && (
                      <div className="flex items-start gap-4">
                        <div className="size-12 rounded-xl bg-[#d4a373]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="size-5 text-[#d4a373]" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">
                            {lang === "ru" ? "Адрес" : lang === "kz" ? "Мекенжай" : "Address"}
                          </p>
                          <span className="text-white/90">{hotel.address}</span>
                        </div>
                      </div>
                    )}

                    {/* Messenger buttons */}
                    {hotel.phone && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                        {whatsappLink && (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-sm font-medium transition-colors shadow-sm"
                          >
                            <MessageCircle className="size-4" />
                            WhatsApp
                          </a>
                        )}
                        <a
                          href={telegramLink!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white px-6 py-3 text-sm font-medium transition-colors shadow-sm"
                        >
                          <Send className="size-4" />
                          Telegram
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        )}
      </main>

      {/* ====== FOOTER ====== */}
      <footer className="bg-[#143728] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} {hotel.name}</p>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>{t.poweredBy.replace(" StayOS", "").replace("StayOS", "")}</span>
            <Link
              href="/"
              className="flex items-center gap-1.5 font-semibold text-[#d4a373] hover:text-[#e0b48e] transition-colors"
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
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#1b4332]/20 transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <span className="font-semibold text-[#1b4332]">{question}</span>
        <ChevronDown
          className={`size-5 shrink-0 ml-4 text-[#d4a373] transition-transform duration-200 ${
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
