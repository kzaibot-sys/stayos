import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId
  if (!hotelId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookingId } = await params

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, hotelId },
    include: {
      room: true,
      hotel: true,
      payments: { where: { amount: { gt: 0 } }, orderBy: { createdAt: "asc" } },
    },
  })

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  const hotel = booking.hotel
  const formatDate = (d: Date) => format(d, "d MMMM yyyy", { locale: ru })
  const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n))

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Счёт ${booking.bookingNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.5; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .hotel-name { font-size: 24px; font-weight: 700; color: #1a56db; }
  .hotel-info { font-size: 12px; color: #555; margin-top: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 28px; font-weight: 800; color: #111; }
  .invoice-title p { font-size: 12px; color: #666; }
  .divider { border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #6b7280; }
  .info-value { font-weight: 500; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f9fafb; text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
  td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
  .total-row td { font-weight: 700; font-size: 16px; border-bottom: none; border-top: 2px solid #e5e7eb; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
  .badge-paid { background: #dcfce7; color: #166534; }
  .badge-partial { background: #fef9c3; color: #854d0e; }
  .badge-unpaid { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #9ca3af; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="no-print" style="text-align:right;margin-bottom:16px">
  <button onclick="window.print()" style="background:#1a56db;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600">Печать</button>
</div>

<div class="header">
  <div>
    <div class="hotel-name">${hotel.name}</div>
    <div class="hotel-info">${[hotel.address, hotel.city, hotel.country].filter(Boolean).join(", ")}</div>
    ${hotel.phone ? `<div class="hotel-info">Тел: ${hotel.phone}</div>` : ""}
    ${hotel.email ? `<div class="hotel-info">Email: ${hotel.email}</div>` : ""}
  </div>
  <div class="invoice-title">
    <h1>СЧЁТ</h1>
    <p><strong>${booking.bookingNumber}</strong></p>
    <p>Дата: ${formatDate(new Date())}</p>
  </div>
</div>

<hr class="divider">

<div class="grid-2 section">
  <div>
    <div class="section-title">Гость</div>
    <p><strong>${booking.guestFirstName} ${booking.guestLastName}</strong></p>
    ${booking.guestEmail ? `<p>${booking.guestEmail}</p>` : ""}
    ${booking.guestPhone ? `<p>${booking.guestPhone}</p>` : ""}
  </div>
  <div>
    <div class="section-title">Детали бронирования</div>
    <div class="info-row">
      <span class="info-label">Номер</span>
      <span class="info-value">${booking.room.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Заезд</span>
      <span class="info-value">${formatDate(booking.checkIn)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Выезд</span>
      <span class="info-value">${formatDate(booking.checkOut)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Ночей</span>
      <span class="info-value">${booking.nights}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Гостей</span>
      <span class="info-value">${booking.adults} взр.${booking.children > 0 ? `, ${booking.children} дет.` : ""}</span>
    </div>
  </div>
</div>

<div class="section">
  <table>
    <thead>
      <tr>
        <th>Описание</th>
        <th style="text-align:center">Кол-во</th>
        <th style="text-align:right">Цена</th>
        <th style="text-align:right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Проживание — ${booking.room.name}</td>
        <td style="text-align:center">${booking.nights} ночей</td>
        <td style="text-align:right">${fmt(booking.pricePerNight)} ₸</td>
        <td style="text-align:right">${fmt(booking.subtotal)} ₸</td>
      </tr>
      ${booking.discount > 0 ? `<tr>
        <td>Скидка</td>
        <td style="text-align:center">—</td>
        <td style="text-align:right">—</td>
        <td style="text-align:right; color: #dc2626">-${fmt(booking.discount)} ₸</td>
      </tr>` : ""}
      ${booking.taxes > 0 ? `<tr>
        <td>Налог</td>
        <td style="text-align:center">—</td>
        <td style="text-align:right">—</td>
        <td style="text-align:right">${fmt(booking.taxes)} ₸</td>
      </tr>` : ""}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">ИТОГО</td>
        <td style="text-align:right">${fmt(booking.totalPrice)} ₸</td>
      </tr>
    </tfoot>
  </table>
</div>

<div class="section">
  <div class="section-title">Статус оплаты</div>
  <div style="display:flex;align-items:center;gap:12px;margin-top:4px">
    <span class="badge ${booking.paymentStatus === "PAID" ? "badge-paid" : booking.paymentStatus === "PARTIAL" ? "badge-partial" : "badge-unpaid"}">
      ${booking.paymentStatus === "PAID" ? "Оплачено" : booking.paymentStatus === "PARTIAL" ? "Частично оплачено" : "Не оплачено"}
    </span>
    <span>Оплачено: <strong>${fmt(booking.paidAmount)} ₸</strong></span>
    ${booking.paidAmount < booking.totalPrice ? `<span>Остаток: <strong style="color:#dc2626">${fmt(booking.totalPrice - booking.paidAmount)} ₸</strong></span>` : ""}
  </div>
</div>

${booking.payments.length > 0 ? `
<div class="section">
  <div class="section-title">Платежи</div>
  <table>
    <thead>
      <tr>
        <th>Дата</th>
        <th>Метод</th>
        <th style="text-align:right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${booking.payments.map(p => `<tr>
        <td>${format(p.createdAt, "d MMM yyyy HH:mm", { locale: ru })}</td>
        <td>${p.method}</td>
        <td style="text-align:right">${fmt(p.amount)} ₸</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>
` : ""}

<div class="footer">
  <p>Документ сформирован системой StayOS • ${formatDate(new Date())}</p>
</div>
</body>
</html>`

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
