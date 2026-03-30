import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { BedDouble, Mail, Phone, MapPin } from "lucide-react"
import { HotelHero } from "@/components/hotel-page/hotel-hero"
import { AmenitiesList } from "@/components/hotel-page/amenities-list"
import { RoomsSection } from "@/components/hotel-page/rooms-section"

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero */}
      <HotelHero hotel={hotel} />

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">

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
                      className="hover:text-[#1a56db] transition-colors"
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
