"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, RotateCcw } from "lucide-react"

interface RefundButtonProps {
  paymentId: string
  maxAmount: number
}

export function RefundButton({ paymentId, maxAmount }: RefundButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(Math.round(maxAmount)))
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRefund() {
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0 || parsedAmount > maxAmount) {
      toast.error(`Сумма должна быть от 1 до ${Math.round(maxAmount)}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/payments/${paymentId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, notes: notes || undefined }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Ошибка при возврате")
        return
      }

      toast.success("Возврат выполнен успешно")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Произошла ошибка")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-xs shrink-0"
      >
        <RotateCcw className="size-3 mr-1" />
        Возврат
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-40 shrink-0">
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        max={maxAmount}
        min={1}
        step={1}
        className="border border-gray-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
        placeholder="Сумма"
      />
      <input
        type="text"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
        placeholder="Причина (необязательно)"
      />
      <div className="flex gap-1">
        <Button
          size="sm"
          onClick={handleRefund}
          disabled={loading}
          className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : "OK"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="text-xs"
        >
          ✕
        </Button>
      </div>
    </div>
  )
}
