import { Resend } from 'resend'
import {
  bookingConfirmationHtml,
  checkInReminderHtml,
  bookingCancellationHtml,
  checkOutThankYouHtml,
  adminNewBookingHtml,
  adminCancellationHtml,
  welcomeHtml,
  paymentReceiptHtml,
} from './email-templates'

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set, skipping')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = () => process.env.RESEND_FROM_EMAIL || 'StayOS <noreply@stayos.aibot.kz>'

// ---- 1. Booking Confirmation (to guest) ----

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
  hotelSlug?: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Бронирование подтверждено — #${data.bookingNumber}`,
      html: bookingConfirmationHtml(data),
    })
  } catch (error) {
    console.error('[Email] Confirmation failed:', error)
  }
}

// ---- 2. Check-in Reminder (to guest, day before) ----

export async function sendReminderEmail(to: string, data: {
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkInTime: string
  hotelAddress?: string
  hotelPhone?: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Напоминание о заезде завтра — ${data.hotelName}`,
      html: checkInReminderHtml(data),
    })
  } catch (error) {
    console.error('[Email] Reminder failed:', error)
  }
}

// ---- 3. Booking Cancellation (to guest) ----

export async function sendCancellationEmail(to: string, data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  refundNote?: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Бронирование отменено — #${data.bookingNumber}`,
      html: bookingCancellationHtml(data),
    })
  } catch (error) {
    console.error('[Email] Cancellation failed:', error)
  }
}

// ---- 4. Check-out Thank You + Review Request (to guest) ----

export async function sendCheckOutEmail(to: string, data: {
  guestName: string
  hotelName: string
  roomName: string
  nights: number
  reviewLink?: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Спасибо за визит — ${data.hotelName}`,
      html: checkOutThankYouHtml(data),
    })
  } catch (error) {
    console.error('[Email] CheckOut email failed:', error)
  }
}

// ---- 5. Admin: New Booking Notification ----

export async function sendAdminNewBookingEmail(to: string, data: {
  bookingNumber: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: string
  dashboardLink?: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Новое бронирование #${data.bookingNumber} — ${data.guestName}`,
      html: adminNewBookingHtml(data),
    })
  } catch (error) {
    console.error('[Email] Admin new booking failed:', error)
  }
}

// ---- 6. Admin: Cancellation Notification ----

export async function sendAdminCancellationEmail(to: string, data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  reason?: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Отмена бронирования #${data.bookingNumber}`,
      html: adminCancellationHtml(data),
    })
  } catch (error) {
    console.error('[Email] Admin cancellation failed:', error)
  }
}

// ---- 7. Welcome Email (after registration) ----

export async function sendWelcomeEmail(to: string, data: {
  userName: string
  hotelName: string
  dashboardLink: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Добро пожаловать в StayOS!`,
      html: welcomeHtml(data),
    })
  } catch (error) {
    console.error('[Email] Welcome failed:', error)
  }
}

// ---- 8. Payment Receipt (to guest) ----

export async function sendPaymentReceiptEmail(to: string, data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  amount: string
  paymentMethod: string
  paidAt: string
}) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: FROM(),
      to,
      subject: `Оплата получена — #${data.bookingNumber}`,
      html: paymentReceiptHtml(data),
    })
  } catch (error) {
    console.error('[Email] Payment receipt failed:', error)
  }
}
