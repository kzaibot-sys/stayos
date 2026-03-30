export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export function formatNewBookingMessage(booking: {
  bookingNumber: string
  guestFirstName: string
  guestLastName: string
  guestPhone?: string | null
  room: { name: string }
  checkIn: Date
  checkOut: Date
  nights: number
  totalPrice: number
  paymentStatus: string
}): string {
  const checkIn = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(booking.checkIn))
  const checkOut = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(booking.checkOut))
  const price = new Intl.NumberFormat('ru-RU').format(booking.totalPrice)
  const paid = booking.paymentStatus === 'PAID' ? 'Онлайн ✅' : 'При заезде ⏳'

  return `🏨 <b>Новое бронирование!</b>
━━━━━━━━━━━━━━━
📋 Бронь: #${booking.bookingNumber}
👤 Гость: ${booking.guestFirstName} ${booking.guestLastName}
${booking.guestPhone ? `📞 Телефон: ${booking.guestPhone}\n` : ''}🛏 Номер: ${booking.room.name}
📅 Заезд: ${checkIn}
📅 Выезд: ${checkOut}
🌙 Ночей: ${booking.nights}
💰 Сумма: ${price} ₸
💳 Оплата: ${paid}
━━━━━━━━━━━━━━━`
}

export function formatCancelledBookingMessage(booking: {
  bookingNumber: string
  guestFirstName: string
  guestLastName: string
  room: { name: string }
  checkIn: Date
  checkOut: Date
}): string {
  const checkIn = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(booking.checkIn))
  return `❌ <b>Бронирование отменено</b>
━━━━━━━━━━━━━━━
📋 Бронь: #${booking.bookingNumber}
👤 Гость: ${booking.guestFirstName} ${booking.guestLastName}
🛏 Номер: ${booking.room.name}
📅 Заезд: ${checkIn}
━━━━━━━━━━━━━━━`
}
