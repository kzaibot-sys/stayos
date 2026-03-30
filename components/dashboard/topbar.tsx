"use client"

import { Menu, ChevronRight, Home } from "lucide-react"
import { UserNav } from "@/components/dashboard/user-nav"
import { usePathname } from "next/navigation"
import Link from "next/link"

interface TopbarProps {
  user: { name: string; email: string }
  hotelName: string
  onMenuClick: () => void
}

const PATH_LABELS: Record<string, string> = {
  "/dashboard": "Главная",
  "/dashboard/bookings": "Брони",
  "/dashboard/bookings/new": "Новая бронь",
  "/dashboard/rooms": "Номера",
  "/dashboard/rooms/new": "Новый номер",
  "/dashboard/guests": "Гости",
  "/dashboard/calendar": "Календарь",
  "/dashboard/payments": "Платежи",
  "/dashboard/reports": "Отчёты",
  "/dashboard/settings": "Настройки",
}

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = []

  let accumulated = ""
  for (const segment of segments) {
    accumulated += `/${segment}`
    const label = PATH_LABELS[accumulated]
    if (label) {
      breadcrumbs.push({ label, href: accumulated })
    } else {
      // Check if it looks like a dynamic segment (ID) after /bookings or /rooms
      const parentPath = accumulated.substring(0, accumulated.lastIndexOf("/"))
      if (parentPath === "/dashboard/bookings") {
        breadcrumbs.push({ label: "Детали брони", href: accumulated })
      } else if (parentPath === "/dashboard/rooms") {
        breadcrumbs.push({ label: "Детали номера", href: accumulated })
      } else {
        breadcrumbs.push({ label: segment, href: accumulated })
      }
    }
  }

  return breadcrumbs
}

export function Topbar({ user, hotelName, onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Breadcrumbs - visible on md+ */}
        <nav className="hidden md:flex items-center gap-1 text-sm min-w-0">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <div key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i === 0 && (
                  <Home className="size-3.5 text-gray-400 shrink-0" />
                )}
                {i > 0 && (
                  <ChevronRight className="size-3.5 text-gray-300 shrink-0" />
                )}
                {isLast ? (
                  <span className="font-semibold text-gray-900 truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Hotel name - mobile only */}
        <span className="md:hidden font-heading text-sm font-semibold text-gray-900 truncate">
          {hotelName}
        </span>
      </div>

      {/* Right side */}
      <UserNav user={user} />
    </header>
  )
}
