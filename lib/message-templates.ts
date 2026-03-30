export const MESSAGE_TEMPLATES = {
  booking_confirmed: {
    name: 'Подтверждение бронирования',
    telegram: '🏨 Бронирование #{bookingNumber} подтверждено!\n👤 {guestName}\n🛏 {roomName}\n📅 {checkIn} — {checkOut}\n💰 {totalPrice}',
    email_subject: 'Бронирование подтверждено — {bookingNumber}',
  },
  check_in: {
    name: 'Заселение',
    telegram: '✅ Гость {guestName} заселился в номер {roomName}\n📋 Бронь #{bookingNumber}',
    email_subject: 'Добро пожаловать — {hotelName}',
  },
  check_out: {
    name: 'Выезд',
    telegram: '👋 Гость {guestName} выехал из номера {roomName}\n📋 Бронь #{bookingNumber}',
    email_subject: 'Спасибо за визит — {hotelName}',
  },
  cancellation: {
    name: 'Отмена',
    telegram: '❌ Бронирование #{bookingNumber} отменено\n👤 {guestName}\n🛏 {roomName}',
    email_subject: 'Бронирование отменено — {bookingNumber}',
  },
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value)
  }
  return result
}
