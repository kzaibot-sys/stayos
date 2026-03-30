"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

const STORAGE_KEY = "stayos-last-booking"
const POLL_INTERVAL = 30_000

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = "sine"
      osc.frequency.value = freq

      const startTime = ctx.currentTime + i * 0.18
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5)

      osc.start(startTime)
      osc.stop(startTime + 0.5)
    })
  } catch {
    // AudioContext not available in some environments
  }
}

export function NotificationSound() {
  const initialized = useRef(false)

  useEffect(() => {
    // Skip on server
    if (typeof window === "undefined") return

    async function check() {
      try {
        const res = await fetch("/api/bookings?limit=1&page=1")
        if (!res.ok) return

        const data = await res.json()
        const latest = data.bookings?.[0]
        if (!latest) return

        const lastSeen = localStorage.getItem(STORAGE_KEY)

        if (!initialized.current) {
          // First run: just store the latest, don't notify
          initialized.current = true
          if (!lastSeen) {
            localStorage.setItem(STORAGE_KEY, latest.bookingNumber)
          }
          return
        }

        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && latest.bookingNumber !== stored) {
          // New booking detected
          playChime()
          toast.success(`Новое бронирование! #${latest.bookingNumber}`, {
            description: `${latest.guestFirstName} ${latest.guestLastName}`,
            duration: 8000,
          })
          localStorage.setItem(STORAGE_KEY, latest.bookingNumber)
        }
      } catch {
        // Silent fail
      }
    }

    check()
    const timer = setInterval(check, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return null
}
