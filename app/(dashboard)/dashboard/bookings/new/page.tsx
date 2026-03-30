"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Room {
  id: string
  name: string
  roomNumber: string | null
  type: string
  capacity: number
  pricePerNight: number
  weekendPrice: number | null
}

const paymentMethodLabels = [
  { value: "CASH", label: "Наличные" },
  { value: "STRIPE", label: "Stripe" },
  { value: "KASPI", label: "Kaspi" },
  { value: "BANK_TRANSFER", label: "Перевод" },
]

const statusOptions = [
  { value: "CONFIRMED", label: "Подтверждена" },
  { value: "PENDING", label: "Ожидает" },
  { value: "CHECKED_IN", label: "Заселён" },
]

const paymentStatusOptions = [
  { value: "UNPAID", label: "Не оплачено" },
  { value: "PARTIAL", label: "Частично" },
  { value: "PAID", label: "Оплачено" },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(amount) + " ₸"
}

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [roomId, setRoomId] = useState(searchParams.get("roomId") ?? "")
  const [checkIn, setCheckIn] = useState(searchParams.get("date") ?? "")
  const [checkOut, setCheckOut] = useState("")
  const [guestFirstName, setGuestFirstName] = useState("")
  const [guestLastName, setGuestLastName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [specialRequests, setSpecialRequests] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [status, setStatus] = useState("CONFIRMED")
  const [paymentStatus, setPaymentStatus] = useState("UNPAID")
  const [priceOverride, setPriceOverride] = useState("")

  // Load rooms
  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : [])
      })
      .catch(() => toast.error("Не удалось загрузить номера"))
      .finally(() => setIsLoadingRooms(false))
  }, [])

  // Calculate price
  const selectedRoom = rooms.find((r) => r.id === roomId)
  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)))
      : 0
  const basePrice = priceOverride
    ? parseFloat(priceOverride) || 0
    : (selectedRoom?.pricePerNight ?? 0)
  const totalPrice = basePrice * nights

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomId) return toast.error("Выберите номер")
    if (!checkIn || !checkOut) return toast.error("Укажите даты заезда и выезда")
    if (nights <= 0) return toast.error("Дата выезда должна быть позже даты заезда")
    if (!guestFirstName.trim() || !guestLastName.trim())
      return toast.error("Укажите имя и фамилию гостя")

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          checkIn,
          checkOut,
          guestFirstName: guestFirstName.trim(),
          guestLastName: guestLastName.trim(),
          guestEmail: guestEmail.trim() || null,
          guestPhone: guestPhone.trim() || null,
          adults,
          children,
          specialRequests: specialRequests.trim() || null,
          internalNotes: internalNotes.trim() || null,
          status,
          paymentStatus,
          source: "MANUAL",
          priceOverride: priceOverride ? parseFloat(priceOverride) : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Ошибка при создании брони")
      }

      const booking = await res.json()
      toast.success("Бронь создана!")
      router.push(`/dashboard/bookings/${booking.id}`)
    } catch (error: any) {
      toast.error(error.message ?? "Ошибка при создании брони")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Назад
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Новая бронь
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Номер и даты</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер <span className="text-red-500">*</span>
              </label>
              {isLoadingRooms ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите номер</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                      {room.roomNumber ? ` #${room.roomNumber}` : ""} —{" "}
                      {formatPrice(room.pricePerNight)}/ночь
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата заезда <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата выезда <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  min={checkIn || format(new Date(), "yyyy-MM-dd")}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Price summary */}
            {nights > 0 && selectedRoom && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">
                    {nights} ночей × {formatPrice(basePrice)}
                  </span>
                  <span className="font-semibold text-blue-900 text-base">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Price override */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена за ночь (переопределить)
              </label>
              <input
                type="number"
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
                placeholder={
                  selectedRoom
                    ? `По умолчанию: ${formatPrice(selectedRoom.pricePerNight)}`
                    : "Цена за ночь"
                }
                min={0}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Guest info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Данные гостя</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                  required
                  placeholder="Иван"
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                  required
                  placeholder="Иванов"
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="ivan@example.com"
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+7 700 000 0000"
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Взрослых
                </label>
                <input
                  type="number"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value, 10) || 1)}
                  min={1}
                  max={20}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Детей
                </label>
                <input
                  type="number"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value, 10) || 0)}
                  min={0}
                  max={10}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Дополнительно</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус брони
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус оплаты
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Особые пожелания
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder="Пожелания гостя..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Внутренние заметки
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={2}
                placeholder="Заметки для персонала (не видны гостю)..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              "Создать бронь"
            )}
          </Button>
          <Link href="/dashboard/bookings">
            <Button variant="outline" type="button">
              Отмена
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
