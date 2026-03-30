"use client"

import Link from "next/link"
import { format, eachDayOfInterval, isToday, isSameDay, isWithinInterval, startOfDay } from "date-fns"
import { ru } from "date-fns/locale"

// ─── Types ─────────────────────────────────────────────────────────────────

interface BookingSlot {
  id: string
  bookingNumber: string
  guestFirstName: string
  guestLastName: string
  checkIn: string
  checkOut: string
  status: string
}

interface RoomWithBookings {
  id: string
  name: string
  roomNumber: string | null
  type: string
  bookings: BookingSlot[]
}

interface CalendarViewProps {
  rooms: RoomWithBookings[]
  startDate: Date
  endDate: Date
}

// ─── Status colors ──────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-blue-500 hover:bg-blue-600",
  CHECKED_IN: "bg-green-500 hover:bg-green-600",
  PENDING: "bg-yellow-400 hover:bg-yellow-500",
  NO_SHOW: "bg-orange-400 hover:bg-orange-500",
  CANCELLED: "bg-gray-300 hover:bg-gray-400",
  CHECKED_OUT: "bg-gray-400 hover:bg-gray-500",
}

const COL_WIDTH = 48 // px per day column
const ROW_HEIGHT = 52 // px per room row
const LEFT_COL = 160 // px for room names column

// ─── Component ─────────────────────────────────────────────────────────────

export function CalendarView({ rooms, startDate, endDate }: CalendarViewProps) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: LEFT_COL + days.length * COL_WIDTH }}>
          {/* Header row: day columns */}
          <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            {/* Top-left corner */}
            <div
              className="flex-shrink-0 border-r border-gray-200 flex items-center px-3"
              style={{ width: LEFT_COL, minWidth: LEFT_COL }}
            >
              <span className="text-xs font-medium text-gray-500">Номер</span>
            </div>

            {/* Day headers */}
            {days.map((day) => {
              const isCurrentDay = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`flex-shrink-0 border-r border-gray-100 flex flex-col items-center justify-center py-2 ${
                    isCurrentDay ? "bg-blue-50" : ""
                  }`}
                  style={{ width: COL_WIDTH, minWidth: COL_WIDTH }}
                >
                  <span
                    className={`text-xs font-medium ${
                      isCurrentDay ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {format(day, "EE", { locale: ru })}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isCurrentDay
                        ? "text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center"
                        : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Rooms rows */}
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Нет номеров для отображения
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="flex border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                style={{ height: ROW_HEIGHT }}
              >
                {/* Room name column */}
                <div
                  className="flex-shrink-0 border-r border-gray-200 flex flex-col justify-center px-3 sticky left-0 bg-white z-10"
                  style={{ width: LEFT_COL, minWidth: LEFT_COL }}
                >
                  <span className="text-sm font-medium text-gray-900 truncate leading-tight">
                    {room.name}
                  </span>
                  {room.roomNumber && (
                    <span className="text-xs text-gray-400">#{room.roomNumber}</span>
                  )}
                </div>

                {/* Day cells */}
                <div className="flex flex-1 relative">
                  {/* Background grid cells */}
                  {days.map((day) => {
                    const isCurrentDay = isToday(day)
                    return (
                      <Link
                        key={day.toISOString()}
                        href={`/dashboard/bookings/new?roomId=${room.id}&date=${format(day, "yyyy-MM-dd")}`}
                        className={`flex-shrink-0 border-r border-gray-100 h-full ${
                          isCurrentDay ? "bg-blue-50/50" : "hover:bg-gray-100/50"
                        } transition-colors`}
                        style={{ width: COL_WIDTH, minWidth: COL_WIDTH }}
                      />
                    )
                  })}

                  {/* Booking bars */}
                  {room.bookings.map((booking) => {
                    const bookingStart = startOfDay(new Date(booking.checkIn))
                    const bookingEnd = startOfDay(new Date(booking.checkOut))

                    // Find which day columns this booking spans
                    const startIdx = days.findIndex((d) => isSameDay(d, bookingStart))
                    const endIdx = days.findIndex((d) => isSameDay(d, bookingEnd))

                    // Determine visible range
                    const visibleStart = startIdx >= 0 ? startIdx : 0
                    const visibleEnd =
                      endIdx >= 0
                        ? endIdx
                        : bookingEnd > days[days.length - 1]
                        ? days.length - 1
                        : -1

                    // Skip if booking doesn't intersect the visible range
                    if (visibleEnd < 0 || visibleStart > days.length - 1) return null
                    if (
                      bookingEnd <= days[0] ||
                      bookingStart > days[days.length - 1]
                    )
                      return null

                    const barStart =
                      bookingStart < days[0] ? 0 : startIdx >= 0 ? startIdx : 0
                    const barEnd =
                      bookingEnd > days[days.length - 1]
                        ? days.length
                        : endIdx >= 0
                        ? endIdx
                        : days.length

                    const spanDays = barEnd - barStart
                    if (spanDays <= 0) return null

                    const colorClass =
                      statusColors[booking.status] ?? "bg-gray-400 hover:bg-gray-500"

                    return (
                      <Link
                        key={booking.id}
                        href={`/dashboard/bookings/${booking.id}`}
                        className={`absolute top-2 bottom-2 rounded-md ${colorClass} text-white text-xs font-medium flex items-center px-2 transition-colors shadow-sm overflow-hidden z-20`}
                        style={{
                          left: barStart * COL_WIDTH + 2,
                          width: spanDays * COL_WIDTH - 4,
                        }}
                        title={`${booking.guestFirstName} ${booking.guestLastName} — ${booking.bookingNumber}`}
                      >
                        <span className="truncate">
                          {booking.guestFirstName} {booking.guestLastName}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
