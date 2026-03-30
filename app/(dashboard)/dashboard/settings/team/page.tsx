"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Settings,
  Plug,
  Users,
  CreditCard,
  UserPlus,
  Trash2,
  Loader2,
  Crown,
  Shield,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

const settingsTabs = [
  { label: "Профиль отеля", href: "/dashboard/settings", icon: Settings },
  { label: "Интеграции", href: "/dashboard/settings/integrations", icon: Plug },
  { label: "Команда", href: "/dashboard/settings/team", icon: Users },
  { label: "Тариф и оплата", href: "/dashboard/settings/billing", icon: CreditCard },
]

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Владелец",
  ADMIN: "Администратор",
  STAFF: "Персонал",
}

const ROLE_ICONS: Record<string, React.ComponentType<any>> = {
  OWNER: Crown,
  ADMIN: Shield,
  STAFF: User,
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-yellow-100 text-yellow-800",
  ADMIN: "bg-[#1b4332]/10 text-[#1b4332]",
  STAFF: "bg-muted text-foreground",
}

interface Member {
  id: string
  hotelId: string
  userId: string
  role: string
  isOwner: boolean
  user: {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
  }
  createdAt: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "STAFF">("STAFF")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/team')
      const data = await res.json()
      if (Array.isArray(data)) {
        setMembers(data)
      }
    } catch {
      setError("Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setInviteLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ошибка при добавлении")
      } else {
        setSuccess(`Пользователь ${inviteEmail} добавлен в команду`)
        setInviteEmail("")
        setTimeout(() => setSuccess(""), 3000)
        await fetchMembers()
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDelete = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Удалить ${memberEmail} из команды?`)) return

    setDeleteLoadingId(memberId)
    setError("")

    try {
      const res = await fetch(`/api/team?memberId=${memberId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ошибка при удалении")
      } else {
        setSuccess("Участник удалён из команды")
        setTimeout(() => setSuccess(""), 3000)
        await fetchMembers()
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setDeleteLoadingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Настройки</h1>

      {/* Settings navigation tabs */}
      <div className="flex gap-1 mb-8 border-b border-border">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.href === "/dashboard/settings/team"
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-[#1b4332] text-[#1b4332]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="space-y-6">
        {/* Current members */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Участники команды</h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет участников</p>
          ) : (
            <div className="divide-y divide-border">
              {members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role] || User
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                        {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[member.role] || "bg-muted text-foreground"}`}
                      >
                        <RoleIcon className="size-3" />
                        {ROLE_LABELS[member.role] || member.role}
                      </span>

                      {!member.isOwner && (
                        <button
                          onClick={() => handleDelete(member.id, member.user.email)}
                          disabled={deleteLoadingId === member.id}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Удалить из команды"
                        >
                          {deleteLoadingId === member.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Invite member */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Пригласить участника</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Добавьте нового участника команды по email. Если пользователь ещё не зарегистрирован, он будет создан автоматически.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  placeholder="staff@myhotel.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Роль
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "STAFF")}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="STAFF">Персонал</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle className="size-4 shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={inviteLoading}
              className="flex items-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {inviteLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Пригласить
            </button>
          </form>
        </section>

        {/* Role descriptions */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Описание ролей</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                role: "OWNER",
                icon: Crown,
                description: "Полный доступ ко всем функциям, настройкам и данным. Может управлять командой и подпиской.",
              },
              {
                role: "ADMIN",
                icon: Shield,
                description: "Доступ ко всем функциям кроме настроек оплаты и удаления отеля. Может управлять персоналом.",
              },
              {
                role: "STAFF",
                icon: User,
                description: "Базовый доступ: бронирования, гости, календарь. Нет доступа к финансовым и системным настройкам.",
              },
            ].map(({ role, icon: Icon, description }) => (
              <div key={role} className="space-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[role]}`}
                >
                  <Icon className="size-3" />
                  {ROLE_LABELS[role]}
                </span>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
