"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BedDouble, Menu } from "lucide-react"
import { buttonVariants, Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Возможности", href: "/#features" },
  { label: "Тарифы", href: "/pricing" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-white transition-shadow",
        scrolled && "shadow-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-[#1a56db]"
        >
          <BedDouble className="size-6" />
          <span>StayOS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-[#1a56db] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Войти
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-[#1a56db] text-white hover:bg-[#1e429f]"
            )}
          >
            Начать бесплатно
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              }
            />
            <SheetContent side="right" className="w-64 pt-12">
              <nav className="flex flex-col gap-4 px-4">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="text-base font-medium text-gray-700 hover:text-[#1a56db] transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    }
                  />
                ))}
                <hr className="my-2 border-gray-200" />
                <SheetClose
                  render={
                    <Link
                      href="/login"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full justify-center"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      Войти
                    </Link>
                  }
                />
                <SheetClose
                  render={
                    <Link
                      href="/register"
                      className={cn(
                        buttonVariants(),
                        "w-full justify-center bg-[#1a56db] text-white hover:bg-[#1e429f]"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      Начать бесплатно
                    </Link>
                  }
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
