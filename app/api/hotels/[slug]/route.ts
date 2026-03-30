import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    include: {
      rooms: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
  }

  // Return public-safe data (exclude tokens and internal fields)
  const {
    telegramBotToken,
    telegramChatId,
    stripeAccountId,
    stripeCustomerId,
    stripeSubId,
    ownerId,
    ...publicHotel
  } = hotel

  return NextResponse.json(publicHotel)
}
