"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  TrendingUp,
  Hotel,
  BarChart3,
  Percent,
  Calendar,
  XCircle,
  DollarSign,
  Download,
} from "lucide-react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { SourceChart } from "@/components/dashboard/source-chart"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

type Period = "7d" | "30d" | "90d" | "1y"

const PERIODS: { label: string; value: Period }[] = [
  { label: "7 дней", value: "7d" },
  { label: "30 дней", value: "30d" },
  { label: "3 месяца", value: "90d" },
  { label: "Год", value: "1y" },
]

function formatPrice(amount: number) {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
      amount
    ) + " ₸"
  )
}

function formatPercent(val: number) {
  return `${Math.round(val)}%`
}

interface RevenueData {
  date: string
  revenue: number
  bookings: number
}

interface OccupancyData {
  date: string
  occupancy: number
  rooms_occupied: number
  rooms_total: number
}

interface SourceData {
  source: string
  count: number
}

interface ForecastDay {
  date: string
  occupancy: number
  bookings: number
  rooms_total: number
}

interface TopRoom {
  roomId: string
  roomName: string
  roomNumber: string | null
  type: string
  bookings: number
  revenue: number
  occupancy: number
  avgPrice: number
}

interface Stats {
  totalRevenue: number
  totalBookings: number
  avgOccupancy: number
  adr: number
  revpar: number
  cancellationRate: number
}

function formatShortDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "d MMM", { locale: ru })
  } catch {
    return dateStr
  }
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [prevRevenueData, setPrevRevenueData] = useState<RevenueData[]>([])
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([])
  const [sourceData, setSourceData] = useState<SourceData[]>([])
  const [forecastData, setForecastData] = useState<ForecastDay[]>([])
  const [topRooms, setTopRooms] = useState<TopRoom[]>([])
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalBookings: 0,
    avgOccupancy: 0,
    adr: 0,
    revpar: 0,
    cancellationRate: 0,
  })
  const [prevStats, setPrevStats] = useState<Stats | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [revenueRes, occupancyRes, sourceRes, forecastRes, topRoomsRes] =
        await Promise.all([
          fetch(`/api/reports/revenue?period=${period}`),
          fetch(`/api/reports/occupancy?period=${period}`),
          fetch(`/api/bookings?period=${period}&limit=1000`),
          fetch(`/api/reports/forecast`),
          fetch(`/api/reports/top-rooms?period=${period}`),
        ])

      const [revenueJson, occupancyJson, bookingsJson, forecastJson, topRoomsJson] =
        await Promise.all([
          revenueRes.json(),
          occupancyRes.json(),
          sourceRes.json(),
          forecastRes.json(),
          topRoomsRes.json(),
        ])

      const revData: RevenueData[] = revenueJson.data ?? []
      const occData: OccupancyData[] = occupancyJson.data ?? []

      setRevenueData(revData)
      setOccupancyData(occData)
      setForecastData(forecastJson.data ?? [])
      setTopRooms(topRoomsJson.byRevenue ?? [])

      // Source distribution from bookings
      const sourceMap: Record<string, number> = {}
      for (const b of (bookingsJson.bookings ?? []) as any[]) {
        const s = b.source ?? "OTHER"
        sourceMap[s] = (sourceMap[s] ?? 0) + 1
      }
      const srcArr = Object.entries(sourceMap).map(([source, count]) => ({
        source,
        count,
      }))
      setSourceData(srcArr)

      // Compute stats
      const totalRevenue = revenueJson.total?.revenue ?? 0
      const totalBookings = revenueJson.total?.bookings ?? 0

      const avgOccupancy =
        occData.length > 0
          ? occData.reduce((sum, d) => sum + d.occupancy, 0) / occData.length
          : 0

      const totalRoomsAvailable =
        occData.length > 0 && occData[0]?.rooms_total
          ? occData[0].rooms_total * occData.length
          : 1

      const adr = totalBookings > 0 ? totalRevenue / totalBookings : 0
      const revpar = totalRevenue / Math.max(totalRoomsAvailable, 1)

      const allBookings: any[] = bookingsJson.bookings ?? []
      const cancelled = allBookings.filter(
        (b) => b.status === "CANCELLED" || b.status === "NO_SHOW"
      ).length
      const cancellationRate =
        allBookings.length > 0 ? (cancelled / allBookings.length) * 100 : 0

      setStats({
        totalRevenue,
        totalBookings,
        avgOccupancy,
        adr,
        revpar,
        cancellationRate,
      })

      // Fetch previous period for comparison
      if (compareMode) {
        const prevRes = await fetch(
          `/api/reports/revenue?period=${period}&shift=prev`
        )
        if (prevRes.ok) {
          const prevJson = await prevRes.json()
          setPrevRevenueData(prevJson.data ?? [])
          const prevTotalRevenue = prevJson.total?.revenue ?? 0
          const prevTotalBookings = prevJson.total?.bookings ?? 0
          setPrevStats({
            totalRevenue: prevTotalRevenue,
            totalBookings: prevTotalBookings,
            avgOccupancy: 0,
            adr: prevTotalBookings > 0 ? prevTotalRevenue / prevTotalBookings : 0,
            revpar: 0,
            cancellationRate: 0,
          })
        }
      } else {
        setPrevRevenueData([])
        setPrevStats(null)
      }
    } catch (err) {
      console.error("Failed to fetch reports data", err)
    } finally {
      setIsLoading(false)
    }
  }, [period, compareMode])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function getDelta(current: number, prev: number | undefined): string {
    if (!prev || prev === 0) return ""
    const pct = ((current - prev) / prev) * 100
    const sign = pct >= 0 ? "+" : ""
    return `${sign}${Math.round(pct)}%`
  }

  // Merge revenue data for comparison chart
  const mergedRevenueData = revenueData.map((d, i) => ({
    date: d.date,
    revenue: d.revenue,
    prevRevenue: prevRevenueData[i]?.revenue ?? undefined,
  }))

  // Forecast color logic
  function getForecastColor(occupancy: number) {
    if (occupancy >= 80) return "#ef4444"
    if (occupancy >= 60) return "#f59e0b"
    return "#22c55e"
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Аналитика и отчёты
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/reports/finance">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
              <DollarSign className="size-4" />
              Финансы
            </button>
          </Link>
          <ExportDropdown />
        </div>
      </div>

      {/* Period selector + compare toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCompareMode((v) => !v)}
          className={`flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-1.5 border transition-colors ${
            compareMode
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <TrendingUp className="size-4" />
          Сравнить с прошлым периодом
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Общая выручка"
          value={isLoading ? "..." : formatPrice(stats.totalRevenue)}
          delta={
            prevStats
              ? getDelta(stats.totalRevenue, prevStats.totalRevenue)
              : undefined
          }
          icon={TrendingUp}
          iconClassName="text-blue-500"
        />
        <StatCard
          label="Средний ADR"
          value={isLoading ? "..." : formatPrice(stats.adr)}
          delta={
            prevStats ? getDelta(stats.adr, prevStats.adr) : undefined
          }
          icon={BarChart3}
          iconClassName="text-green-500"
        />
        <StatCard
          label="RevPAR"
          value={isLoading ? "..." : formatPrice(stats.revpar)}
          icon={Hotel}
          iconClassName="text-purple-500"
        />
        <StatCard
          label="Занятость"
          value={isLoading ? "..." : formatPercent(stats.avgOccupancy)}
          icon={Percent}
          iconClassName="text-orange-500"
        />
        <StatCard
          label="Всего броней"
          value={isLoading ? "..." : String(stats.totalBookings)}
          delta={
            prevStats
              ? getDelta(stats.totalBookings, prevStats.totalBookings)
              : undefined
          }
          icon={Calendar}
          iconClassName="text-teal-500"
        />
        <StatCard
          label="Процент отмен"
          value={isLoading ? "..." : formatPercent(stats.cancellationRate)}
          icon={XCircle}
          iconClassName="text-red-500"
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-medium text-gray-900 mb-4">Выручка по дням</h2>
        {isLoading ? (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
            Загрузка...
          </div>
        ) : compareMode && prevRevenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={288}>
            <AreaChart data={mergedRevenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prevRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tickFormatter={(v) => `${Math.round(v / 1000)}к`}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                formatter={(v: any, name: any) => [
                  formatPrice(Number(v)),
                  name === "revenue" ? "Текущий период" : "Прошлый период",
                ]}
                labelFormatter={(label: any) => formatShortDate(String(label))}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1a56db"
                fill="url(#revGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="prevRevenue"
                stroke="#94a3b8"
                fill="url(#prevRevGrad)"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <RevenueChart data={revenueData} />
        )}
      </div>

      {/* Occupancy + Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Занятость номеров</h2>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              Загрузка...
            </div>
          ) : (
            <OccupancyChart data={occupancyData} />
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-4">
            Источники бронирований
          </h2>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              Загрузка...
            </div>
          ) : (
            <SourceChart data={sourceData} />
          )}
        </div>
      </div>

      {/* Forecast chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-medium text-gray-900 mb-4">
          Прогноз занятости (следующие 30 дней)
        </h2>
        {isLoading ? (
          <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
            Загрузка...
          </div>
        ) : forecastData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
            Нет данных
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                {"< 60%"}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
                60–80%
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                {"> 80%"}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, "Занятость"]}
                  labelFormatter={(label: any) => formatShortDate(String(label))}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#22c55e"
                  fill="url(#forecastGrad)"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const color = getForecastColor(props.payload.occupancy)
                    return (
                      <circle
                        key={props.key}
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill={color}
                        stroke={color}
                      />
                    )
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Top rooms table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-medium text-gray-900 mb-4">Топ номеров</h2>
        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            Загрузка...
          </div>
        ) : topRooms.length === 0 ? (
          <p className="text-sm text-gray-400">Нет данных за период</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-2 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Номер
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-xs uppercase tracking-wide text-right">
                    Брони
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-xs uppercase tracking-wide text-right">
                    Выручка
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-xs uppercase tracking-wide text-right">
                    Загруженность
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-xs uppercase tracking-wide text-right">
                    Ср. чек
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topRooms.slice(0, 10).map((room) => (
                  <tr key={room.roomId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 font-medium text-gray-900">
                      {room.roomName}
                      {room.roomNumber && (
                        <span className="text-gray-400 font-normal ml-1">
                          #{room.roomNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {room.bookings}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {formatPrice(room.revenue)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`font-medium ${
                          room.occupancy >= 80
                            ? "text-red-600"
                            : room.occupancy >= 60
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {room.occupancy}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {formatPrice(room.avgPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: string
  delta?: string
  icon: React.ElementType
  iconClassName?: string
}) {
  const isPositive = delta?.startsWith("+")
  const isNegative = delta?.startsWith("-")

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className={`size-4 ${iconClassName ?? "text-gray-400"}`} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {delta && (
        <p
          className={`text-xs mt-1 font-medium ${
            isPositive
              ? "text-green-600"
              : isNegative
              ? "text-red-500"
              : "text-gray-400"
          }`}
        >
          vs прошлый период: {delta}
        </p>
      )}
    </div>
  )
}

const EXPORT_OPTIONS = [
  { label: "Бронирования", type: "bookings" },
  { label: "Гости", type: "guests" },
  { label: "Платежи", type: "payments" },
  { label: "Номера", type: "rooms" },
]

function ExportDropdown() {
  const [open, setOpen] = useState(false)

  function handleExport(type: string) {
    window.open(`/api/reports/export?type=${type}`, "_blank")
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
      >
        <Download className="size-4" />
        Экспорт
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg z-20 py-1">
            {EXPORT_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleExport(opt.type)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
