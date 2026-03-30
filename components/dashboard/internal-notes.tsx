"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InternalNotesProps {
  bookingId: string
  initialNotes: string | null
}

export function InternalNotes({ bookingId, initialNotes }: InternalNotesProps) {
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: notes }),
      })
      if (!res.ok) throw new Error("Ошибка сохранения")
      toast.success("Заметки сохранены")
    } catch {
      toast.error("Не удалось сохранить заметки")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Внутренние заметки
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Заметки видны только сотрудникам отеля..."
        rows={3}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-yellow-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <div className="mt-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="size-4 mr-1.5" />
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </div>
  )
}
