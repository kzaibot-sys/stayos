import { Resend } from 'resend'

export async function sendBookingConfirmationEmail(to: string, data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: string
  hotelAddress?: string
  hotelPhone?: string
  checkInTime: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set, skipping email')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'StayOS <noreply@stayos.app>',
      to,
      subject: `Бронирование подтверждено — ${data.bookingNumber}`,
      html: buildConfirmationHtml(data),
    })
  } catch (error) {
    console.error('[Email] Failed to send:', error)
  }
}

export async function sendReminderEmail(to: string, data: {
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkInTime: string
  hotelAddress?: string
  hotelPhone?: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set, skipping reminder email')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'StayOS <noreply@stayos.app>',
      to,
      subject: `Напоминание о заезде завтра — ${data.hotelName}`,
      html: buildReminderHtml(data),
    })
  } catch (error) {
    console.error('[Email] Failed to send reminder:', error)
  }
}

function buildReminderHtml(data: {
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkInTime: string
  hotelAddress?: string
  hotelPhone?: string
}): string {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a56db;">
        <h1 style="color: #1a56db; margin: 0;">StayOS</h1>
        <p style="color: #6b7280; margin: 5px 0 0;">${data.hotelName}</p>
      </div>
      <div style="padding: 30px 0;">
        <h2 style="color: #111827;">Напоминание о заезде завтра 🏨</h2>
        <p style="color: #6b7280;">Здравствуйте, ${data.guestName}!</p>
        <p style="color: #6b7280;">Напоминаем, что завтра вас ждёт заезд в ${data.hotelName}.</p>
        <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #111827;">Детали заезда</h3>
          <p style="margin: 5px 0; color: #6b7280;">🛏 Номер: <strong>${data.roomName}</strong></p>
          <p style="margin: 5px 0; color: #6b7280;">📅 Дата заезда: <strong>${data.checkIn}</strong></p>
          <p style="margin: 5px 0; color: #6b7280;">⏰ Время заезда: <strong>${data.checkInTime}</strong></p>
          ${data.hotelAddress ? `<p style="margin: 5px 0; color: #6b7280;">📍 ${data.hotelAddress}</p>` : ''}
          ${data.hotelPhone ? `<p style="margin: 5px 0; color: #6b7280;">📞 ${data.hotelPhone}</p>` : ''}
        </div>
        <p style="color: #6b7280;">Ждём вас! Если у вас есть вопросы, свяжитесь с нами.</p>
      </div>
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
        <p>Powered by StayOS</p>
      </div>
    </div>
  `
}

function buildConfirmationHtml(data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: string
  hotelAddress?: string
  hotelPhone?: string
  checkInTime: string
}): string {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a56db;">
        <h1 style="color: #1a56db; margin: 0;">StayOS</h1>
        <p style="color: #6b7280; margin: 5px 0 0;">${data.hotelName}</p>
      </div>
      <div style="padding: 30px 0;">
        <h2 style="color: #111827;">Бронирование подтверждено ✅</h2>
        <p style="color: #6b7280;">Здравствуйте, ${data.guestName}!</p>
        <p style="color: #6b7280;">Ваше бронирование успешно оформлено.</p>
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280;">№ брони</td><td style="padding: 8px 0; font-weight: 600; color: #1a56db;">#${data.bookingNumber}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Номер</td><td style="padding: 8px 0; font-weight: 600;">${data.roomName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Заезд</td><td style="padding: 8px 0; font-weight: 600;">${data.checkIn}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Выезд</td><td style="padding: 8px 0; font-weight: 600;">${data.checkOut}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Ночей</td><td style="padding: 8px 0; font-weight: 600;">${data.nights}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Сумма</td><td style="padding: 8px 0; font-weight: 600; color: #057a55;">${data.totalPrice}</td></tr>
          </table>
        </div>
        <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px; color: #111827;">Информация для заезда</h3>
          <p style="margin: 5px 0; color: #6b7280;">⏰ Время заезда: ${data.checkInTime}</p>
          ${data.hotelAddress ? `<p style="margin: 5px 0; color: #6b7280;">📍 ${data.hotelAddress}</p>` : ''}
          ${data.hotelPhone ? `<p style="margin: 5px 0; color: #6b7280;">📞 ${data.hotelPhone}</p>` : ''}
        </div>
      </div>
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
        <p>Powered by StayOS</p>
      </div>
    </div>
  `
}
