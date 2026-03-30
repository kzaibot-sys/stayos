import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { BedDouble, Mail, Phone, MapPin, MessageCircle, Send, Star } from "lucide-react"
import { HotelHero } from "@/components/hotel-page/hotel-hero"
import { AmenitiesList } from "@/components/hotel-page/amenities-list"
import { RoomsSection } from "@/components/hotel-page/rooms-section"
import { PhotoGallery } from "@/components/hotel-page/photo-gallery"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const hotel = await prisma.hotel.findUnique({ where: { slug } })
  if (!hotel) return {}
  const description =
    hotel.shortDescription ||
    hotel.description ||
    `Забронируйте номер в ${hotel.name}`
  return {
    title: `${hotel.name} — StayOS`,
    description,
    openGraph: {
      title: hotel.name,
      description,
      type: "website",
      locale: "ru_RU",
      images: hotel.coverImageUrl ? [{ url: hotel.coverImageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: hotel.name,
      description,
    },
  }
}

export default async function HotelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    include: {
      rooms: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
    },
  })

  if (!hotel) notFound()

  // Parse hotel amenities from JSON string
  let hotelAmenities: string[] = []
  try {
    hotelAmenities = JSON.parse(hotel.amenities)
  } catch {
    hotelAmenities = []
  }

  // Parse gallery URLs from JSON string
  let galleryUrls: string[] = []
  try {
    if ((hotel as any).galleryUrls) {
      galleryUrls = JSON.parse((hotel as any).galleryUrls)
    }
  } catch {
    galleryUrls = []
  }

  // Parse room amenities and photos for each room
  const rooms = hotel.rooms.map((room) => {
    let amenities: string[] = []
    let photos: string[] = []
    try {
      amenities = JSON.parse(room.amenities)
    } catch {
      amenities = []
    }
    try {
      photos = JSON.parse(room.photos)
    } catch {
      photos = []
    }
    return { ...room, amenities, photos }
  })

  const hasContacts = hotel.phone || hotel.email || hotel.address

  // Minimum room price for "best price" widget
  const minRoomPrice = rooms.length > 0
    ? Math.min(...rooms.map((r) => r.pricePerNight))
    : null

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    telephone: hotel.phone,
    email: hotel.email,
  }

  // Build WhatsApp and Telegram links
  const whatsappLink = hotel.phone
    ? `https://wa.me/${hotel.phone.replace(/\D/g, "")}`
    : null
  const telegramLink = hotel.phone
    ? `https://t.me/${hotel.phone.replace(/\D/g, "")}`
    : null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <HotelHero hotel={hotel} minPrice={minRoomPrice} />

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">

          {/* About / Description section */}
          {hotel.description && (
            <section>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Об отеле
              </h2>
              <p className="text-gray-700 leading-relaxed max-w-3xl text-base">
                {hotel.description}
              </p>
            </section>
          )}

          {/* Gallery section */}
          {galleryUrls.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Галерея
              </h2>
              <PhotoGallery photos={galleryUrls} hotelName={hotel.name} />
            </section>
          )}

          {/* Amenities section */}
          {hotelAmenities.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Удобства
              </h2>
              <AmenitiesList amenities={hotelAmenities} />
            </section>
          )}

          {/* Rooms section */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Номера
            </h2>
            {rooms.length > 0 ? (
              <RoomsSection rooms={rooms} slug={slug} />
            ) : (
              <p className="text-gray-500">Номера не найдены.</p>
            )}
          </section>

          {/* Reviews section */}
          {hotel.reviews && hotel.reviews.length > 0 && (() => {
            const reviews = hotel.reviews!
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            return (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-heading font-bold text-gray-900">Отзывы</h2>
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                    <Star className="size-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({reviews.length})</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.guestName}</p>
                          <p className="text-xs text-gray-400">
                            {format(review.createdAt, "d MMMM yyyy", { locale: ru })}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          })()}

          {/* Map section */}
          {hotel.address && (
            <section>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Расположение
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 flex items-start gap-3 border-b border-gray-100">
                  <MapPin className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
                  <p className="text-gray-700">{hotel.address}</p>
                </div>
                <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-[#1a56db] hover:underline"
                  >
                    <MapPin className="size-10 text-[#1a56db]/40" />
                    <span className="text-sm font-medium">Открыть в Google Maps</span>
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* FAQ section */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Часто задаваемые вопросы
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: "Как забронировать номер?",
                  a: "Выберите номер и даты, заполните форму бронирования — подтверждение придёт на email.",
                },
                {
                  q: "Какие способы оплаты принимаются?",
                  a: "Принимаем оплату онлайн, Kaspi, наличными или банковским переводом при заезде.",
                },
                {
                  q: "Можно ли отменить бронирование?",
                  a: hotel.cancellationHours > 0
                    ? `Бронирование можно отменить бесплатно за ${hotel.cancellationHours} ч. до заезда. При более поздней отмене может применяться штраф.`
                    : "Пожалуйста, свяжитесь с нами для уточнения условий отмены.",
                },
                {
                  q: "Во сколько заезд и выезд?",
                  a: `Заезд с ${hotel.checkInTime}, выезд до ${hotel.checkOutTime}. Ранний заезд и поздний выезд возможны по запросу.`,
                },
              ].map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                    {q}
                    <span className="shrink-0 ml-4 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                      ▾
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Contacts section */}
          {hasContacts && (
            <section>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Контакты
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                {hotel.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="size-5 text-[#1a56db] shrink-0" />
                    <a
                      href={`tel:${hotel.phone}`}
                      className="hover:text-[#1a56db] transition-colors font-medium"
                    >
                      {hotel.phone}
                    </a>
                  </div>
                )}
                {hotel.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="size-5 text-[#1a56db] shrink-0" />
                    <a
                      href={`mailto:${hotel.email}`}
                      className="hover:text-[#1a56db] transition-colors"
                    >
                      {hotel.email}
                    </a>
                  </div>
                )}
                {hotel.address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
                    <span>{hotel.address}</span>
                  </div>
                )}

                {/* WhatsApp / Telegram buttons */}
                {hotel.phone && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 text-sm font-medium transition-colors"
                      >
                        <MessageCircle className="size-4" />
                        WhatsApp
                      </a>
                    )}
                    {telegramLink && (
                      <a
                        href={`https://t.me/+${hotel.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#2AABEE] hover:bg-[#229ED9] text-white px-4 py-2.5 text-sm font-medium transition-colors"
                      >
                        <Send className="size-4" />
                        Telegram
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-2 text-sm text-gray-400">
          <span>Powered by</span>
          <Link
            href="/"
            className="flex items-center gap-1 font-semibold text-[#1a56db] hover:underline"
          >
            <BedDouble className="size-4" />
            StayOS
          </Link>
        </div>
      </footer>
    </div>
  )
}
