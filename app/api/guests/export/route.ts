import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const guests = await prisma.guest.findMany({
    where: { hotelId },
    orderBy: { createdAt: "desc" },
  })

  const header = "Имя,Фамилия,Email,Телефон,Визитов,Потрачено,Теги"

  const rows = guests.map((g) => {
    const tags = JSON.parse(g.tags || "[]") as string[]
    const escapeCsv = (val: string | null | undefined) => {
      if (!val) return ""
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }
    return [
      escapeCsv(g.firstName),
      escapeCsv(g.lastName),
      escapeCsv(g.email),
      escapeCsv(g.phone),
      String(g.totalVisits),
      String(g.totalSpent),
      escapeCsv(tags.join("; ")),
    ].join(",")
  })

  const csv = [header, ...rows].join("\n")

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="guests.csv"',
    },
  })
}
