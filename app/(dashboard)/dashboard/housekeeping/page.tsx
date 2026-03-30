"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sparkles,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react"

type CleaningStatus = "CLEAN" | "DIRTY" | "CLEANING" | "INSPECTION"
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
type TaskType = "CLEANING" | "MAINTENANCE" | "INSPECTION"

interface Room {
  id: string
  name: string
  roomNumber?: string | null
  floor?: number | null
  cleaningStatus: CleaningStatus
}

interface Task {
  id: string
  roomId: string
  room: { id: string; name: string; roomNumber?: string | null; floor?: number | null }
  type: string
  status: TaskStatus
  priority: TaskPriority
  notes?: string | null
  checklist: string
  assignedTo?: { id: string; user: { name?: string | null; email: string } } | null
  createdAt: string
  completedAt?: string | null
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Ожидает",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  URGENT: "Срочный",
}

const TYPE_LABELS: Record<string, string> = {
  CLEANING: "Уборка",
  MAINTENANCE: "Обслуживание",
  INSPECTION: "Инспекция",
}

const CLEANING_STATUS_CONFIG: Record<
  CleaningStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  CLEAN: {
    label: "Чисто",
    bg: "bg-green-100 dark:bg-green-900",
    text: "text-green-800 dark:text-green-200",
    dot: "bg-green-500",
  },
  DIRTY: {
    label: "Грязно",
    bg: "bg-red-100 dark:bg-red-900",
    text: "text-red-800 dark:text-red-200",
    dot: "bg-red-500",
  },
  CLEANING: {
    label: "Уборка",
    bg: "bg-yellow-100 dark:bg-yellow-900",
    text: "text-yellow-800 dark:text-yellow-200",
    dot: "bg-yellow-500",
  },
  INSPECTION: {
    label: "Инспекция",
    bg: "bg-blue-100 dark:bg-blue-900",
    text: "text-blue-800 dark:text-blue-200",
    dot: "bg-blue-500",
  },
}

const TASK_FILTER_TABS: { label: string; value: string }[] = [
  { label: "Все", value: "" },
  { label: "Ожидают", value: "PENDING" },
  { label: "В работе", value: "IN_PROGRESS" },
  { label: "Завершены", value: "COMPLETED" },
]

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [filterStatus, setFilterStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState<Room | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // New task form
  const [form, setForm] = useState({
    roomId: "",
    type: "CLEANING" as TaskType,
    priority: "MEDIUM" as TaskPriority,
    notes: "",
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tasksRes, roomsRes] = await Promise.all([
        fetch(`/api/housekeeping${filterStatus ? `?status=${filterStatus}` : ""}`),
        fetch("/api/rooms"),
      ])
      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (roomsRes.ok) {
        const data = await roomsRes.json()
        setRooms(Array.isArray(data) ? data : data.rooms ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!form.roomId) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowDialog(false)
        setForm({ roomId: "", type: "CLEANING", priority: "MEDIUM", notes: "" })
        fetchData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    await fetch(`/api/housekeeping/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchData()
  }

  async function updateRoomCleaningStatus(roomId: string, cleaningStatus: CleaningStatus) {
    await fetch(`/api/rooms/${roomId}/cleaning`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cleaningStatus }),
    })
    setShowStatusDialog(null)
    fetchData()
  }

  const priorityColors: Record<TaskPriority, string> = {
    LOW: "bg-muted text-muted-foreground",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  }

  const taskStatusIcons: Record<TaskStatus, React.ReactNode> = {
    PENDING: <Clock className="size-4 text-muted-foreground" />,
    IN_PROGRESS: <Loader2 className="size-4 text-yellow-500 animate-spin" />,
    COMPLETED: <CheckCircle2 className="size-4 text-green-500" />,
    CANCELLED: <XCircle className="size-4 text-red-400" />,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-6 text-blue-600" />
            Уборка
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Управление задачами уборки и статусами номеров
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="size-4" />
            Обновить
          </button>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="size-4" />
            Создать задачу
          </button>
        </div>
      </div>

      {/* Room status overview */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Статус номеров
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">Номера не найдены</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {rooms.map((room) => {
              const cfg = CLEANING_STATUS_CONFIG[room.cleaningStatus ?? "CLEAN"]
              return (
                <button
                  key={room.id}
                  onClick={() => setShowStatusDialog(room)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left hover:opacity-90 transition-opacity ${cfg.bg} border-transparent`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className={`size-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className={`text-xs font-semibold truncate ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate w-full">
                    {room.name}
                  </p>
                  {room.roomNumber && (
                    <p className="text-xs text-muted-foreground">#{room.roomNumber}</p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Task filter tabs */}
      <div>
        <div className="flex items-center gap-1 border-b border-border mb-4">
          {TASK_FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                filterStatus === tab.value
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertCircle className="size-10 mb-3" />
            <p className="text-sm">Задач нет</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Номер
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Тип
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Приоритет
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Исполнитель
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{task.room.name}</p>
                      {task.room.roomNumber && (
                        <p className="text-xs text-muted-foreground">#{task.room.roomNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {TYPE_LABELS[task.type] ?? task.type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}
                      >
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {task.assignedTo?.user.name ?? task.assignedTo?.user.email ?? (
                        <span className="text-muted-foreground italic">Не назначен</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {taskStatusIcons[task.status]}
                        <span className="text-foreground">{STATUS_LABELS[task.status]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {task.status === "PENDING" && (
                          <button
                            onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                            className="rounded px-2 py-1 text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
                          >
                            В работу
                          </button>
                        )}
                        {task.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => updateTaskStatus(task.id, "COMPLETED")}
                            className="rounded px-2 py-1 text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                          >
                            Завершить
                          </button>
                        )}
                        {(task.status === "PENDING" || task.status === "IN_PROGRESS") && (
                          <button
                            onClick={() => updateTaskStatus(task.id, "CANCELLED")}
                            className="rounded px-2 py-1 text-xs bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          >
                            Отменить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create task dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Создать задачу уборки
            </h2>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Номер *
                </label>
                <select
                  value={form.roomId}
                  onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите номер</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.roomNumber ? ` #${r.roomNumber}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Тип задачи
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as TaskType }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CLEANING">Уборка</option>
                  <option value="MAINTENANCE">Обслуживание</option>
                  <option value="INSPECTION">Инспекция</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Приоритет
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Низкий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="HIGH">Высокий</option>
                  <option value="URGENT">Срочный</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Заметки
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Дополнительные инструкции..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room status change dialog */}
      {showStatusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {showStatusDialog.name}
              {showStatusDialog.roomNumber ? ` #${showStatusDialog.roomNumber}` : ""}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Изменить статус уборки</p>
            <div className="grid grid-cols-2 gap-2">
              {(["CLEAN", "DIRTY", "CLEANING", "INSPECTION"] as CleaningStatus[]).map(
                (s) => {
                  const cfg = CLEANING_STATUS_CONFIG[s]
                  const isActive = showStatusDialog.cleaningStatus === s
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        updateRoomCleaningStatus(showStatusDialog.id, s)
                      }
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? `${cfg.bg} ${cfg.text} border-current`
                          : "border-border text-foreground hover:border-border"
                      }`}
                    >
                      <span className={`size-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </button>
                  )
                }
              )}
            </div>
            <button
              onClick={() => setShowStatusDialog(null)}
              className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
