"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import {
  MoreVertical,
  Eye,
  LogIn,
  LogOut,
  XCircle,
  CalendarOff,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// ─── Status configs ────────────────────────────────────────────────────────

const bookingStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Ожидает", className: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Подтверждена", className: "bg-blue-100 text-blue-700" },
  CHECKED_IN: { label: "Заселён", className: "bg-green-100 text-green-700" },
  CHECKED_OUT: { label: "Выселился", className: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "Отменена", className: "bg-red-100 text-red-700" },
  NO_SHOW: { label: "Не приехал", className: "bg-orange-100 text-orange-700" },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  UNPAID: { label: "Не оплачено", className: "bg-red-100 text-red-700" },
  PARTIAL: { label: "Частично", className: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Оплачено", className: "bg-green-100 text-green-700" },
  REFUNDED: { label: "Возврат", className: "bg-gray-100 text-gray-700" },
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  bookingNumber: string
  guestFirstName: string
  guestLastName: string
  guestEmail: string | null
  guestPhone: string | null
  checkIn: string
  checkOut: string
  nights: number
  status: string
  paymentStatus: string
  totalPrice: number
  room: {
    id: string
    name: string
    roomNumber: string | null
    type: string
  }
}

interface BookingTableProps {
  bookings: Booking[]
  total: number
  page: number
  limit: number
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return format(new Date(dateStr), "d MMM yyyy", { locale: ru })
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-KZ", {
    maximumFractionDigits: 0,
  }).format(amount) + " ₸"
}

// ─── Component ─────────────────────────────────────────────────────────────

export function BookingTable({ bookings, total, page, limit }: BookingTableProps) {
  const router = useRouter()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const totalPages = Math.ceil(total / limit)

  const updateStatus = async (id: string, status: string) => {
    setIsUpdating(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed")

      const statusLabels: Record<string, string> = {
        CHECKED_IN: "Гость заселён",
        CHECKED_OUT: "Гость выселен",
        CANCELLED: "Бронь отменена",
      }
      toast.success(statusLabels[status] ?? "Статус обновлён")
      router.refresh()
    } catch {
      toast.error("Ошибка при обновлении статуса")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return
    await updateStatus(bookingToCancel.id, "CANCELLED")
    setCancelDialogOpen(false)
    setBookingToCancel(null)
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
        <CalendarOff className="size-10 text-gray-300 mx-auto mb-4" />
        <p className="text-base font-medium text-gray-600 mb-1">Броней не найдено</p>
        <p className="text-sm text-muted-foreground">
          Попробуйте изменить фильтры или создайте новую бронь
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  № брони
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Гость
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Номер
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Заезд
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Выезд
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Ночей
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Статус
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Оплата
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Сумма
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const statusCfg = bookingStatusConfig[booking.status] ?? bookingStatusConfig["PENDING"]
                const paymentCfg = paymentStatusConfig[booking.paymentStatus] ?? paymentStatusConfig["UNPAID"]
                const isLoading = isUpdating === booking.id

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="font-mono text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        {booking.bookingNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {booking.guestFirstName} {booking.guestLastName}
                      </div>
                      {booking.guestPhone && (
                        <div className="text-xs text-gray-400">{booking.guestPhone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {booking.room.name}
                      {booking.room.roomNumber && (
                        <span className="text-gray-400 ml-1 text-xs">
                          #{booking.room.roomNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(booking.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(booking.checkOut)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">
                      {booking.nights}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${paymentCfg.className}`}
                      >
                        {paymentCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(booking.totalPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={isLoading}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/bookings/${booking.id}`}>
                              <Eye className="size-4 mr-2" />
                              Просмотр
                            </Link>
                          </DropdownMenuItem>

                          {booking.status === "CONFIRMED" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateStatus(booking.id, "CHECKED_IN")}
                              >
                                <LogIn className="size-4 mr-2" />
                                Заселить
                              </DropdownMenuItem>
                            </>
                          )}

                          {booking.status === "CHECKED_IN" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateStatus(booking.id, "CHECKED_OUT")}
                              >
                                <LogOut className="size-4 mr-2" />
                                Выселить
                              </DropdownMenuItem>
                            </>
                          )}

                          {booking.status !== "CANCELLED" &&
                            booking.status !== "CHECKED_OUT" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setBookingToCancel(booking)
                                    setCancelDialogOpen(true)
                                  }}
                                >
                                  <XCircle className="size-4 mr-2" />
                                  Отменить
                                </DropdownMenuItem>
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Показано {Math.min((page - 1) * limit + 1, total)}–
              {Math.min(page * limit, total)} из {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  params.set("page", String(page - 1))
                  router.push(`/dashboard/bookings?${params.toString()}`)
                }}
              >
                Назад
              </Button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  params.set("page", String(page + 1))
                  router.push(`/dashboard/bookings?${params.toString()}`)
                }}
              >
                Вперёд
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить бронь?</DialogTitle>
            <DialogDescription>
              {bookingToCancel && (
                <>
                  Вы уверены, что хотите отменить бронь{" "}
                  <strong>{bookingToCancel.bookingNumber}</strong> для гостя{" "}
                  <strong>
                    {bookingToCancel.guestFirstName} {bookingToCancel.guestLastName}
                  </strong>
                  ?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false)
                setBookingToCancel(null)
              }}
            >
              Назад
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm}>
              Отменить бронь
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
