import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingFilters } from "@/components/dashboard/booking-filters"
import { BookingTable } from "@/components/dashboard/booking-table"
import { Suspense } from "react"

interface SearchParams {
  status?: string
  dateFrom?: string
  dateTo?: string
  roomId?: string
  source?: string
  page?: string
  limit?: string
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    redirect("/login")
  }

  const sp = await searchParams
  const page = parseInt(sp.page ?? "1", 10)
  const limit = parseInt(sp.limit ?? "20", 10)
  const skip = (page - 1) * limit

  // Build filter
  const where: any = { hotelId }
  if (sp.status && sp.status !== "ALL") where.status = sp.status
  if (sp.roomId && sp.roomId !== "ALL") where.roomId = sp.roomId
  if (sp.source && sp.source !== "ALL") where.source = sp.source
  if (sp.dateFrom || sp.dateTo) {
    where.checkIn = {}
    if (sp.dateFrom) where.checkIn.gte = new Date(sp.dateFrom)
    if (sp.dateTo) where.checkIn.lte = new Date(sp.dateTo)
  }

  const [bookings, total, rooms] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        room: { select: { id: true, name: true, roomNumber: true, type: true } },
      },
      orderBy: { checkIn: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
    prisma.room.findMany({
      where: { hotelId, isActive: true },
      select: { id: true, name: true, roomNumber: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ])

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Бронирования
        </h1>
        <Link href="/dashboard/bookings/new">
          <Button>
            <Plus className="size-4 mr-2" />
            Создать бронь
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Suspense>
        <BookingFilters rooms={rooms} />
      </Suspense>

      {/* Table */}
      <BookingTable
        bookings={bookings.map((b) => ({
          ...b,
          checkIn: b.checkIn.toISOString(),
          checkOut: b.checkOut.toISOString(),
        }))}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  )
}
