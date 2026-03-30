import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  let { action, priceId } = body

  // Resolve plan key to actual price ID
  if (priceId === 'STARTER') priceId = process.env.STRIPE_STARTER_PRICE_ID
  else if (priceId === 'PRO') priceId = process.env.STRIPE_PRO_PRICE_ID
  else if (priceId === 'ENTERPRISE') priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
      stripeSubId: true,
    },
  })

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (action === 'create-checkout') {
    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 })
    }

    let customerId = hotel.stripeCustomerId

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: hotel.name,
        email: hotel.email || undefined,
        metadata: { hotelId: hotel.id },
      })
      customerId = customer.id

      await prisma.hotel.update({
        where: { id: hotel.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/settings/billing?success=true`,
      cancel_url: `${baseUrl}/dashboard/settings/billing`,
      metadata: { hotelId: hotel.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  }

  if (action === 'create-portal') {
    if (!hotel.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: hotel.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/settings/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
