import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { BedDouble, Mail, Phone, MapPin, MessageCircle, Send, Star } from "lucide-react"
import { HotelHero } from "@/components/hotel-page/hotel-hero"
import { AmenitiesList } from "@/components/hotel-page/amenities-list"
import { RoomsSection } from "@/components/hotel-page/rooms-section"
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
  return {
    title: `${hotel.name} — StayOS`,
    description:
      hotel.shortDescription ||
      hotel.description ||
      `Забронируйте номер в ${hotel.name}`,
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

  // Build WhatsApp and Telegram links
  const whatsappLink = hotel.phone
    ? `https://wa.me/${hotel.phone.replace(/\D/g, "")}`
    : null
  const telegramLink = hotel.phone
    ? `https://t.me/${hotel.phone.replace(/\D/g, "")}`
    : null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero */}
      <HotelHero hotel={hotel} />

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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {galleryUrls.slice(0, 6).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`${hotel.name} — фото ${i + 1}`}
                    className={`w-full object-cover rounded-xl ${
                      i === 0 ? "aspect-video col-span-2 md:col-span-1 md:row-span-2" : "aspect-video"
                    }`}
                  />
                ))}
              </div>
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
