import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const connectSchema = z.object({
  botToken: z.string().min(1),
  chatId: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = connectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 422 })
  }

  const { botToken, chatId } = parsed.data

  // Validate bot token by calling Telegram getMe API
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const json = await res.json()
    if (!res.ok || !json.ok) {
      return NextResponse.json({ error: "Неверный токен бота Telegram" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Не удалось проверить токен Telegram" }, { status: 400 })
  }

  // Save to hotel record
  await prisma.hotel.update({
    where: { id: hotelId },
    data: { telegramBotToken: botToken, telegramChatId: chatId },
  })

  return NextResponse.json({ success: true })
}
