"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BedDouble, Menu, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Возможности", href: "/#features" },
  { label: "Тарифы", href: "/pricing" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="size-8 rounded-lg bg-[#1b4332] flex items-center justify-center">
            <BedDouble className="size-4 text-[#d4a373]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#1b4332]">StayOS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium px-4 py-2 rounded-lg transition-colors",
                scrolled
                  ? "text-gray-600 hover:text-[#1b4332] hover:bg-[#1b4332]/5"
                  : "text-gray-600 hover:text-[#1b4332] hover:bg-[#1b4332]/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-[#1b4332] px-4 py-2 rounded-lg transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#1b4332] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2d6a4f] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Начать бесплатно
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-[#1b4332]/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-gray-600 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block text-center bg-[#1b4332] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#2d6a4f] transition-colors mt-2"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
