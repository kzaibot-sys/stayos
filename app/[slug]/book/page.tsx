import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { BookingWizard } from "@/components/booking/booking-wizard"

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      checkInTime: true,
      checkOutTime: true,
      phone: true,
      email: true,
      address: true,
      prepaymentPercent: true,
      rooms: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!hotel) notFound()

  // Parse rooms JSON fields
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

  const hotelData = {
    ...hotel,
    rooms,
  }

  return <BookingWizard hotel={hotelData} slug={slug} />
}
