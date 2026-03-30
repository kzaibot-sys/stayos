"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Room {
  id: string
  name: string
  roomNumber: string | null
}

interface BookingFiltersProps {
  rooms: Room[]
}

const statusOptions = [
  { value: "ALL", label: "Все статусы" },
  { value: "PENDING", label: "Ожидает" },
  { value: "CONFIRMED", label: "Подтверждена" },
  { value: "CHECKED_IN", label: "Заселён" },
  { value: "CHECKED_OUT", label: "Выселился" },
  { value: "CANCELLED", label: "Отменена" },
  { value: "NO_SHOW", label: "Не приехал" },
]

const sourceOptions = [
  { value: "ALL", label: "Все источники" },
  { value: "DIRECT", label: "Сайт" },
  { value: "WIDGET", label: "Виджет" },
  { value: "MANUAL", label: "Вручную" },
]

export function BookingFilters({ rooms }: BookingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get("status") ?? "ALL")
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "")
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "")
  const [roomId, setRoomId] = useState(searchParams.get("roomId") ?? "ALL")
  const [source, setSource] = useState(searchParams.get("source") ?? "ALL")

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (status !== "ALL") params.set("status", status)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    if (roomId !== "ALL") params.set("roomId", roomId)
    if (source !== "ALL") params.set("source", source)
    params.set("page", "1")
    router.push(`/dashboard/bookings?${params.toString()}`)
  }, [status, dateFrom, dateTo, roomId, source, router])

  const handleReset = () => {
    setStatus("ALL")
    setDateFrom("")
    setDateTo("")
    setRoomId("ALL")
    setSource("ALL")
    router.push("/dashboard/bookings")
  }

  // Auto-apply filters when selects change
  useEffect(() => {
    const params = new URLSearchParams()
    if (status !== "ALL") params.set("status", status)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    if (roomId !== "ALL") params.set("roomId", roomId)
    if (source !== "ALL") params.set("source", source)
    params.set("page", "1")
    router.push(`/dashboard/bookings?${params.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, roomId, source])

  const hasFilters =
    status !== "ALL" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    roomId !== "ALL" ||
    source !== "ALL"

  return (
    <div className="flex flex-wrap items-end gap-3 mb-6">
      {/* Status filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Статус</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date from */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Заезд от</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          onBlur={applyFilters}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Заезд до</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          onBlur={applyFilters}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Room filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Номер</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Все номера</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
              {room.roomNumber ? ` #${room.roomNumber}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Source filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Источник</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sourceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset button */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-9 gap-1.5"
        >
          <X className="size-3.5" />
          Сбросить
        </Button>
      )}
    </div>
  )
}
