"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface BookingActionsProps {
  bookingId: string
  status: string
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const router = useRouter()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed")

      const statusLabels: Record<string, string> = {
        CHECKED_IN: "Гость заселён",
        CHECKED_OUT: "Гость выселен",
        CANCELLED: "Бронь отменена",
      }
      toast.success(statusLabels[newStatus] ?? "Статус обновлён")
      router.refresh()
    } catch {
      toast.error("Ошибка при обновлении статуса")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      {status === "CONFIRMED" && (
        <Button
          size="sm"
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => updateStatus("CHECKED_IN")}
          disabled={isUpdating}
        >
          <LogIn className="size-4 mr-2" />
          Заселить
        </Button>
      )}

      {status === "CHECKED_IN" && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => updateStatus("CHECKED_OUT")}
          disabled={isUpdating}
        >
          <LogOut className="size-4 mr-2" />
          Выселить
        </Button>
      )}

      {status !== "CANCELLED" && status !== "CHECKED_OUT" && (
        <Button
          size="sm"
          variant="destructive"
          className="w-full"
          onClick={() => setCancelDialogOpen(true)}
          disabled={isUpdating}
        >
          <XCircle className="size-4 mr-2" />
          Отменить
        </Button>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить бронь?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отменить эту бронь? Это действие нельзя легко отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Назад
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setCancelDialogOpen(false)
                await updateStatus("CANCELLED")
              }}
            >
              Отменить бронь
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
