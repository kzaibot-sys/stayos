"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale/ru"
import { differenceInDays } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CalendarDays, BedDouble, User, CreditCard, Loader2, Tag, CheckSquare, X } from "lucide-react"

interface Room {
  id: string
  name: string
  type: string
  pricePerNight: number
  weekendPrice?: number | null
}

interface BookingData {
  hotelId: string
  checkIn: string
  checkOut: string
  roomId: string
  room: Room
  adults: number
  children: number
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

interface ExtraService {
  id: string
  name: string
  price: number
  perNight: boolean
  isActive: boolean
}

interface PromoResult {
  id: string
  code: string
  discountType: string
  discountValue: number
}

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

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: ru })
  } catch {
    return dateStr
  }
}

interface StepPaymentProps {
  bookingData: BookingData
  slug: string
  onBack: () => void
}

export function StepPayment({ bookingData, slug, onBack }: StepPaymentProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"on_arrival" | "online">("on_arrival")
  const [loading, setLoading] = useState(false)

  // Promo code state
  const [promoCode, setPromoCode] = useState("")
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  // Extra services state
  const [extraServices, setExtraServices] = useState<ExtraService[]>([])
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set())

  const checkIn = new Date(bookingData.checkIn)
  const checkOut = new Date(bookingData.checkOut)
  const nights = differenceInDays(checkOut, checkIn)
  const subtotal = bookingData.room.pricePerNight * nights

  // Calculate discount
  let discountAmount = 0
  if (promoResult) {
    if (promoResult.discountType === "PERCENT") {
      discountAmount = Math.round(subtotal * promoResult.discountValue / 100)
    } else {
      discountAmount = promoResult.discountValue
    }
  }

  // Calculate extras total
  const extrasTotal = extraServices
    .filter(s => selectedExtras.has(s.id))
    .reduce((sum, s) => sum + (s.perNight ? s.price * nights : s.price), 0)

  const totalPrice = Math.max(0, subtotal - discountAmount) + extrasTotal

  // Fetch extra services on mount
  useEffect(() => {
    fetch(`/api/extra-services?hotelId=${bookingData.hotelId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setExtraServices(data)
      })
      .catch(() => {})
  }, [bookingData.hotelId])

  async function handleApplyPromo() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError(null)
    setPromoResult(null)
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: bookingData.hotelId, code: promoCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPromoError(data.error || "Промокод недействителен")
      } else {
        setPromoResult(data)
      }
    } catch {
      setPromoError("Ошибка проверки промокода")
    } finally {
      setPromoLoading(false)
    }
  }

  function handleRemovePromo() {
    setPromoResult(null)
    setPromoCode("")
    setPromoError(null)
  }

  function toggleExtra(id: string) {
    setSelectedExtras(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      // Step 1: Create the booking
      const res = await fetch("/api/bookings/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: bookingData.hotelId,
          roomId: bookingData.roomId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guestFirstName: bookingData.firstName,
          guestLastName: bookingData.lastName,
          guestEmail: bookingData.email || undefined,
          guestPhone: bookingData.phone || undefined,
          adults: bookingData.adults,
          children: bookingData.children,
          specialRequests: bookingData.specialRequests || undefined,
          promoCodeId: promoResult?.id,
          discount: discountAmount,
          extrasTotal,
          selectedExtras: Array.from(selectedExtras),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Ошибка при бронировании"
        toast.error(message)
        return
      }

      // Step 2: If online payment, create Stripe checkout session
      if (paymentMethod === "online") {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: data.id }),
        })

        const checkoutData = await checkoutRes.json()

        if (!checkoutRes.ok || !checkoutData.url) {
          toast.error(checkoutData.error || "Ошибка создания сессии оплаты")
          // Fall back to success page even if Stripe fails
          router.push(`/${slug}/book/success?booking=${data.bookingNumber}`)
          return
        }

        // Redirect to Stripe Checkout
        window.location.href = checkoutData.url
        return
      }

      // On arrival: redirect to success page
      router.push(`/${slug}/book/success?booking=${data.bookingNumber}`)
    } catch {
      toast.error("Произошла ошибка. Попробуйте ещё раз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">Детали бронирования</h3>

        <div className="space-y-4">
          {/* Room */}
          <div className="flex items-start gap-3">
            <BedDouble className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Номер</p>
              <p className="font-medium text-gray-900">
                {bookingData.room.name}{" "}
                <span className="text-gray-500 font-normal">
                  ({roomTypeLabels[bookingData.room.type] ?? bookingData.room.type})
                </span>
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <CalendarDays className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Даты проживания</p>
              <p className="font-medium text-gray-900">
                {formatDate(bookingData.checkIn)} — {formatDate(bookingData.checkOut)}
              </p>
              <p className="text-sm text-gray-500">
                {nights} {nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"}
              </p>
            </div>
          </div>

          {/* Guest */}
          <div className="flex items-start gap-3">
            <User className="size-5 text-[#1a56db] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Гость</p>
              <p className="font-medium text-gray-900">
                {bookingData.firstName} {bookingData.lastName}
              </p>
              {bookingData.email && (
                <p className="text-sm text-gray-500">{bookingData.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {formatPrice(bookingData.room.pricePerNight)} × {nights}{" "}
              {nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"}
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Скидка ({promoResult?.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          {extrasTotal > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Дополнительные услуги</span>
              <span>{formatPrice(extrasTotal)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 text-base pt-1 border-t border-gray-100">
            <span>Итого</span>
            <span className="text-[#1a56db]">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Extra Services */}
      {extraServices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-5 text-[#1a56db]" />
            <h3 className="text-lg font-semibold text-gray-900">Дополнительные услуги</h3>
          </div>
          <div className="space-y-3">
            {extraServices.map(service => {
              const checked = selectedExtras.has(service.id)
              const servicePrice = service.perNight ? service.price * nights : service.price
              return (
                <label
                  key={service.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    checked ? "border-[#1a56db] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleExtra(service.id)}
                    className="sr-only"
                  />
                  <div
                    className={`size-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      checked ? "border-[#1a56db] bg-[#1a56db]" : "border-gray-300"
                    }`}
                  >
                    {checked && (
                      <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.perNight && (
                      <p className="text-xs text-gray-400">{formatPrice(service.price)} × {nights} ноч.</p>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 shrink-0">{formatPrice(servicePrice)}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Promo Code */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="size-5 text-[#1a56db]" />
          <h3 className="text-lg font-semibold text-gray-900">Промокод</h3>
        </div>

        {promoResult ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <div className="flex-1">
              <p className="font-medium text-green-800">{promoResult.code}</p>
              <p className="text-sm text-green-600">
                Скидка {promoResult.discountType === "PERCENT" ? `${promoResult.discountValue}%` : formatPrice(promoResult.discountValue)} применена
              </p>
            </div>
            <button onClick={handleRemovePromo} className="text-green-600 hover:text-green-800 transition-colors">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null) }}
              onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
              placeholder="Введите промокод"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent uppercase"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoCode.trim()}
              className="shrink-0"
            >
              {promoLoading ? <Loader2 className="size-4 animate-spin" /> : "Применить"}
            </Button>
          </div>
        )}

        {promoError && (
          <p className="text-sm text-red-600">{promoError}</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Способ оплаты</h3>
        <div className="space-y-3">
          <label
            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "on_arrival"
                ? "border-[#1a56db] bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="on_arrival"
              checked={paymentMethod === "on_arrival"}
              onChange={() => setPaymentMethod("on_arrival")}
              className="sr-only"
            />
            <div
              className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === "on_arrival"
                  ? "border-[#1a56db]"
                  : "border-gray-300"
              }`}
            >
              {paymentMethod === "on_arrival" && (
                <div className="size-2.5 rounded-full bg-[#1a56db]" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">Оплатить при заезде</p>
              <p className="text-sm text-gray-500">Наличными или картой на ресепшн</p>
            </div>
          </label>

          <label
            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "online"
                ? "border-[#1a56db] bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
              className="sr-only"
            />
            <div
              className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === "online"
                  ? "border-[#1a56db]"
                  : "border-gray-300"
              }`}
            >
              {paymentMethod === "online" && (
                <div className="size-2.5 rounded-full bg-[#1a56db]" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">Оплатить онлайн</p>
              <p className="text-sm text-gray-500">Банковской картой онлайн через Stripe</p>
            </div>
            <CreditCard className="size-5 text-[#1a56db] ml-auto shrink-0" />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          Назад
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-[#1a56db] text-white hover:bg-[#1e429f]"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {paymentMethod === "online" ? "Переход к оплате..." : "Подтверждение..."}
            </>
          ) : paymentMethod === "online" ? (
            "Оплатить онлайн"
          ) : (
            "Подтвердить бронирование"
          )}
        </Button>
      </div>
    </div>
  )
}
