import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [headers.map(escape).join(",")]
  for (const row of rows) {
    lines.push(row.map(escape).join(","))
  }

  // BOM for Excel UTF-8 compatibility
  return "\uFEFF" + lines.join("\n")
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает",
  CONFIRMED: "Подтверждена",
  CHECKED_IN: "Заселён",
  CHECKED_OUT: "Выселился",
  CANCELLED: "Отменена",
  NO_SHOW: "Не приехал",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Не оплачено",
  PARTIAL: "Частично",
  PAID: "Оплачено",
  REFUNDED: "Возврат",
}

const METHOD_LABELS: Record<string, string> = {
  STRIPE: "Stripe",
  KASPI: "Kaspi",
  CASH: "Наличные",
  BANK_TRANSFER: "Перевод",
  OTHER: "Другое",
}

export async function GET(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") ?? "bookings"

  let csv = ""
  let filename = ""

  if (type === "bookings") {
    const bookings = await prisma.booking.findMany({
      where: { hotelId },
      include: { room: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })

    csv = toCsv(
      ["№ брони", "Гость", "Email", "Телефон", "Номер", "Заезд", "Выезд", "Ночей", "Статус", "Оплата", "Сумма", "Создана"],
      bookings.map((b) => [
        b.bookingNumber,
        `${b.guestFirstName} ${b.guestLastName}`,
        b.guestEmail ?? "",
        b.guestPhone ?? "",
        b.room.name,
        format(b.checkIn, "dd.MM.yyyy"),
        format(b.checkOut, "dd.MM.yyyy"),
        b.nights,
        STATUS_LABELS[b.status] ?? b.status,
        PAYMENT_STATUS_LABELS[b.paymentStatus] ?? b.paymentStatus,
        b.totalPrice,
        format(b.createdAt, "dd.MM.yyyy HH:mm"),
      ])
    )
    filename = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`
  } else if (type === "guests") {
    const guests = await prisma.guest.findMany({
      where: { hotelId },
      orderBy: { createdAt: "desc" },
    })

    csv = toCsv(
      ["Имя", "Фамилия", "Email", "Телефон", "Паспорт", "Национальность", "Визитов", "Потрачено", "Создан"],
      guests.map((g) => [
        g.firstName,
        g.lastName,
        g.email ?? "",
        g.phone ?? "",
        g.passportNumber ?? "",
        g.nationality ?? "",
        g.totalVisits,
        g.totalSpent,
        format(g.createdAt, "dd.MM.yyyy"),
      ])
    )
    filename = `guests-${format(new Date(), "yyyy-MM-dd")}.csv`
  } else if (type === "payments") {
    const payments = await prisma.payment.findMany({
      where: { booking: { hotelId } },
      include: { booking: { select: { bookingNumber: true, guestFirstName: true, guestLastName: true } } },
      orderBy: { createdAt: "desc" },
    })

    csv = toCsv(
      ["№ брони", "Гость", "Метод", "Сумма", "Статус", "Дата"],
      payments.map((p) => [
        p.booking.bookingNumber,
        `${p.booking.guestFirstName} ${p.booking.guestLastName}`,
        METHOD_LABELS[p.method] ?? p.method,
        p.amount,
        p.status,
        format(p.createdAt, "dd.MM.yyyy HH:mm"),
      ])
    )
    filename = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`
  } else if (type === "rooms") {
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      orderBy: { sortOrder: "asc" },
    })

    csv = toCsv(
      ["Название", "№ комнаты", "Тип", "Этаж", "Вместимость", "Кроватей", "Цена/ночь", "Цена выходные", "Мин. ночей", "Статус", "Активен"],
      rooms.map((r) => [
        r.name,
        r.roomNumber ?? "",
        r.type,
        r.floor ?? "",
        r.capacity,
        r.bedCount,
        r.pricePerNight,
        r.weekendPrice ?? "",
        r.minNights,
        r.status,
        r.isActive ? "Да" : "Нет",
      ])
    )
    filename = `rooms-${format(new Date(), "yyyy-MM-dd")}.csv`
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 400 })
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
