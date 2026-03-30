"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, Hotel, BarChart3, Percent, Calendar, XCircle } from "lucide-react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { SourceChart } from "@/components/dashboard/source-chart"

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

interface Stats {
  totalRevenue: number
  totalBookings: number
  avgOccupancy: number
  adr: number
  revpar: number
  cancellationRate: number
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([])
  const [sourceData, setSourceData] = useState<SourceData[]>([])
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalBookings: 0,
    avgOccupancy: 0,
    adr: 0,
    revpar: 0,
    cancellationRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [revenueRes, occupancyRes, sourceRes] = await Promise.all([
        fetch(`/api/reports/revenue?period=${period}`),
        fetch(`/api/reports/occupancy?period=${period}`),
        fetch(`/api/bookings?period=${period}&limit=1000`),
      ])

      const [revenueJson, occupancyJson, bookingsJson] = await Promise.all([
        revenueRes.json(),
        occupancyRes.json(),
        sourceRes.json(),
      ])

      const revData: RevenueData[] = revenueJson.data ?? []
      const occData: OccupancyData[] = occupancyJson.data ?? []

      setRevenueData(revData)
      setOccupancyData(occData)

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

      // Cancellation rate — approximate from bookings endpoint
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
    } catch (err) {
      console.error("Failed to fetch reports data", err)
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">
          Аналитика и отчёты
        </h1>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
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

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Общая выручка"
          value={isLoading ? "..." : formatPrice(stats.totalRevenue)}
          icon={TrendingUp}
          iconClassName="text-blue-500"
        />
        <StatCard
          label="Средний ADR"
          value={isLoading ? "..." : formatPrice(stats.adr)}
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
        ) : (
          <RevenueChart data={revenueData} />
        )}
      </div>

      {/* Occupancy + Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <h2 className="font-medium text-gray-900 mb-4">Источники броней</h2>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              Загрузка...
            </div>
          ) : (
            <SourceChart data={sourceData} />
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: string
  icon: React.ElementType
  iconClassName?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className={`size-4 ${iconClassName ?? "text-gray-400"}`} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
