"use client"

import {
  BarChart,
  Bar,
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
  occupancy: number
  rooms_occupied: number
  rooms_total: number
}

interface Props {
  data: DataPoint[]
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

  const d = payload[0]?.payload as DataPoint | undefined

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{formatDate(label)}</p>
      <p className="text-green-600">Занятость: {payload[0]?.value}%</p>
      {d && (
        <p className="text-gray-500">
          Номеров: {d.rooms_occupied} / {d.rooms_total}
        </p>
      )}
    </div>
  )
}

export function OccupancyChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Нет данных за выбранный период
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="occupancy"
          fill="#22c55e"
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
