"use client"

import { Share2 } from "lucide-react"

export function ShareButton() {
  function handleShare() {
    if (typeof navigator === "undefined") return
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Share2 className="size-4 text-[#1a56db]" />
      Поделиться бронью
    </button>
  )
}
