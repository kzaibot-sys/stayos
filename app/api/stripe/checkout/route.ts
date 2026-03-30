import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { z } from "zod"

const checkoutSchema = z.object({
  bookingId: z.string().min(1),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 422 })
  }

  const { bookingId } = parsed.data

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: true,
      hotel: true,
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Бронирование не найдено" }, { status: 404 })
  }

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    return NextResponse.json({ error: "Stripe не настроен" }, { status: 503 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: booking.hotel.currency.toLowerCase(),
            product_data: {
              name: booking.room.name,
              description: `Проживание ${booking.nights} ${booking.nights === 1 ? 'ночь' : booking.nights < 5 ? 'ночи' : 'ночей'} — Бронь #${booking.bookingNumber}`,
            },
            unit_amount: Math.round((booking.totalPrice / booking.nights) * 100),
          },
          quantity: booking.nights,
        },
      ],
      success_url: `${baseUrl}/${booking.hotel.slug}/book/success?booking=${booking.bookingNumber}`,
      cancel_url: `${baseUrl}/${booking.hotel.slug}/book`,
      metadata: {
        bookingId: booking.id,
        hotelId: booking.hotelId,
      },
      customer_email: booking.guestEmail || undefined,
    })

    // Save stripeSessionId to booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe] Checkout session error:', error)
    return NextResponse.json({ error: "Ошибка создания сессии оплаты" }, { status: 500 })
  }
}
