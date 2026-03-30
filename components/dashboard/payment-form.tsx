"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const PAYMENT_METHODS = [
  { value: "CASH", label: "Наличные" },
  { value: "KASPI", label: "Kaspi" },
  { value: "BANK_TRANSFER", label: "Перевод" },
  { value: "STRIPE", label: "Stripe" },
  { value: "OTHER", label: "Другое" },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(amount) + " ₸"
}

interface PaymentFormProps {
  bookingId: string
  totalPrice: number
  paidAmount: number
  paymentStatus: string
  status: string
}

export function PaymentForm({
  bookingId,
  totalPrice,
  paidAmount,
  paymentStatus,
  status,
}: PaymentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const remaining = totalPrice - paidAmount

  const [amount, setAmount] = useState(String(remaining > 0 ? remaining : 0))
  const [method, setMethod] = useState("CASH")
  const [notes, setNotes] = useState("")

  if (paymentStatus === "PAID" || status === "CANCELLED") {
    return null
  }

  const handleOpen = () => {
    setAmount(String(remaining > 0 ? remaining : 0))
    setMethod("CASH")
    setNotes("")
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Укажите корректную сумму")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: amountNum,
          method,
          notes: notes.trim() || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error ?? "Ошибка при записи оплаты")
      }

      toast.success("Оплата записана")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message ?? "Ошибка при записи оплаты")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="border-t border-gray-100 pt-3 mt-3">
        {remaining > 0 && (
          <p className="text-sm font-semibold text-red-600 mb-3">
            Осталось к оплате: {formatPrice(remaining)}
          </p>
        )}
        <Button
          size="sm"
          className="w-full"
          onClick={handleOpen}
        >
          <CreditCard className="size-4 mr-2" />
          Записать оплату
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Записать оплату</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {remaining > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-700">
                  Осталось к оплате: {formatPrice(remaining)}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Сумма (₸) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                step={1}
                required
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Метод оплаты
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Заметка (необязательно)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Комментарий к оплате..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Записать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
