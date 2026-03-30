import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!session || !hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get("format") ?? "json"

  if (format !== "json") {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  }

  const [hotel, rooms, bookings, guests, payments] = await Promise.all([
    prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        email: true,
        website: true,
        currency: true,
        timezone: true,
        checkInTime: true,
        checkOutTime: true,
        createdAt: true,
      },
    }),
    prisma.room.findMany({
      where: { hotelId },
      select: {
        id: true,
        name: true,
        roomNumber: true,
        type: true,
        pricePerNight: true,
        capacity: true,
        isActive: true,
        description: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.booking.findMany({
      where: { hotelId },
      select: {
        id: true,
        bookingNumber: true,
        status: true,
        checkIn: true,
        checkOut: true,
        guestFirstName: true,
        guestLastName: true,
        guestEmail: true,
        guestPhone: true,
        adults: true,
        children: true,
        totalPrice: true,
        paymentStatus: true,
        specialRequests: true,
        createdAt: true,
        room: { select: { name: true, roomNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.guest.findMany({
      where: { hotelId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        nationality: true,
        totalVisits: true,
        totalSpent: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { booking: { hotelId } },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        createdAt: true,
        booking: { select: { bookingNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    hotel,
    rooms,
    bookings,
    guests,
    payments,
    summary: {
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      totalGuests: guests.length,
      totalPayments: payments.length,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    },
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hotel-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  })
}
