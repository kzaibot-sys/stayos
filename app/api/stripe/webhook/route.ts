import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Map Stripe price IDs to plans
function getPlanFromPriceId(priceId: string): 'STARTER' | 'PRO' | 'ENTERPRISE' | null {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'STARTER'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO'
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'ENTERPRISE'
  return null
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
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

  // Handle subscription created or updated
  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    try {
      const hotel = await prisma.hotel.findFirst({
        where: { stripeCustomerId: customerId },
      })

      if (hotel) {
        // Get the price ID from the subscription items
        const priceId = subscription.items?.data?.[0]?.price?.id
        const plan = priceId ? getPlanFromPriceId(priceId) : null

        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null

        await prisma.hotel.update({
          where: { id: hotel.id },
          data: {
            plan: plan || hotel.plan,
            stripeSubId: subscription.id,
            planExpiresAt: currentPeriodEnd,
          },
        })

        console.log(`[Stripe Webhook] Updated hotel ${hotel.id} plan to ${plan}`)
      } else {
        console.warn('[Stripe Webhook] No hotel found for customer:', customerId)
      }
    } catch (error) {
      console.error('[Stripe Webhook] Error processing subscription event:', error)
      return NextResponse.json({ error: "Processing failed" }, { status: 500 })
    }
  }

  // Handle subscription deleted (cancelled)
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    try {
      const hotel = await prisma.hotel.findFirst({
        where: { stripeCustomerId: customerId },
      })

      if (hotel) {
        await prisma.hotel.update({
          where: { id: hotel.id },
          data: {
            plan: 'FREE',
            stripeSubId: null,
            planExpiresAt: null,
          },
        })

        console.log(`[Stripe Webhook] Reset hotel ${hotel.id} to FREE plan`)
      }
    } catch (error) {
      console.error('[Stripe Webhook] Error processing subscription.deleted:', error)
      return NextResponse.json({ error: "Processing failed" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
