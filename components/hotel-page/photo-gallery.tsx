"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PhotoGalleryProps {
  photos: string[]
  hotelName: string
}

export function PhotoGallery({ photos, hotelName }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const open = (index: number) => setSelected(index)
  const close = () => setSelected(null)

  const prev = useCallback(() => {
    setSelected((s) => (s !== null ? (s - 1 + photos.length) % photos.length : null))
  }, [photos.length])

  const next = useCallback(() => {
    setSelected((s) => (s !== null ? (s + 1) % photos.length : null))
  }, [photos.length])

  useEffect(() => {
    if (selected === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
      else if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selected, prev, next])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next()
      else prev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <>
      {/* Masonry-style grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
              i === 0 ? "col-span-2 md:col-span-1 md:row-span-2 aspect-[3/4]" : "aspect-video"
            }`}
            onClick={() => open(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${hotelName} — ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#1b4332]/0 group-hover:bg-[#1b4332]/30 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b4332]/95 backdrop-blur-sm"
            onClick={close}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {selected + 1} / {photos.length}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Prev"
            >
              <ChevronLeft className="size-6" />
            </button>

            <AnimatePresence mode="wait">
              <motion.img
                key={selected}
                src={photos[selected]}
                alt={`${hotelName} — ${selected + 1}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              />
            </AnimatePresence>

            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="size-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
