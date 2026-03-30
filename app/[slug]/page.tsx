import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { HotelPageClient } from "@/components/hotel-page/hotel-page-client"

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

  // Fetch active promo codes
  const activePromos = await prisma.promoCode.findMany({
    where: {
      hotelId: hotel.id,
      isActive: true,
      OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  // Parse hotel amenities
  let hotelAmenities: string[] = []
  try {
    hotelAmenities = JSON.parse(hotel.amenities)
  } catch {
    hotelAmenities = []
  }

  // Parse gallery URLs
  let galleryUrls: string[] = []
  try {
    if ((hotel as any).galleryUrls) {
      galleryUrls = JSON.parse((hotel as any).galleryUrls)
    }
  } catch {
    galleryUrls = []
  }

  // Parse room amenities and photos
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

  const minRoomPrice =
    rooms.length > 0 ? Math.min(...rooms.map((r) => r.pricePerNight)) : null

  // Serialize reviews for client
  const reviews = (hotel.reviews ?? []).map((r) => ({
    id: r.id,
    guestName: r.guestName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }))

  // Serialize promos
  const promos = activePromos.map((p) => ({
    id: p.id,
    code: p.code,
    discountType: p.discountType,
    discountValue: p.discountValue,
  }))

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

  const hotelData = {
    id: hotel.id,
    name: hotel.name,
    slug: hotel.slug,
    city: hotel.city,
    country: hotel.country,
    shortDescription: hotel.shortDescription,
    description: hotel.description,
    coverImageUrl: hotel.coverImageUrl,
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    phone: hotel.phone,
    email: hotel.email,
    address: hotel.address,
    cancellationHours: hotel.cancellationHours,
    amenities: hotelAmenities,
    galleryUrls,
    rooms,
    reviews,
    activePromos: promos,
    minRoomPrice,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HotelPageClient hotel={hotelData} />
    </>
  )
}
