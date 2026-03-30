// ============================================================
// StayOS branded email templates — deep green (#1b4332) + gold (#d4a373)
// All templates are inline-styled HTML for maximum email client compatibility
// ============================================================

const BRAND = {
  green: "#1b4332",
  greenLight: "#2d6a4f",
  gold: "#d4a373",
  goldLight: "#e8c9a0",
  bg: "#f8f7f4",
  white: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#6b7280",
  border: "#e5e7eb",
}

function emailWrapper(hotelName: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(27,67,50,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${BRAND.green};padding:28px 32px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <span style="font-size:24px;font-weight:700;color:${BRAND.white};letter-spacing:-0.5px;">StayOS</span>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top:6px;">
                  <span style="font-size:14px;color:${BRAND.gold};font-weight:500;">${hotelName}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BRAND.bg};padding:20px 32px;text-align:center;border-top:1px solid ${BRAND.border};">
            <p style="margin:0;font-size:12px;color:${BRAND.textMuted};">
              Powered by <span style="color:${BRAND.green};font-weight:600;">StayOS</span> · stayos.aibot.kz
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function infoCard(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:10px 16px;font-size:14px;color:${BRAND.textMuted};width:40%;border-bottom:1px solid ${BRAND.border};">${r.label}</td>
      <td style="padding:10px 16px;font-size:14px;font-weight:600;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};">${r.value}</td>
    </tr>
  `).join("")

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};border-radius:12px;overflow:hidden;margin:20px 0;">
      ${rowsHtml}
    </table>
  `
}

function greenBox(html: string): string {
  return `
    <div style="background:${BRAND.green};border-radius:12px;padding:20px;margin:20px 0;color:${BRAND.white};">
      ${html}
    </div>
  `
}

function goldButton(text: string, href: string): string {
  return `
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${href}" style="display:inline-block;background:${BRAND.gold};color:${BRAND.white};font-weight:600;font-size:16px;padding:14px 36px;border-radius:12px;text-decoration:none;">
        ${text}
      </a>
    </div>
  `
}

// ============================================================
// 1. Booking Confirmation
// ============================================================
export function bookingConfirmationHtml(data: {
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
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.green};">Бронирование подтверждено</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Здравствуйте, ${data.guestName}! Ваше бронирование успешно оформлено.
    </p>

    ${infoCard([
      { label: "№ брони", value: `#${data.bookingNumber}` },
      { label: "Номер", value: data.roomName },
      { label: "Заезд", value: data.checkIn },
      { label: "Выезд", value: data.checkOut },
      { label: "Ночей", value: String(data.nights) },
      { label: "Итого", value: data.totalPrice },
    ])}

    ${greenBox(`
      <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Информация для заезда</p>
      <p style="margin:8px 0 4px;font-size:14px;">⏰ Время заезда: <strong>${data.checkInTime}</strong></p>
      ${data.hotelAddress ? `<p style="margin:4px 0;font-size:14px;">📍 ${data.hotelAddress}</p>` : ""}
      ${data.hotelPhone ? `<p style="margin:4px 0;font-size:14px;">📞 ${data.hotelPhone}</p>` : ""}
    `)}

    <p style="color:${BRAND.textMuted};font-size:14px;">
      Ждём вас! Если у вас есть вопросы — свяжитесь с нами.
    </p>
  `
  return emailWrapper(data.hotelName, content)
}

// ============================================================
// 2. Check-in Reminder (tomorrow)
// ============================================================
export function checkInReminderHtml(data: {
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkInTime: string
  hotelAddress?: string
  hotelPhone?: string
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.green};">Напоминание о заезде завтра</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Здравствуйте, ${data.guestName}! Напоминаем, что завтра вас ждёт заезд.
    </p>

    ${infoCard([
      { label: "Номер", value: data.roomName },
      { label: "Дата заезда", value: data.checkIn },
      { label: "Время заезда", value: data.checkInTime },
    ])}

    ${data.hotelAddress || data.hotelPhone ? greenBox(`
      <p style="margin:0 0 4px;font-size:13px;color:${BRAND.gold};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Как нас найти</p>
      ${data.hotelAddress ? `<p style="margin:8px 0 4px;font-size:14px;">📍 ${data.hotelAddress}</p>` : ""}
      ${data.hotelPhone ? `<p style="margin:4px 0;font-size:14px;">📞 ${data.hotelPhone}</p>` : ""}
    `) : ""}

    <p style="color:${BRAND.textMuted};font-size:14px;">
      Хорошей поездки! Ждём вас в ${data.hotelName}.
    </p>
  `
  return emailWrapper(data.hotelName, content)
}

// ============================================================
// 3. Booking Cancellation
// ============================================================
export function bookingCancellationHtml(data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  refundNote?: string
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#b91c1c;">Бронирование отменено</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Здравствуйте, ${data.guestName}. Ваше бронирование было отменено.
    </p>

    ${infoCard([
      { label: "№ брони", value: `#${data.bookingNumber}` },
      { label: "Номер", value: data.roomName },
      { label: "Заезд", value: data.checkIn },
      { label: "Выезд", value: data.checkOut },
    ])}

    ${data.refundNote ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#b91c1c;font-weight:600;">О возврате средств</p>
        <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">${data.refundNote}</p>
      </div>
    ` : ""}

    <p style="color:${BRAND.textMuted};font-size:14px;">
      Если у вас есть вопросы по отмене, свяжитесь с отелем.
    </p>
  `
  return emailWrapper(data.hotelName, content)
}

// ============================================================
// 4. Check-out Thank You + Review Request
// ============================================================
export function checkOutThankYouHtml(data: {
  guestName: string
  hotelName: string
  roomName: string
  nights: number
  reviewLink?: string
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.green};">Спасибо за ваш визит!</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Здравствуйте, ${data.guestName}! Надеемся, что пребывание в ${data.hotelName} было приятным.
    </p>

    ${infoCard([
      { label: "Номер", value: data.roomName },
      { label: "Ночей", value: String(data.nights) },
    ])}

    ${greenBox(`
      <p style="margin:0;font-size:15px;text-align:center;">
        Нам важно ваше мнение! Оставьте отзыв — это займёт всего минуту.
      </p>
    `)}

    ${data.reviewLink ? goldButton("Оставить отзыв", data.reviewLink) : ""}

    <p style="color:${BRAND.textMuted};font-size:14px;text-align:center;">
      Будем рады видеть вас снова!
    </p>
  `
  return emailWrapper(data.hotelName, content)
}

// ============================================================
// 5. Admin: New Booking Notification
// ============================================================
export function adminNewBookingHtml(data: {
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
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.green};">Новое бронирование</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Поступило новое бронирование на ${data.hotelName}.
    </p>

    ${infoCard([
      { label: "№ брони", value: `#${data.bookingNumber}` },
      { label: "Гость", value: data.guestName },
      { label: "Email", value: data.guestEmail },
      ...(data.guestPhone ? [{ label: "Телефон", value: data.guestPhone }] : []),
      { label: "Номер", value: data.roomName },
      { label: "Заезд", value: data.checkIn },
      { label: "Выезд", value: data.checkOut },
      { label: "Ночей", value: String(data.nights) },
      { label: "Сумма", value: data.totalPrice },
    ])}

    ${data.dashboardLink ? goldButton("Открыть в дашборде", data.dashboardLink) : ""}
  `
  return emailWrapper(data.hotelName, content)
}

// ============================================================
// 6. Admin: Cancellation Notification
// ============================================================
export function adminCancellationHtml(data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  reason?: string
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#b91c1c;">Бронирование отменено</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Бронирование #${data.bookingNumber} было отменено.
    </p>

    ${infoCard([
      { label: "Гость", value: data.guestName },
      { label: "Номер", value: data.roomName },
      { label: "Заезд", value: data.checkIn },
      { label: "Выезд", value: data.checkOut },
      ...(data.reason ? [{ label: "Причина", value: data.reason }] : []),
    ])}
  `
  return emailWrapper(data.hotelName, content)
}

// ============================================================
// 7. Welcome Email (after registration)
// ============================================================
export function welcomeHtml(data: {
  userName: string
  hotelName: string
  dashboardLink: string
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.green};">Добро пожаловать в StayOS!</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Здравствуйте, ${data.userName}! Ваш отель <strong>${data.hotelName}</strong> успешно создан.
    </p>

    ${greenBox(`
      <p style="margin:0 0 8px;font-size:13px;color:${BRAND.gold};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Что дальше?</p>
      <p style="margin:8px 0 4px;font-size:14px;">1. Добавьте номера и фотографии</p>
      <p style="margin:4px 0;font-size:14px;">2. Настройте цены и доступность</p>
      <p style="margin:4px 0;font-size:14px;">3. Поделитесь ссылкой на ваш сайт</p>
    `)}

    ${goldButton("Перейти в дашборд", data.dashboardLink)}

    <p style="color:${BRAND.textMuted};font-size:14px;text-align:center;">
      Нужна помощь? Пишите на support@stayos.aibot.kz
    </p>
  `
  return emailWrapper(data.hotelName, content)
}

// ============================================================
// 8. Payment Receipt
// ============================================================
export function paymentReceiptHtml(data: {
  bookingNumber: string
  guestName: string
  hotelName: string
  amount: string
  paymentMethod: string
  paidAt: string
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.green};">Оплата получена</h2>
    <p style="color:${BRAND.textMuted};font-size:15px;margin:0 0 24px;">
      Здравствуйте, ${data.guestName}! Ваша оплата успешно обработана.
    </p>

    ${infoCard([
      { label: "№ брони", value: `#${data.bookingNumber}` },
      { label: "Сумма", value: data.amount },
      { label: "Метод оплаты", value: data.paymentMethod },
      { label: "Дата", value: data.paidAt },
    ])}

    <p style="color:${BRAND.textMuted};font-size:13px;text-align:center;">
      Это автоматическое подтверждение оплаты. Сохраните его для ваших записей.
    </p>
  `
  return emailWrapper(data.hotelName, content)
}
