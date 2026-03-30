"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

const STORAGE_KEY = "stayos-theme"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = stored ? stored === "dark" : prefersDark
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem(STORAGE_KEY, "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem(STORAGE_KEY, "light")
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Светлая тема" : "Тёмная тема"}
      className="flex items-center justify-center w-8 h-8 rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
    >
      {isDark ? (
        <Sun className="size-4 transition-transform duration-200 rotate-0" />
      ) : (
        <Moon className="size-4 transition-transform duration-200 rotate-0" />
      )}
    </button>
  )
}
