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
      <div className="border-t border-border pt-3 mt-3">
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
              <label className="block text-sm font-medium text-foreground">
                Сумма (₸) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                step={1}
                required
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Метод оплаты
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {method === "KASPI" && (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-3 bg-muted">
                <div className="w-20 h-20 mx-auto bg-card border border-border rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7zM5 5v3h3V5H5zm0 11v3h3v-3H5zm11-11v3h3V5h-3zm0 11v3h3v-3h-3z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">
                  Покажите QR код гостю для оплаты через Kaspi
                </p>
                <p className="text-xs text-muted-foreground">
                  Интеграция с Kaspi QR будет добавлена в следующем обновлении
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Заметка (необязательно)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Комментарий к оплате..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
