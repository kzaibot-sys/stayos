import { Menu } from "lucide-react"
import { UserNav } from "@/components/dashboard/user-nav"

interface TopbarProps {
  user: { name: string; email: string }
  hotelName: string
  onMenuClick: () => void
}

export function Topbar({ user, hotelName, onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>
        {/* Hotel name / page title */}
        <span className="font-heading text-sm font-semibold text-gray-900">
          {hotelName}
        </span>
      </div>

      {/* Right side */}
      <UserNav user={user} />
    </header>
  )
}
