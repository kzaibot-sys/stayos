import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if ((session.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-[var(--color-background,#f8f9fa)] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b4332] text-white flex-shrink-0 hidden md:flex md:flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">StayOS Admin</h1>
          <p className="text-sm text-white/60 mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin">
            <DashboardIcon />
            Панель управления
          </NavLink>
          <NavLink href="/admin/hotels">
            <HotelIcon />
            Отели
          </NavLink>
          <NavLink href="/admin/users">
            <UsersIcon />
            Пользователи
          </NavLink>
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeftIcon />
            Вернуться на сайт
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1b4332] text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">StayOS Admin</h1>
        <div className="flex gap-3">
          <Link href="/admin" className="text-sm text-white/80 hover:text-white">
            Главная
          </Link>
          <Link href="/admin/hotels" className="text-sm text-white/80 hover:text-white">
            Отели
          </Link>
          <Link href="/admin/users" className="text-sm text-white/80 hover:text-white">
            Юзеры
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-14 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  )
}

function DashboardIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function HotelIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}
