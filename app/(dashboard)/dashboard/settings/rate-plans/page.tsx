"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/shared/empty-state"

interface RatePlan {
  id: string
  name: string
  description: string | null
  dateFrom: string
  dateTo: string
  multiplier: number
  isActive: boolean
}

interface RatePlanFormData {
  name: string
  description: string
  dateFrom: string
  dateTo: string
  multiplier: string
  isActive: boolean
}

const emptyForm: RatePlanFormData = {
  name: "",
  description: "",
  dateFrom: "",
  dateTo: "",
  multiplier: "1.0",
  isActive: true,
}

function toDateInput(iso: string) {
  return iso ? new Date(iso).toISOString().split("T")[0] : ""
}

export default function RatePlansPage() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RatePlanFormData>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchRatePlans = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/rate-plans")
      const json = await res.json()
      setRatePlans(json.ratePlans ?? [])
    } catch {
      toast.error("Не удалось загрузить тарифные планы")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRatePlans()
  }, [fetchRatePlans])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(plan: RatePlan) {
    setEditingId(plan.id)
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      dateFrom: toDateInput(plan.dateFrom),
      dateTo: toDateInput(plan.dateTo),
      multiplier: String(plan.multiplier),
      isActive: plan.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    const multiplier = parseFloat(form.multiplier)
    if (!form.name.trim()) {
      toast.error("Введите название")
      return
    }
    if (!form.dateFrom || !form.dateTo) {
      toast.error("Укажите даты")
      return
    }
    if (isNaN(multiplier) || multiplier <= 0) {
      toast.error("Некорректный множитель")
      return
    }

    setIsSaving(true)
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        dateFrom: form.dateFrom,
        dateTo: form.dateTo,
        multiplier,
        isActive: form.isActive,
      }

      const res = editingId
        ? await fetch(`/api/rate-plans/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/rate-plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Ошибка")
      }

      toast.success(editingId ? "Тарифный план обновлён" : "Тарифный план создан")
      setDialogOpen(false)
      fetchRatePlans()
    } catch (e: any) {
      toast.error(e.message || "Ошибка при сохранении")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/rate-plans/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Тарифный план удалён")
      setDeleteId(null)
      fetchRatePlans()
    } catch {
      toast.error("Ошибка при удалении")
    } finally {
      setIsDeleting(false)
    }
  }

  const multiplierToLabel = (m: number) => {
    if (m > 1) return `+${Math.round((m - 1) * 100)}% надбавка`
    if (m < 1) return `-${Math.round((1 - m) * 100)}% скидка`
    return "Базовая цена"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Тарифные планы
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Настройте сезонные наценки и скидки
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-2" />
          Добавить план
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : ratePlans.length === 0 ? (
        <EmptyState
          icon={<Tag className="size-12" />}
          title="Тарифных планов нет"
          description="Создайте сезонный план для автоматической корректировки цен в выбранный период"
        />
      ) : (
        <div className="space-y-3">
          {ratePlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-card rounded-xl border border-border px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{plan.name}</h3>
                  {!plan.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Неактивен
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-1">{plan.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    {format(new Date(plan.dateFrom), "d MMM yyyy", { locale: ru })} —{" "}
                    {format(new Date(plan.dateTo), "d MMM yyyy", { locale: ru })}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span
                    className={`font-medium ${
                      plan.multiplier > 1
                        ? "text-orange-600"
                        : plan.multiplier < 1
                        ? "text-green-600"
                        : "text-foreground"
                    }`}
                  >
                    ×{plan.multiplier} ({multiplierToLabel(plan.multiplier)})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(plan)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => setDeleteId(plan.id)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Редактировать тарифный план" : "Новый тарифный план"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Новогодние праздники"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Необязательное описание"
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dateFrom">Дата начала *</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={form.dateFrom}
                  onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Дата окончания *</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={form.dateTo}
                  onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="multiplier">
                Множитель цены *{" "}
                <span className="font-normal text-muted-foreground">
                  (1.0 = без изменений, 1.5 = +50%, 0.8 = −20%)
                </span>
              </Label>
              <Input
                id="multiplier"
                type="number"
                step="0.01"
                min="0.01"
                max="10"
                value={form.multiplier}
                onChange={(e) => setForm((f) => ({ ...f, multiplier: e.target.value }))}
                className="mt-1"
              />
              {form.multiplier && !isNaN(parseFloat(form.multiplier)) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {multiplierToLabel(parseFloat(form.multiplier))}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-border"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Активен
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить тарифный план?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Это действие нельзя отменить. Связанные бронирования не будут затронуты.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
