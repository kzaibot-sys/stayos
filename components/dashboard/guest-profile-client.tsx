"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit2, X, Check, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const TAG_COLORS: Record<string, string> = {
  VIP: "bg-purple-100 text-purple-700",
  Постоянный: "bg-blue-100 text-blue-700",
  Проблемный: "bg-red-100 text-red-700",
  Корпоративный: "bg-orange-100 text-orange-700",
}

function getTagColor(tag: string) {
  return TAG_COLORS[tag] ?? "bg-gray-100 text-gray-700"
}

const PRESET_TAGS = ["VIP", "Постоянный", "Проблемный", "Корпоративный"]

interface GuestData {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  passportNumber: string | null
  nationality: string | null
  birthDate: string | null
  notes: string | null
  tags: string[]
}

interface Props {
  guest: GuestData
}

export function GuestProfileClient({ guest }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tags, setTags] = useState<string[]>(guest.tags)
  const [showTagPicker, setShowTagPicker] = useState(false)

  const [form, setForm] = useState({
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email ?? "",
    phone: guest.phone ?? "",
    passportNumber: guest.passportNumber ?? "",
    nationality: guest.nationality ?? "",
    birthDate: guest.birthDate ? guest.birthDate.slice(0, 10) : "",
    notes: guest.notes ?? "",
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/guests/${guest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || null,
          phone: form.phone || null,
          passportNumber: form.passportNumber || null,
          nationality: form.nationality || null,
          birthDate: form.birthDate || null,
          notes: form.notes || null,
          tags,
        }),
      })

      if (!res.ok) throw new Error("Failed to save")

      toast.success("Данные гостя обновлены")
      setIsEditing(false)
      router.refresh()
    } catch {
      toast.error("Ошибка при сохранении")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTag = async (tag: string) => {
    const newTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag]
    setTags(newTags)

    try {
      await fetch(`/api/guests/${guest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      })
      router.refresh()
    } catch {
      toast.error("Ошибка при обновлении тегов")
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-medium text-foreground">Информация о госте</h2>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="size-3.5 mr-1" />
            Редактировать
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <X className="size-3.5 mr-1" />
              Отмена
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Check className="size-3.5 mr-1" />
              Сохранить
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Фамилия
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Паспорт / ИИН
              </label>
              <input
                type="text"
                value={form.passportNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, passportNumber: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Гражданство
                </label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nationality: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Дата рождения
                </label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, birthDate: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Заметки
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </>
        ) : (
          <>
            <InfoRow label="Имя" value={`${guest.firstName} ${guest.lastName}`} />
            <InfoRow label="Email" value={guest.email} />
            <InfoRow label="Телефон" value={guest.phone} />
            <InfoRow label="Паспорт / ИИН" value={guest.passportNumber} />
            <InfoRow label="Гражданство" value={guest.nationality} />
            <InfoRow
              label="Дата рождения"
              value={
                guest.birthDate
                  ? new Date(guest.birthDate).toLocaleDateString("ru-RU")
                  : null
              }
            />
            {guest.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Заметки</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {guest.notes}
                </p>
              </div>
            )}
          </>
        )}

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Теги</p>
            <button
              onClick={() => setShowTagPicker((v) => !v)}
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
            >
              <Plus className="size-3 mr-0.5" />
              Добавить
            </button>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="hover:opacity-70"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-xs text-muted-foreground">Нет тегов</span>
            )}
          </div>

          {showTagPicker && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
              {PRESET_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    toggleTag(tag)
                    setShowTagPicker(false)
                  }}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed ${getTagColor(tag)} opacity-70 hover:opacity-100`}
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">
        {value ?? <span className="text-muted-foreground/50">—</span>}
      </p>
    </div>
  )
}
