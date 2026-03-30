"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { NotificationSound } from "@/components/dashboard/notification-sound"
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"

interface DashboardShellProps {
  user: { name: string; email: string }
  hotelName: string
  children: React.ReactNode
}

export function DashboardShell({ user, hotelName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationSound />
      {/* Desktop sidebar - fixed left */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40">
        <Sidebar user={user} />
      </aside>

      {/* Mobile sidebar - Sheet drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-60" showCloseButton={false}>
          <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content area with left margin on desktop */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        <Topbar
          user={user}
          hotelName={hotelName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <KeyboardShortcuts />
    </div>
  )
}
