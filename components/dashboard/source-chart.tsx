"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DataPoint {
  source: string
  count: number
}

interface Props {
  data: DataPoint[]
}

const SOURCE_LABELS: Record<string, string> = {
  DIRECT: "Прямое",
  WIDGET: "Виджет",
  MANUAL: "Вручную",
  BOOKING_COM: "Booking.com",
  AIRBNB: "Airbnb",
  OTHER: "Другое",
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-sm">
      <p className="font-medium text-foreground">{payload[0]?.name}</p>
      <p className="text-muted-foreground">Броней: {payload[0]?.value}</p>
    </div>
  )
}

export function SourceChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Нет данных
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: SOURCE_LABELS[d.source] ?? d.source,
    value: d.count,
  }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          outerRadius={80}
          dataKey="value"
          label={false}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
