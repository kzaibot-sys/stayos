"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Keyboard, X } from "lucide-react"

const SHORTCUTS = [
  { key: "n", label: "Новая бронь", path: "/dashboard/bookings/new" },
  { key: "r", label: "Номера", path: "/dashboard/rooms" },
  { key: "b", label: "Брони", path: "/dashboard/bookings" },
  { key: "g", label: "Гости", path: "/dashboard/guests" },
  { key: "h", label: "Уборка", path: "/dashboard/housekeeping" },
  { key: "?", label: "Показать подсказки", path: null },
]

export function KeyboardShortcuts() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      // Don't fire when typing in inputs/textareas/contenteditable
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case "n":
          e.preventDefault()
          router.push("/dashboard/bookings/new")
          break
        case "r":
          e.preventDefault()
          router.push("/dashboard/rooms")
          break
        case "b":
          e.preventDefault()
          router.push("/dashboard/bookings")
          break
        case "g":
          e.preventDefault()
          router.push("/dashboard/guests")
          break
        case "h":
          e.preventDefault()
          router.push("/dashboard/housekeeping")
          break
        case "?":
          e.preventDefault()
          setShowModal((prev) => !prev)
          break
        case "Escape":
          setShowModal(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 size-10 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
        title="Горячие клавиши (?)"
      >
        <Keyboard className="size-4" />
      </button>

      {/* Shortcuts modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Keyboard className="size-5 text-gray-700" />
                <h2 className="text-base font-semibold text-gray-900">Горячие клавиши</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2">
              {SHORTCUTS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-700">{label}</span>
                  <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-700 shadow-sm">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
              Горячие клавиши не работают при вводе текста
            </p>
          </div>
        </div>
      )}
    </>
  )
}
