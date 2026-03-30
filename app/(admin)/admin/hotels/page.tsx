"use client"

import { useState, useEffect, useCallback } from "react"

type Hotel = {
  id: string
  name: string
  slug: string
  plan: string
  ownerEmail: string
  ownerName: string | null
  roomsCount: number
  bookingsCount: number
  guestsCount: number
  currency: string
  country: string
  createdAt: string
}

const PLANS = ["FREE", "STARTER", "PRO", "ENTERPRISE"] as const

const planColors: Record<string, string> = {
  FREE: "bg-muted text-foreground",
  STARTER: "bg-[#2d6a4f]/10 text-[#2d6a4f]",
  PRO: "bg-[#d4a373]/20 text-[#b8884a]",
  ENTERPRISE: "bg-[#1b4332]/10 text-[#1b4332]",
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filterPlan, setFilterPlan] = useState("")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", "20")
    if (search) params.set("search", search)
    if (filterPlan) params.set("plan", filterPlan)

    try {
      const res = await fetch(`/api/admin/hotels?${params}`)
      if (res.ok) {
        const data = await res.json()
        setHotels(data.hotels)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, filterPlan])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  async function handlePlanChange(hotelId: string, newPlan: string) {
    setUpdatingId(hotelId)
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      })
      if (res.ok) {
        setHotels((prev) =>
          prev.map((h) => (h.id === hotelId ? { ...h, plan: newPlan } : h))
        )
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground,#111)] mb-6">
        Управление отелями
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по названию, slug, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-card,#fff)] text-[var(--color-foreground,#111)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]/30 focus:border-[#1b4332]"
        />
        <select
          value={filterPlan}
          onChange={(e) => {
            setFilterPlan(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-card,#fff)] text-[var(--color-foreground,#111)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]/30 focus:border-[#1b4332]"
        >
          <option value="">Все тарифы</option>
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-card,#fff)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border,#e5e7eb)] bg-[var(--color-background,#f8f9fa)]">
                <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Отель
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Владелец
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Тариф
                </th>
                <th className="text-center px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Номера
                </th>
                <th className="text-center px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Брони
                </th>
                <th className="text-center px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Гости
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Создан
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-[var(--color-muted-foreground,#6b7280)]"
                  >
                    Загрузка...
                  </td>
                </tr>
              ) : hotels.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-[var(--color-muted-foreground,#6b7280)]"
                  >
                    Отели не найдены
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr
                    key={hotel.id}
                    className="border-b border-[var(--color-border,#e5e7eb)] hover:bg-[var(--color-background,#f8f9fa)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--color-foreground,#111)]">
                        {hotel.name}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground,#6b7280)]">
                        /{hotel.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--color-foreground,#111)]">
                        {hotel.ownerName || "—"}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground,#6b7280)]">
                        {hotel.ownerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={hotel.plan}
                          onChange={(e) =>
                            handlePlanChange(hotel.id, e.target.value)
                          }
                          disabled={updatingId === hotel.id}
                          className={`appearance-none cursor-pointer px-3 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-[#1b4332]/30 ${planColors[hotel.plan]} ${updatingId === hotel.id ? "opacity-50" : ""}`}
                        >
                          {PLANS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-foreground,#111)]">
                      {hotel.roomsCount}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-foreground,#111)]">
                      {hotel.bookingsCount}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-foreground,#111)]">
                      {hotel.guestsCount}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground,#6b7280)] text-xs">
                      {new Date(hotel.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border,#e5e7eb)]">
            <p className="text-sm text-[var(--color-muted-foreground,#6b7280)]">
              Всего: {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-card,#fff)] text-[var(--color-foreground,#111)] disabled:opacity-40 hover:bg-[var(--color-background,#f8f9fa)] transition-colors"
              >
                Назад
              </button>
              <span className="px-3 py-1.5 text-sm text-[var(--color-muted-foreground,#6b7280)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-card,#fff)] text-[var(--color-foreground,#111)] disabled:opacity-40 hover:bg-[var(--color-background,#f8f9fa)] transition-colors"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
