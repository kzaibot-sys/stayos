import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendTelegramNotification } from "@/lib/telegram"

export async function POST(_req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { telegramBotToken: true, telegramChatId: true, name: true },
  })

  if (!hotel?.telegramBotToken || !hotel?.telegramChatId) {
    return NextResponse.json({ error: "Telegram не настроен" }, { status: 400 })
  }

  const message = `✅ <b>Тест успешен!</b>\n\nTelegram-уведомления для <b>${hotel.name}</b> работают корректно.\n\nВы будете получать уведомления о новых бронированиях и отменах.`

  const ok = await sendTelegramNotification(hotel.telegramBotToken, hotel.telegramChatId, message)

  if (!ok) {
    return NextResponse.json({ error: "Не удалось отправить тестовое сообщение" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
