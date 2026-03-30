"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"

interface DataPoint {
  date: string
  revenue: number
  bookings: number
}

interface Props {
  data: DataPoint[]
}

function formatPrice(amount: number) {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
      amount
    ) + " ₸"
  )
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "d MMM", { locale: ru })
  } catch {
    return dateStr
  }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-sm">
      <p className="font-medium text-foreground mb-1">{formatDate(label)}</p>
      <p className="text-blue-600">
        Выручка: {formatPrice(payload[0]?.value ?? 0)}
      </p>
      {payload[1] && (
        <p className="text-muted-foreground">Броней: {payload[1]?.value}</p>
      )}
    </div>
  )
}

export function RevenueChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Нет данных за выбранный период
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) =>
            new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
              v
            )
          }
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#3b82f6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
