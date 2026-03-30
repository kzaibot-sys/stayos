"use client"

import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserNavProps {
  user: { name: string; email: string; image?: string }
}

export function UserNav({ user }: UserNavProps) {
  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U"
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:ring-offset-1"
        aria-label="User menu"
      >
        <Avatar>
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-[#1b4332] text-white font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
        <div className="px-1.5 py-1.5">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
          Профиль
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          Настройки
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
