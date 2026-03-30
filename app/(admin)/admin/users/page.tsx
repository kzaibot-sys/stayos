"use client"

import { useState, useEffect, useCallback } from "react"

type User = {
  id: string
  name: string | null
  email: string
  role: string
  hotelsOwned: number
  memberships: number
  createdAt: string
}

const ROLES = ["SUPER_ADMIN", "OWNER", "ADMIN", "STAFF"] as const

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  OWNER: "bg-[#1b4332]/10 text-[#1b4332]",
  ADMIN: "bg-[#d4a373]/20 text-[#b8884a]",
  STAFF: "bg-gray-100 text-gray-700",
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Супер-админ",
  OWNER: "Владелец",
  ADMIN: "Администратор",
  STAFF: "Сотрудник",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", "20")
    if (search) params.set("search", search)
    if (filterRole) params.set("role", filterRole)

    try {
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, filterRole])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground,#111)] mb-6">
        Пользователи
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-card,#fff)] text-[var(--color-foreground,#111)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]/30 focus:border-[#1b4332]"
        />
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-card,#fff)] text-[var(--color-foreground,#111)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332]/30 focus:border-[#1b4332]"
        >
          <option value="">Все роли</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
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
                  Пользователь
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Роль
                </th>
                <th className="text-center px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Свои отели
                </th>
                <th className="text-center px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Членства
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted-foreground,#6b7280)]">
                  Дата регистрации
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-[var(--color-muted-foreground,#6b7280)]"
                  >
                    Загрузка...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-[var(--color-muted-foreground,#6b7280)]"
                  >
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--color-border,#e5e7eb)] hover:bg-[var(--color-background,#f8f9fa)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[var(--color-foreground,#111)]">
                          {user.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-foreground,#111)]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColors[user.role] || "bg-gray-100 text-gray-700"}`}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-foreground,#111)]">
                      {user.hotelsOwned}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-foreground,#111)]">
                      {user.memberships}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground,#6b7280)] text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
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
