import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Download, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GuestTable } from "@/components/dashboard/guest-table"
import { Suspense } from "react"

interface SearchParams {
  search?: string
  tags?: string
  page?: string
  limit?: string
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    redirect("/login")
  }

  const sp = await searchParams
  const page = parseInt(sp.page ?? "1", 10)
  const limit = parseInt(sp.limit ?? "20", 10)
  const skip = (page - 1) * limit

  const where: any = { hotelId }

  if (sp.search) {
    where.OR = [
      { firstName: { contains: sp.search } },
      { lastName: { contains: sp.search } },
      { email: { contains: sp.search } },
      { phone: { contains: sp.search } },
    ]
  }

  if (sp.tags) {
    where.tags = { contains: sp.tags }
  }

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.guest.count({ where }),
  ])

  const guestsForTable = guests.map((g) => ({
    ...g,
    tags: JSON.parse(g.tags || "[]") as string[],
    bookingCount: g._count.bookings,
    birthDate: g.birthDate ? g.birthDate.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }))

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Гости
        </h1>
        <a href="/api/guests/export">
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Экспорт CSV
          </Button>
        </a>
      </div>

      {/* Search */}
      <Suspense>
        <GuestSearch defaultValue={sp.search} defaultTags={sp.tags} />
      </Suspense>

      {/* Table */}
      <GuestTable
        guests={guestsForTable}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  )
}

function GuestSearch({
  defaultValue,
  defaultTags,
}: {
  defaultValue?: string
  defaultTags?: string
}) {
  return (
    <form method="GET" className="flex gap-3 mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          name="search"
          defaultValue={defaultValue}
          placeholder="Поиск по имени, email, телефону..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
        />
      </div>
      <select
        name="tags"
        defaultValue={defaultTags ?? ""}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
      >
        <option value="">Все теги</option>
        <option value="VIP">VIP</option>
        <option value="Постоянный">Постоянный</option>
        <option value="Проблемный">Проблемный</option>
        <option value="Корпоративный">Корпоративный</option>
      </select>
      <Button type="submit" variant="outline">
        Найти
      </Button>
    </form>
  )
}
