"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Props {
  defaultMethod?: string
  defaultStatus?: string
  defaultDateFrom?: string
  defaultDateTo?: string
}

export function PaymentFilters({
  defaultMethod,
  defaultStatus,
  defaultDateFrom,
  defaultDateTo,
}: Props) {
  return (
    <form method="GET" className="flex flex-wrap gap-3 mb-6">
      <input
        type="date"
        name="dateFrom"
        defaultValue={defaultDateFrom}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="date"
        name="dateTo"
        defaultValue={defaultDateTo}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        name="method"
        defaultValue={defaultMethod ?? ""}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Все методы</option>
        <option value="STRIPE">Stripe</option>
        <option value="KASPI">Kaspi</option>
        <option value="CASH">Наличные</option>
        <option value="BANK_TRANSFER">Перевод</option>
        <option value="OTHER">Другое</option>
      </select>
      <select
        name="status"
        defaultValue={defaultStatus ?? ""}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Все статусы</option>
        <option value="succeeded">Успешно</option>
        <option value="pending">Ожидает</option>
        <option value="failed">Ошибка</option>
        <option value="refunded">Возврат</option>
      </select>
      <Button type="submit" variant="outline">
        Применить
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => (window.location.href = "/dashboard/payments")}
      >
        Сбросить
      </Button>
    </form>
  )
}
