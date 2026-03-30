"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  BedDouble,
  Users,
  CreditCard,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Главная", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Брони", icon: CalendarCheck, href: "/dashboard/bookings" },
  { label: "Календарь", icon: Calendar, href: "/dashboard/calendar" },
  { label: "Номера", icon: BedDouble, href: "/dashboard/rooms" },
  { label: "Гости", icon: Users, href: "/dashboard/guests" },
  { label: "Платежи", icon: CreditCard, href: "/dashboard/payments" },
  { label: "Отчёты", icon: BarChart3, href: "/dashboard/reports" },
  { label: "Уборка", icon: Sparkles, href: "/dashboard/housekeeping" },
  { label: "Настройки", icon: Settings, href: "/dashboard/settings" },
]

interface SidebarProps {
  user: { name: string; email: string }
  onClose?: () => void
}

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className="flex flex-col h-full w-60 bg-[#111827] text-white"
      style={{ width: "240px" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <BedDouble className="size-6 text-white shrink-0" />
        <span className="font-heading text-lg font-semibold text-white">
          StayOS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="size-4.5 shrink-0" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  )
}
