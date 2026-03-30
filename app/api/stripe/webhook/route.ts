import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    try {
      const booking = await prisma.booking.findFirst({
        where: { stripeSessionId: session.id },
      })

      if (booking) {
        const amountPaid = session.amount_total ? session.amount_total / 100 : booking.totalPrice

        // Update booking payment status
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'PAID',
            paidAmount: amountPaid,
          },
        })

        // Create Payment record
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: amountPaid,
            currency: session.currency?.toUpperCase() || 'KZT',
            method: 'STRIPE',
            status: 'succeeded',
            stripePaymentId: session.payment_intent || session.id,
          },
        })
      }
    } catch (error) {
      console.error('[Stripe Webhook] Error processing checkout.session.completed:', error)
      return NextResponse.json({ error: "Processing failed" }, { status: 500 })
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as any
    console.log('[Stripe Webhook] Session expired:', session.id)
    // Optionally handle expired sessions (e.g., mark booking as cancelled)
  }

  return NextResponse.json({ received: true })
}
