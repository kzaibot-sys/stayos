"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Clock, Car, MessageSquare, XCircle } from "lucide-react"

interface Props {
  bookingId: string
  bookingNumber: string
  canCancel: boolean
  withinFreeCancellation: boolean
  cancellationPenalty: number
  hotelSlug: string
}

export function GuestPreArrivalForm({
  bookingId,
  bookingNumber,
  canCancel,
  withinFreeCancellation,
  cancellationPenalty,
  hotelSlug,
}: Props) {
  const [arrivalTime, setArrivalTime] = useState("")
  const [transport, setTransport] = useState("")
  const [requests, setRequests] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelled, setCancelled] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pre-arrival`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrivalTime, transport, requests }),
      })
      if (res.ok) {
        setSaved(true)
        toast.success("Информация сохранена")
      } else {
        const d = await res.json()
        toast.error(d.error || "Ошибка сохранения")
      }
    } catch {
      toast.error("Ошибка сети")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason }),
      })
      if (res.ok) {
        setCancelled(true)
        toast.success("Бронирование отменено")
        setShowCancelConfirm(false)
      } else {
        const d = await res.json()
        toast.error(d.error || "Ошибка отмены")
      }
    } catch {
      toast.error("Ошибка сети")
    } finally {
      setCancelling(false)
    }
  }

  if (cancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <XCircle className="size-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 mb-1">Бронирование отменено</h3>
        <p className="text-red-600 text-sm">Ваше бронирование #{bookingNumber} было успешно отменено.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pre-arrival form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Информация о прибытии</h2>
        {saved ? (
          <div className="text-center py-4">
            <p className="text-green-700 font-medium">Спасибо! Ваша информация сохранена.</p>
            <button
              onClick={() => setSaved(false)}
              className="text-sm text-[#1b4332] mt-2 hover:underline"
            >
              Изменить
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Clock className="size-4 text-gray-400" />
                Ожидаемое время прибытия
              </label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Car className="size-4 text-gray-400" />
                Способ прибытия
              </label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="">Выберите...</option>
                <option value="own_car">На своём автомобиле</option>
                <option value="taxi">Такси</option>
                <option value="airplane">Самолёт</option>
                <option value="train">Поезд</option>
                <option value="bus">Автобус</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MessageSquare className="size-4 text-gray-400" />
                Особые пожелания
              </label>
              <textarea
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                rows={3}
                placeholder="Любые особые пожелания к заезду..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Сохранить информацию
            </button>
          </form>
        )}
      </div>

      {/* Cancel booking */}
      {canCancel && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Отмена бронирования</h2>
          {!withinFreeCancellation && cancellationPenalty > 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              Внимание: отмена после льготного периода влечёт штраф {cancellationPenalty}% от стоимости.
            </p>
          )}

          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 hover:border-red-300 rounded-lg px-4 py-2 transition-colors"
            >
              <XCircle className="size-4" />
              Отменить бронирование
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Пожалуйста, укажите причину отмены:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Причина отмены (необязательно)..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {cancelling && <Loader2 className="size-4 animate-spin" />}
                  Подтвердить отмену
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
