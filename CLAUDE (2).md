# 🏨 StayOS — Hotel Management SaaS Platform
## Полная инструкция для Claude Code

---

## 🎯 PRODUCT VISION

StayOS — это SaaS-платформа для мини-отелей, гостевых домов, хостелов и апартаментов в СНГ.
Каждый отель после регистрации получает:

1. **Публичный сайт** — `stayos.app/[slug]` (лендинг с бронированием)
2. **Виджет бронирования** — встраивается на любой сайт через `<script>`
3. **Админ-панель** — управление номерами, бронями, гостями, отчёты
4. **Онлайн-оплата** — Stripe + Kaspi QR (для Казахстана)
5. **Telegram-уведомления** — мгновенные алерты в бот отеля
6. **Email-уведомления** — подтверждения гостям
7. **Подписка SaaS** — Stripe Billing, 3 тарифа

---

## 🛠 TECH STACK

```
Frontend:   Next.js 14 (App Router) + TypeScript
Styling:    Tailwind CSS + shadcn/ui + Framer Motion
Database:   PostgreSQL + Prisma ORM (Supabase)
Auth:       NextAuth.js v5 (Credentials + Google OAuth)
Payments:   Stripe Checkout + Stripe Billing
Telegram:   Telegram Bot API (через fetch, без библиотек)
Email:      Resend + React Email templates
Storage:    Supabase Storage (фото номеров, логотипы)
Charts:     Recharts
Forms:      react-hook-form + zod
Toasts:     sonner
PDF:        @react-pdf/renderer (счета-фактуры)
Deploy:     Vercel + Supabase
```

---

## 📁 PROJECT STRUCTURE

```
/app
  /(marketing)
    /page.tsx                    → Главный лендинг StayOS (SaaS)
    /pricing/page.tsx            → Тарифы
    /[slug]/page.tsx             → Публичный сайт отеля
    /[slug]/book/page.tsx        → Форма бронирования
    /[slug]/book/success/page.tsx → Успешное бронирование

  /(auth)
    /login/page.tsx
    /register/page.tsx           → Регистрация + создание отеля
    /forgot-password/page.tsx

  /(dashboard)
    /layout.tsx                  → Sidebar + Topbar layout
    /page.tsx                    → Dashboard Home (stats)
    /bookings/page.tsx           → Список броней
    /bookings/[id]/page.tsx      → Детали брони
    /bookings/new/page.tsx       → Создать бронь вручную
    /calendar/page.tsx           → Календарь занятости
    /rooms/page.tsx              → Управление номерами
    /rooms/[id]/page.tsx         → Редактирование номера
    /guests/page.tsx             → CRM гостей
    /guests/[id]/page.tsx        → Профиль гостя
    /payments/page.tsx           → Платежи и счета
    /reports/page.tsx            → Аналитика и отчёты
    /settings/page.tsx           → Настройки отеля
    /settings/integrations/page.tsx → Telegram, оплата, виджет
    /settings/team/page.tsx      → Сотрудники
    /settings/billing/page.tsx   → Подписка SaaS

  /api
    /auth/[...nextauth]/route.ts
    /hotels/route.ts
    /bookings/route.ts
    /bookings/[id]/route.ts
    /rooms/route.ts
    /rooms/[id]/route.ts
    /guests/route.ts
    /guests/[id]/route.ts
    /payments/route.ts
    /stripe/checkout/route.ts    → Checkout session для брони
    /stripe/billing/route.ts     → Subscription management
    /stripe/webhook/route.ts     → Stripe webhooks
    /telegram/connect/route.ts   → Подключение Telegram бота
    /telegram/test/route.ts      → Тест уведомления
    /reports/revenue/route.ts
    /reports/occupancy/route.ts
    /widget/[slug]/route.ts      → Публичный API для виджета
    /upload/route.ts             → Загрузка фото в Supabase

/components
  /ui/                           → shadcn компоненты
  /marketing/
    /hero.tsx
    /features.tsx
    /pricing.tsx
    /testimonials.tsx
    /footer.tsx
  /hotel-page/
    /hotel-hero.tsx              → Шапка публичного сайта отеля
    /room-card.tsx               → Карточка номера на сайте
    /booking-widget.tsx          → Форма бронирования
    /booking-steps.tsx           → Шаги: даты → номер → данные → оплата
  /dashboard/
    /sidebar.tsx
    /topbar.tsx
    /stats-card.tsx
    /booking-table.tsx
    /room-grid.tsx
    /calendar-view.tsx           → Drag-drop занятость
    /guest-profile.tsx
    /revenue-chart.tsx
    /occupancy-chart.tsx
  /shared/
    /date-range-picker.tsx
    /image-upload.tsx
    /confirm-dialog.tsx
    /empty-state.tsx
    /loading-skeleton.tsx

/lib
  /prisma.ts
  /auth.ts
  /stripe.ts
  /telegram.ts                   → sendTelegramNotification()
  /resend.ts                     → sendBookingConfirmation()
  /utils.ts
  /validations.ts                → zod schemas

/emails
  /booking-confirmation.tsx      → React Email шаблон
  /booking-reminder.tsx
  /booking-cancelled.tsx

/prisma
  /schema.prisma
  /seed.ts

/public
  /widget.js                     → Встраиваемый скрипт (iframe)
```

---

## 🗄 DATABASE SCHEMA (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── SaaS Subscription Plans ───────────────────────────
enum Plan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

// ─── Hotel (tenant) ────────────────────────────────────
model Hotel {
  id                 String    @id @default(cuid())
  name               String
  slug               String    @unique  // URL: stayos.app/[slug]
  description        String?
  shortDescription   String?
  address            String?
  city               String?
  country            String    @default("KZ")
  phone              String?
  email              String?
  website            String?
  logoUrl            String?
  coverImageUrl      String?
  galleryUrls        String[]  @default([])
  amenities          String[]  @default([])  // ["WiFi", "Parking", ...]
  checkInTime        String    @default("14:00")
  checkOutTime       String    @default("12:00")
  currency           String    @default("KZT")
  timezone           String    @default("Asia/Almaty")
  language           String    @default("ru")

  // SaaS Billing
  plan               Plan      @default(FREE)
  stripeCustomerId   String?
  stripeSubId        String?
  planExpiresAt      DateTime?

  // Integrations
  telegramBotToken   String?   // токен бота
  telegramChatId     String?   // chat_id куда слать
  stripeAccountId    String?   // Stripe Connect для приёма оплат

  // Relations
  ownerId            String
  owner              User      @relation("HotelOwner", fields: [ownerId], references: [id])
  members            HotelMember[]
  rooms              Room[]
  bookings           Booking[]
  guests             Guest[]
  ratePlans          RatePlan[]

  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}

// ─── Users ─────────────────────────────────────────────
enum UserRole {
  SUPER_ADMIN   // StayOS admin
  OWNER         // владелец отеля
  ADMIN         // управляющий
  STAFF         // ресепшн
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?   // hashed
  image         String?
  role          UserRole  @default(OWNER)
  hotels        Hotel[]   @relation("HotelOwner")
  memberships   HotelMember[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}

model HotelMember {
  id        String   @id @default(cuid())
  hotelId   String
  userId    String
  role      UserRole @default(STAFF)
  hotel     Hotel    @relation(fields: [hotelId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  @@unique([hotelId, userId])
}

// ─── Rooms ─────────────────────────────────────────────
enum RoomType {
  STANDARD
  DELUXE
  SUITE
  APARTMENT
  DORMITORY
  VILLA
}

enum RoomStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  BLOCKED
}

model Room {
  id            String     @id @default(cuid())
  hotelId       String
  hotel         Hotel      @relation(fields: [hotelId], references: [id])
  name          String     // "Номер 101", "Люкс Панорама"
  roomNumber    String?
  type          RoomType   @default(STANDARD)
  status        RoomStatus @default(AVAILABLE)
  floor         Int?
  capacity      Int        @default(2)   // макс гостей
  bedCount      Int        @default(1)
  bedType       String?    // "Двуспальная", "Две односпальных"
  pricePerNight Decimal    @db.Decimal(10,2)
  weekendPrice  Decimal?   @db.Decimal(10,2)
  description   String?
  amenities     String[]   @default([])
  photos        String[]   @default([])
  isActive      Boolean    @default(true)
  sortOrder     Int        @default(0)
  bookings      Booking[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

// ─── Guests (CRM) ──────────────────────────────────────
model Guest {
  id             String    @id @default(cuid())
  hotelId        String
  hotel          Hotel     @relation(fields: [hotelId], references: [id])
  firstName      String
  lastName       String
  email          String?
  phone          String?
  passportNumber String?
  nationality    String?
  birthDate      DateTime?
  notes          String?
  tags           String[]  @default([])  // ["VIP", "Постоянный", ...]
  totalVisits    Int       @default(0)
  totalSpent     Decimal   @default(0) @db.Decimal(10,2)
  bookings       Booking[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([hotelId, email])
}

// ─── Bookings ──────────────────────────────────────────
enum BookingStatus {
  PENDING        // ожидает подтверждения
  CONFIRMED      // подтверждена
  CHECKED_IN     // заселён
  CHECKED_OUT    // выселился
  CANCELLED      // отменена
  NO_SHOW        // не приехал
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
}

enum BookingSource {
  DIRECT         // через сайт отеля
  WIDGET         // через встроенный виджет
  MANUAL         // создана вручную в панели
  BOOKING_COM
  AIRBNB
  OTHER
}

model Booking {
  id              String        @id @default(cuid())
  bookingNumber   String        @unique  // #STY-2024-0001
  hotelId         String
  hotel           Hotel         @relation(fields: [hotelId], references: [id])
  roomId          String
  room            Room          @relation(fields: [roomId], references: [id])
  guestId         String?
  guest           Guest?        @relation(fields: [guestId], references: [id])

  // Guest info (denormalized for cases without account)
  guestFirstName  String
  guestLastName   String
  guestEmail      String?
  guestPhone      String?

  checkIn         DateTime
  checkOut        DateTime
  nights          Int
  adults          Int           @default(2)
  children        Int           @default(0)

  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  source          BookingSource @default(DIRECT)

  pricePerNight   Decimal       @db.Decimal(10,2)
  subtotal        Decimal       @db.Decimal(10,2)
  discount        Decimal       @default(0) @db.Decimal(10,2)
  taxes           Decimal       @default(0) @db.Decimal(10,2)
  totalPrice      Decimal       @db.Decimal(10,2)
  paidAmount      Decimal       @default(0) @db.Decimal(10,2)

  specialRequests String?
  internalNotes   String?
  ratePlanId      String?
  ratePlan        RatePlan?     @relation(fields: [ratePlanId], references: [id])

  stripeSessionId String?
  payments        Payment[]

  cancelledAt     DateTime?
  cancelReason    String?
  checkedInAt     DateTime?
  checkedOutAt    DateTime?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

// ─── Payments ──────────────────────────────────────────
enum PaymentMethod {
  STRIPE
  KASPI
  CASH
  BANK_TRANSFER
  OTHER
}

model Payment {
  id                String        @id @default(cuid())
  bookingId         String
  booking           Booking       @relation(fields: [bookingId], references: [id])
  amount            Decimal       @db.Decimal(10,2)
  currency          String        @default("KZT")
  method            PaymentMethod @default(STRIPE)
  status            String        // succeeded, pending, failed, refunded
  stripePaymentId   String?
  stripeReceiptUrl  String?
  notes             String?
  createdAt         DateTime      @default(now())
}

// ─── Rate Plans (сезонные тарифы) ──────────────────────
model RatePlan {
  id          String    @id @default(cuid())
  hotelId     String
  hotel       Hotel     @relation(fields: [hotelId], references: [id])
  name        String    // "Летний тариф", "Новогодний"
  description String?
  dateFrom    DateTime
  dateTo      DateTime
  multiplier  Float     @default(1.0)  // 1.5 = +50% к базовой цене
  isActive    Boolean   @default(true)
  bookings    Booking[]
  createdAt   DateTime  @default(now())
}

// ─── NextAuth ──────────────────────────────────────────
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🔑 ENV VARIABLES

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-32-chars"

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe (SaaS subscriptions)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Price IDs (создать в Stripe Dashboard)
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."

# Resend (emails)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@stayos.app"

# Supabase (storage)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="StayOS"
```

---

## 📋 FEATURE SPECS

### 1. 🌐 Публичный сайт отеля (`/[slug]`)

Каждый отель имеет уникальный URL. Страница содержит:
- Hero с фото, названием, рейтингом, кнопкой "Забронировать"
- Виджет выбора дат (check-in / check-out) + количество гостей
- Список доступных номеров с фото, ценой, кнопкой "Выбрать"
- О нас, Удобства, Расположение (Google Maps embed)
- Контакты, кнопка WhatsApp/Telegram

Логика доступности: при выборе дат — фильтровать номера исключая уже занятые Booking с пересечением дат (статус не CANCELLED).

---

### 2. 📅 Форма бронирования (`/[slug]/book`)

Пошаговый wizard (4 шага):

**Шаг 1 — Даты и номер**
- Выбор дат (date range picker)
- Показ доступных номеров с ценой за выбранный период
- Выбор номера

**Шаг 2 — Данные гостя**
- Имя, Фамилия, Email, Телефон
- Количество взрослых / детей
- Особые пожелания

**Шаг 3 — Оплата**
- Выбор: "Оплатить онлайн" (Stripe) или "Оплатить при заезде"
- Summary: номер, даты, количество ночей, итого
- Кнопка подтверждения

**Шаг 4 — Успех**
- Номер брони (#STY-2024-XXXX)
- Детали, инструкции по заезду
- Кнопки: добавить в календарь, поделиться

**После создания брони автоматически:**
- Отправить email гостю (React Email шаблон)
- Отправить Telegram уведомление в бот отеля
- Создать запись Guest если email новый
- Если оплата онлайн → редирект на Stripe Checkout

---

### 3. 📊 Dashboard — Главная

Stats cards (данные за сегодня):
- Заездов сегодня
- Выездов сегодня
- Занятость (% номеров)
- Выручка сегодня

Дополнительные виджеты:
- Ближайшие брони (следующие 7 дней)
- График выручки за 30 дней (Recharts LineChart)
- Occupancy за 30 дней (BarChart)
- Топ источников броней (PieChart: Direct / Widget / Manual / OTA)

---

### 4. 📋 Управление бронями

**Список:** таблица с пагинацией, фильтры по:
- Статус (Все / Подтверждена / Заселён / Выселился / Отменена)
- Даты (сегодня / эта неделя / этот месяц / произвольный диапазон)
- Номер
- Источник

**Действия на строке:**
- Просмотр деталей
- Изменить статус (Check-in / Check-out / Отменить)
- Принять оплату вручную
- Редактировать

**Создание брони вручную:**
- Поиск существующего гостя или создание нового
- Выбор номера (показывать только свободные на выбранные даты)
- Авто-расчёт суммы
- Выбор способа оплаты

**Детальная страница брони:**
- Все данные брони
- Timeline статусов
- История платежей
- Кнопки: Заселить / Выселить / Отменить / Распечатать / Отправить email повторно

---

### 5. 🗓 Календарь занятости

Горизонтальный timeline:
- Строки = номера
- Колонки = дни
- Брони отображаются как цветные полосы
- Клик на пустую ячейку → создать бронь
- Клик на существующую бронь → открыть детали
- Drag-to-create: зажать и потянуть → выбрать диапазон дат

Цвета по статусу:
- CONFIRMED = синий
- CHECKED_IN = зелёный
- PENDING = жёлтый
- MAINTENANCE = серый

---

### 6. 🛏 Управление номерами

**Список:** grid карточек с фото, названием, ценой, статусом

**Создание/редактирование номера:**
- Название, Тип, Этаж, Вместимость, Тип кровати
- Базовая цена за ночь
- Цена на выходные (опционально)
- Описание
- Удобства (чекбоксы: WiFi, TV, AC, холодильник, фен, балкон, ванная, кухня...)
- Фотографии (drag-drop upload, до 10 фото, сортировка)
- Статус: Активен / Техобслуживание / Заблокирован

---

### 7. 👥 CRM Гостей

**Список:** таблица с поиском по имени/email/телефону, фильтр по тегам

**Профиль гостя:**
- Личные данные
- Статистика: количество визитов, общая сумма, средний чек
- История броней (таблица)
- Теги (VIP, Постоянный, Проблемный...)
- Заметки
- Кнопка: создать новую бронь для гостя

**Экспорт:** CSV со всеми гостями

---

### 8. 💳 Платежи

**Список всех платежей** с фильтрами

**Для каждого платежа:**
- Ссылка на бронь
- Сумма, метод, статус
- Ссылка на чек Stripe (если онлайн)

**Генерация счёта:** PDF через @react-pdf/renderer с логотипом отеля

---

### 9. 📈 Отчёты и аналитика

Фильтр по периоду: 7 дней / 30 дней / 3 месяца / год / произвольный

Метрики:
- **Выручка:** общая, по номерам, по источникам
- **Занятость:** процент занятости по дням
- **ADR** (Average Daily Rate): средняя цена за ночь
- **RevPAR** (Revenue Per Available Room)
- **Брони:** количество, отмены, no-show процент
- **Гости:** новые vs повторные

Все графики на Recharts. Возможность экспорта в CSV.

---

### 10. ⚙️ Настройки

**Профиль отеля:** название, slug, описание, контакты, фото, галерея, удобства, время заезда/выезда, валюта, язык, часовой пояс

**Сезонные тарифы:** список тарифных планов с датами и коэффициентами

**Интеграции:**

*Telegram:*
- Инструкция по созданию бота через @BotFather
- Поле для токена бота
- Поле для chat_id (или кнопка "Найти автоматически")
- Кнопка "Отправить тестовое уведомление"
- Настройка: о каких событиях уведомлять (новая бронь, отмена, заезд, оплата)

*Онлайн-оплата:*
- Stripe Connect (OAuth подключение)
- Статус подключения

*Виджет бронирования:*
- Сгенерированный код `<script>` для встройки
- Превью виджета
- Настройки цветовой схемы виджета

**Команда:** пригласить сотрудника по email, роли, удаление

**Подписка:** текущий план, кнопка управления через Stripe Customer Portal

---

### 11. 🤖 Telegram Notifications

Реализация в `/lib/telegram.ts`:

```typescript
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  })
}
```

Шаблоны уведомлений:

```
🏨 <b>Новое бронирование!</b>
━━━━━━━━━━━━━━━
📋 Бронь: #STY-2024-0042
👤 Гость: Иван Иванов
📞 Телефон: +7 777 123 4567
🛏 Номер: Люкс 201
📅 Заезд: 15 января 2025
📅 Выезд: 18 января 2025
🌙 Ночей: 3
💰 Сумма: 75 000 ₸
💳 Оплата: Онлайн ✅
━━━━━━━━━━━━━━━
```

---

### 12. 💌 Email Templates (React Email)

Шаблоны:
- `booking-confirmation.tsx` — подтверждение для гостя
- `booking-reminder.tsx` — напоминание за 24 часа до заезда
- `booking-cancelled.tsx` — уведомление об отмене
- `team-invite.tsx` — приглашение сотрудника

---

### 13. 💰 SaaS Billing (Stripe)

Тарифы:
| Plan | Цена/мес | Номера | Брони/мес | Функции |
|------|----------|--------|-----------|---------|
| Free | 0 ₸ | до 3 | до 20 | Сайт + бронирование |
| Starter | 9 900 ₸ | до 10 | до 100 | + Telegram + Email |
| Pro | 24 900 ₸ | до 30 | ∞ | + Отчёты + API + CSV |
| Enterprise | 59 900 ₸ | ∞ | ∞ | + White-label + приоритет |

Реализация:
- При регистрации → создать Stripe Customer
- Страница `/dashboard/settings/billing` с текущим планом
- Upgrade/Downgrade → Stripe Customer Portal
- Webhook для обновления плана в БД при оплате/отмене

---

### 14. 🔌 Embeddable Widget (`/public/widget.js`)

Скрипт для встройки на сторонний сайт:
```html
<div id="stayos-widget"></div>
<script src="https://stayos.app/widget.js" data-hotel="my-hotel-slug"></script>
```

Widget.js создаёт iframe на `stayos.app/[slug]/book?embedded=true` без шапки/подвала.

---

## 🎨 DESIGN SYSTEM

**Цветовая палитра:**
```css
--primary: #1a56db     /* Основной синий */
--primary-dark: #1e429f
--accent: #0ea5e9      /* Светло-голубой */
--success: #057a55
--warning: #c27803
--danger: #e02424
--bg: #f9fafb
--surface: #ffffff
--border: #e5e7eb
--text: #111827
--muted: #6b7280
```

**Typography:**
- Заголовки: `font-family: 'Plus Jakarta Sans', sans-serif`
- Тело: `font-family: 'Inter', sans-serif`

**Dashboard UI принципы:**
- Sidebar: 240px, тёмный (#111827), иконки + текст
- Топбар: белый, тень, breadcrumb + действия
- Карточки: белые, border-radius 12px, тень sm
- Таблицы: striped, hover highlight, sticky header
- Кнопки: primary = синий, secondary = серый outline
- Все состояния загрузки через skeleton
- Empty states с иллюстрацией и CTA
- Mobile responsive (drawer sidebar)

---

## 🚀 DEVELOPMENT ORDER

Строить строго в таком порядке:

```
Phase 1 — Foundation (Day 1-2)
  ✅ Next.js init + зависимости
  ✅ Prisma schema + миграция
  ✅ NextAuth (email/password + Google)
  ✅ Layout компоненты (sidebar, topbar)
  ✅ Базовые shadcn компоненты

Phase 2 — Public (Day 3-4)
  ✅ Главный лендинг StayOS (marketing)
  ✅ Страница тарифов
  ✅ Публичный сайт отеля /[slug]
  ✅ Форма бронирования (без оплаты)

Phase 3 — Dashboard Core (Day 5-7)
  ✅ Dashboard Home со статистикой
  ✅ Управление номерами (CRUD + фото)
  ✅ Управление бронями (таблица + создание)
  ✅ Календарь занятости

Phase 4 — CRM & Finance (Day 8-9)
  ✅ Гости CRM
  ✅ Платежи + PDF счета
  ✅ Отчёты и графики

Phase 5 — Integrations (Day 10-11)
  ✅ Telegram уведомления
  ✅ Email уведомления (Resend)
  ✅ Stripe для онлайн-броней

Phase 6 — SaaS Layer (Day 12-13)
  ✅ Stripe Billing + тарифы
  ✅ Страница Billing в dashboard
  ✅ Лимиты по тарифам (middleware)

Phase 7 — Polish & Deploy (Day 14)
  ✅ Seed данные (3 отеля, 20 номеров, 100 броней)
  ✅ Error boundaries, loading states
  ✅ Vercel + Supabase деплой
  ✅ README с документацией
```

---

## 📦 DEPENDENCIES

```bash
npx create-next-app@latest stayos --typescript --tailwind --app --src-dir

# Core
npm install @prisma/client prisma
npm install next-auth@beta @auth/prisma-adapter
npm install zod react-hook-form @hookform/resolvers

# UI
npx shadcn@latest init
npx shadcn@latest add button card input label select checkbox textarea badge
npx shadcn@latest add dialog sheet dropdown-menu table tabs avatar
npx shadcn@latest add skeleton toast calendar date-picker popover
npm install framer-motion
npm install lucide-react
npm install sonner
npm install @radix-ui/react-icons

# Data & Charts
npm install @tanstack/react-query
npm install recharts
npm install date-fns

# Payments
npm install stripe @stripe/stripe-js

# Email
npm install resend @react-email/components

# PDF
npm install @react-pdf/renderer

# Upload
npm install @supabase/supabase-js

# Utils
npm install clsx tailwind-merge
npm install bcryptjs
npm install @types/bcryptjs
```

---

## ⚡ KEY IMPLEMENTATION NOTES

1. **Multi-tenancy:** Каждый запрос к БД фильтровать по `hotelId`. Получать `hotelId` из сессии пользователя. Никогда не возвращать данные чужих отелей.

2. **Booking Number:** Генерировать как `STY-${year}-${padStart(count+1, 4, '0')}` — красивые уникальные номера.

3. **Доступность номера:** При запросе доступных номеров на даты использовать:
```sql
WHERE id NOT IN (
  SELECT roomId FROM Booking 
  WHERE hotelId = ? 
  AND status NOT IN ('CANCELLED')
  AND checkIn < ?checkOut 
  AND checkOut > ?checkIn
)
```

4. **Telegram Setup Flow:** В настройках показать пошаговую инструкцию:
   - Создать бота через @BotFather → получить токен
   - Добавить бота в группу или написать ему
   - Нажать "Найти chat_id автоматически" → вызвать getUpdates API

5. **Rate Limiting:** На публичные API роуты (`/api/widget/`) добавить rate limiting через `headers['x-forwarded-for']`.

6. **Image Upload:** Фото номеров загружать в Supabase Storage bucket `room-photos`. Возвращать публичный URL.

7. **Prisma Seed:** Создать реалистичные тестовые данные — отель "Гостевой дом Алатау" в Алматы, 8 номеров разных типов, 50 броней за последние 3 месяца, 30 гостей.

---

## 🔒 SECURITY CHECKLIST

- [ ] Все dashboard роуты защищены middleware (проверка сессии)
- [ ] API роуты проверяют `hotelId` из сессии (не из запроса)
- [ ] Stripe webhook проверяет подпись (`stripe.webhooks.constructEvent`)
- [ ] Пароли хешируются через bcryptjs (saltRounds: 12)
- [ ] Загружаемые файлы проверяются по типу и размеру (макс 5MB, только image/*)
- [ ] Публичные API (`/widget/`) не раскрывают внутренние ID
- [ ] SQL-инъекции невозможны (Prisma ORM)
- [ ] XSS защита через Next.js встроенную санитизацию

---

## 📝 НАЧАЛО РАБОТЫ

Запусти первую команду:

```bash
npx create-next-app@latest stayos --typescript --tailwind --app
cd stayos
```

Затем начни с `Phase 1` и двигайся поэтапно. После каждой фазы — коммит в git.

При любых неясностях в требованиях — уточняй перед реализацией, не додумывай самостоятельно.

---

*StayOS — Making hospitality simple. Built with Claude Code.*
