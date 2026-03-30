"use client"

import { useState } from "react"
import { BedDouble, Users, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const roomTypeLabels: Record<string, string> = {
  STANDARD: "Стандарт",
  DELUXE: "Делюкс",
  SUITE: "Люкс",
  APARTMENT: "Апартаменты",
  DORMITORY: "Общий",
  VILLA: "Вилла",
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₸"
}

interface Room {
  id: string
  name: string
  type: string
  capacity: number
  bedType?: string | null
  pricePerNight: number
  dynamicPrice?: number | null
  weekendPrice?: number | null
  amenities: string[]
  photos: string[]
  description?: string | null
  minNights?: number
}

interface StepDatesProps {
  slug: string
  initialCheckIn?: string
  initialCheckOut?: string
  initialAdults?: number
  initialChildren?: number
  initialRoomId?: string
  onNext: (data: {
    checkIn: string
    checkOut: string
    roomId: string
    room: Room
    adults: number
    children: number
  }) => void
}

export function StepDates({
  slug,
  initialCheckIn = "",
  initialCheckOut = "",
  initialAdults = 2,
  initialChildren = 0,
  initialRoomId = "",
  onNext,
}: StepDatesProps) {
  const today = new Date().toISOString().split("T")[0]

  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [adults, setAdults] = useState(initialAdults)
  const [children, setChildren] = useState(initialChildren)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [dateError, setDateError] = useState("")
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId)

  async function fetchRooms(ci: string, co: string) {
    if (!ci || !co) return
    if (new Date(co) <= new Date(ci)) {
      setDateError("Дата выезда должна быть после даты заезда")
      return
    }
    setDateError("")
    setLoading(true)
    setFetched(false)
    try {
      const res = await fetch(
        `/api/hotels/${slug}/rooms?checkIn=${ci}&checkOut=${co}`
      )
      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
    } catch {
      setRooms([])
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }

  function handleCheckInChange(value: string) {
    setCheckIn(value)
    setFetched(false)
    setSelectedRoomId("")
    if (value && checkOut) {
      fetchRooms(value, checkOut)
    }
  }

  function handleCheckOutChange(value: string) {
    setCheckOut(value)
    setFetched(false)
    setSelectedRoomId("")
    if (checkIn && value) {
      fetchRooms(checkIn, value)
    }
  }

  function getNights(ci: string, co: string): number {
    if (!ci || !co) return 0
    return Math.max(0, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000))
  }

  function handleSelectRoom(room: Room) {
    const nights = getNights(checkIn, checkOut)
    const minN = room.minNights ?? 1
    if (nights < minN) {
      setDateError(`Минимальное количество ночей для этого номера: ${minN}`)
      return
    }
    setDateError("")
    setSelectedRoomId(room.id)
    if (checkIn && checkOut) {
      // Use dynamic price if available
      const roomWithPrice = room.dynamicPrice
        ? { ...room, pricePerNight: room.dynamicPrice }
        : room
      onNext({ checkIn, checkOut, roomId: room.id, room: roomWithPrice, adults, children })
    }
  }

  return (
    <div className="space-y-8">
      {/* Dates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Выберите даты</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Дата заезда
            </label>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Дата выезда
            </label>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>
        {dateError && (
          <p className="text-sm text-red-600">{dateError}</p>
        )}
      </div>

      {/* Guests */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Количество гостей</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Взрослые</p>
              <p className="text-xs text-gray-500">От 18 лет</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="size-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={adults <= 1}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center font-semibold">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults(Math.min(10, adults + 1))}
                className="size-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={adults >= 10}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Дети</p>
              <p className="text-xs text-gray-500">До 17 лет</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="size-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={children <= 0}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center font-semibold">{children}</span>
              <button
                type="button"
                onClick={() => setChildren(Math.min(10, children + 1))}
                className="size-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={children >= 10}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      )}

      {fetched && !loading && rooms.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <BedDouble className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            Нет доступных номеров на выбранные даты
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Попробуйте изменить даты заезда и выезда
          </p>
        </div>
      )}

      {fetched && !loading && rooms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Доступные номера ({rooms.length})
          </h3>
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`flex flex-col sm:flex-row rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all ${
                selectedRoomId === room.id
                  ? "border-[#1a56db] ring-2 ring-[#1a56db]/20"
                  : "border-gray-200"
              }`}
            >
              {/* Image placeholder */}
              <div className="sm:w-48 shrink-0 bg-gradient-to-br from-[#1a56db]/10 to-[#6366f1]/10 flex items-center justify-center min-h-[140px]">
                {room.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={room.photos[0]}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BedDouble className="size-12 text-[#1a56db]/30" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <h4 className="text-base font-semibold text-gray-900">
                      {room.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {roomTypeLabels[room.type] ?? room.type}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      До {room.capacity}{" "}
                      {room.capacity === 1
                        ? "гостя"
                        : room.capacity < 5
                        ? "гостей"
                        : "гостей"}
                    </span>
                    {room.bedType && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="size-3.5" />
                        {room.bedType}
                      </span>
                    )}
                  </div>
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {room.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {room.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {room.description}
                  </p>
                )}
                <div className="flex items-end justify-between gap-4">
                  <div>
                    {room.dynamicPrice && room.dynamicPrice !== room.pricePerNight ? (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(room.pricePerNight)}
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(room.dynamicPrice)}
                            <span className="text-sm font-normal text-gray-500">/ночь</span>
                          </p>
                        </div>
                        {room.dynamicPrice < room.pricePerNight ? (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200 mt-1">
                            Скидка за низкую загрузку
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200 mt-1">
                            Высокий сезон +{Math.round((room.dynamicPrice / room.pricePerNight - 1) * 100)}%
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(room.pricePerNight)}
                        <span className="text-sm font-normal text-gray-500">
                          /ночь
                        </span>
                      </p>
                    )}
                    {room.weekendPrice &&
                      room.weekendPrice !== room.pricePerNight && (
                        <p className="text-xs text-gray-400 mt-1">
                          Выходные: {formatPrice(room.weekendPrice)}/ночь
                        </p>
                      )}
                    {room.minNights && room.minNights > 1 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Мин. {room.minNights} ноч.
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSelectRoom(room)}
                    className="bg-[#1a56db] text-white hover:bg-[#1e429f] shrink-0"
                    size="sm"
                  >
                    Выбрать
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
