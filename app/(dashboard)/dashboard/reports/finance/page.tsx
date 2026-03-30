"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, CreditCard, BarChart3, ArrowLeft } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount) + " ₸"
}

const METHOD_LABELS: Record<string, string> = {
  STRIPE: "Stripe",
  KASPI: "Kaspi",
  CASH: "Наличные",
  BANK_TRANSFER: "Перевод",
  OTHER: "Другое",
}

const PIE_COLORS = ["#1a56db", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]

interface Summary {
  totalRevenue: number
  avgCheck: number
  totalBookings: number
}

interface MethodRevenue {
  method: string
  total: number
}

interface MonthlyTotal {
  month: string
  revenue: number
  bookings: number
}

interface TopRoom {
  roomId: string
  roomName: string
  revenue: number
  bookings: number
}

interface FinanceData {
  summary: Summary
  revenueByMethod: MethodRevenue[]
  monthlyTotals: MonthlyTotal[]
  topRooms: TopRoom[]
}

export default function FinanceDashboardPage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reports/finance")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pieData = data?.revenueByMethod.map((m) => ({
    name: METHOD_LABELS[m.method] ?? m.method,
    value: m.total,
  })) ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/reports">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Отчёты
          </button>
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Финансовый дашборд
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Загрузка...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Общая выручка"
              value={formatPrice(data?.summary.totalRevenue ?? 0)}
              icon={TrendingUp}
              color="text-blue-500"
            />
            <SummaryCard
              label="Средний чек"
              value={formatPrice(data?.summary.avgCheck ?? 0)}
              icon={BarChart3}
              color="text-green-500"
            />
            <SummaryCard
              label="Расходы"
              value="—"
              icon={CreditCard}
              color="text-red-500"
              note="Скоро"
            />
            <SummaryCard
              label="Прибыль"
              value="—"
              icon={TrendingUp}
              color="text-purple-500"
              note="Скоро"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly revenue bar chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-medium text-foreground mb-4">Выручка по месяцам (последние 6 мес.)</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.monthlyTotals ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}M`
                        : v >= 1000
                        ? `${(v / 1000).toFixed(0)}K`
                        : String(v)
                    }
                  />
                  <Tooltip
                    formatter={(value) => [formatPrice(Number(value)), "Выручка"]}
                  />
                  <Bar dataKey="revenue" fill="#1a56db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by payment method pie */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-medium text-foreground mb-4">Выручка по методу оплаты</h2>
              {pieData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                  Нет данных
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => formatPrice(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top rooms table */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-medium text-foreground mb-4">Топ номеров по выручке</h2>
            {(data?.topRooms ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">Нет данных</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Номер</th>
                    <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Броней</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topRooms.map((room, i) => (
                    <tr key={room.roomId} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">
                        <span className="text-muted-foreground mr-2">#{i + 1}</span>
                        {room.roomName}
                      </td>
                      <td className="text-right py-2.5 pr-4 text-muted-foreground">{room.bookings}</td>
                      <td className="text-right py-2.5 font-semibold text-foreground">
                        {formatPrice(room.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  note,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  note?: string
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${color}`} />
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
    </div>
  )
}
