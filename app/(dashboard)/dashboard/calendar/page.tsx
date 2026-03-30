"use client"

import { useState, useEffect } from "react"
import { addDays, subDays, format, startOfDay } from "date-fns"
import { ru } from "date-fns/locale"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarView } from "@/components/dashboard/calendar-view"

interface BookingSlot {
  id: string
  bookingNumber: string
  guestFirstName: string
  guestLastName: string
  checkIn: string
  checkOut: string
  status: string
  roomId?: string
  room?: { id: string }
}

interface RoomWithBookings {
  id: string
  name: string
  roomNumber: string | null
  type: string
  bookings: BookingSlot[]
}

const DAYS_TO_SHOW = 14

export default function CalendarPage() {
  const [startDate, setStartDate] = useState(() => startOfDay(new Date()))
  const [rooms, setRooms] = useState<RoomWithBookings[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const endDate = addDays(startDate, DAYS_TO_SHOW - 1)

  useEffect(() => {
    setIsLoading(true)

    const params = new URLSearchParams({
      dateFrom: format(startDate, "yyyy-MM-dd"),
      dateTo: format(endDate, "yyyy-MM-dd"),
      limit: "200",
    })

    Promise.all([
      fetch("/api/rooms").then((r) => r.json()),
      fetch(`/api/bookings?${params.toString()}`).then((r) => r.json()),
    ])
      .then(([roomsData, bookingsData]) => {
        const allRooms: any[] = Array.isArray(roomsData) ? roomsData : []
        const allBookings: BookingSlot[] = Array.isArray(bookingsData?.bookings)
          ? bookingsData.bookings
          : []

        // Attach bookings to rooms
        const roomsWithBookings: RoomWithBookings[] = allRooms.map((room) => ({
          id: room.id,
          name: room.name,
          roomNumber: room.roomNumber ?? null,
          type: room.type,
          bookings: allBookings
            .filter((b) => b.room?.id === room.id || (b as any).roomId === room.id)
            .map((b) => ({
              id: b.id,
              bookingNumber: b.bookingNumber,
              guestFirstName: b.guestFirstName,
              guestLastName: b.guestLastName,
              checkIn: b.checkIn,
              checkOut: b.checkOut,
              status: b.status,
            })),
        }))

        setRooms(roomsWithBookings)
      })
      .catch(() => {
        setRooms([])
      })
      .finally(() => setIsLoading(false))
  }, [startDate])

  const goBack = () => setStartDate((d) => subDays(d, DAYS_TO_SHOW))
  const goForward = () => setStartDate((d) => addDays(d, DAYS_TO_SHOW))
  const goToday = () => setStartDate(startOfDay(new Date()))

  const dateRangeLabel = `${format(startDate, "d MMM", { locale: ru })} – ${format(
    endDate,
    "d MMM yyyy",
    { locale: ru }
  )}`

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Календарь загрузки
        </h1>
        <Button variant="outline" size="sm" onClick={goToday}>
          <CalendarDays className="size-4 mr-2" />
          Сегодня
        </Button>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={goBack} className="gap-1.5">
          <ChevronLeft className="size-4" />
          Пред.
        </Button>
        <span className="text-sm font-medium text-gray-700 min-w-[180px] text-center">
          {dateRangeLabel}
        </span>
        <Button variant="outline" size="sm" onClick={goForward} className="gap-1.5">
          След.
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: "Подтверждена", color: "bg-blue-500" },
          { label: "Заселён", color: "bg-green-500" },
          { label: "Ожидает", color: "bg-yellow-400" },
          { label: "Выселился", color: "bg-gray-400" },
          { label: "Отменена", color: "bg-gray-300" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <CalendarView rooms={rooms} startDate={startDate} endDate={endDate} />
      )}

      <p className="text-xs text-gray-400 mt-3">
        Нажмите на пустую ячейку, чтобы создать бронь. Нажмите на бронь, чтобы открыть детали.
      </p>
    </div>
  )
}
