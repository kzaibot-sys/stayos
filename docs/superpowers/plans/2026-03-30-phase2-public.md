# StayOS Phase 2: Public Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build the public-facing pages: SaaS marketing landing, pricing page, hotel public site, and booking form.

**Architecture:** Static/SSR pages in Next.js App Router under `/(marketing)` route group. Hotel pages are dynamic SSR using slug param. Booking form is a multi-step wizard (client component).

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion, date-fns, Prisma

---

## File Structure

```
/app
  /(marketing)
    /layout.tsx              — Marketing layout (navbar + footer)
    /page.tsx                — SaaS landing page
    /pricing/page.tsx        — Pricing/plans page
  /[slug]
    /page.tsx                — Hotel public site
    /book/page.tsx           — Booking wizard
    /book/success/page.tsx   — Booking success page
/components
  /marketing/
    /navbar.tsx              — Marketing site navbar
    /hero.tsx                — Landing hero section
    /features.tsx            — Features grid
    /pricing-cards.tsx       — Pricing cards
    /footer.tsx              — Site footer
  /hotel-page/
    /hotel-hero.tsx          — Hotel page hero with cover image
    /room-card.tsx           — Room card with photo, price, features
    /amenities-list.tsx      — Hotel amenities display
  /booking/
    /booking-wizard.tsx      — Multi-step booking form container
    /step-dates.tsx          — Step 1: Date selection + room choice
    /step-guest.tsx          — Step 2: Guest information
    /step-payment.tsx        — Step 3: Payment method + summary
    /step-success.tsx        — Step 4: Success confirmation
/app/api
  /hotels/[slug]/route.ts   — Public hotel data API
  /hotels/[slug]/rooms/route.ts — Available rooms API
  /bookings/public/route.ts — Create booking (public)
```

---

### Task 1: Marketing Layout (Navbar + Footer)

**Files:**
- Create: `app/(marketing)/layout.tsx`
- Create: `components/marketing/navbar.tsx`
- Create: `components/marketing/footer.tsx`

**navbar.tsx** — "use client":
- White bg, sticky top, border-b, shadow-sm
- Left: StayOS logo (BedDouble + "StayOS", link to /)
- Right: Links — Возможности, Тарифы (/pricing), Войти (/login)
- Mobile: hamburger → Sheet with links
- Smooth, professional look

**footer.tsx**:
- Dark bg (#111827), white text
- Columns: Продукт (links), Компания (links), Контакты
- Bottom: © 2024 StayOS. Все права защищены.

**layout.tsx**:
- Navbar at top, children, Footer at bottom
- No sidebar (public pages)

Commit: `"ui: add marketing navbar and footer"`

---

### Task 2: SaaS Landing Page

**Files:**
- Create: `app/(marketing)/page.tsx` (replace existing root redirect — move redirect logic to middleware or keep separate)
- Create: `components/marketing/hero.tsx`
- Create: `components/marketing/features.tsx`

NOTE: The current app/page.tsx does auth redirect. Move landing to /(marketing)/page.tsx. The root app/page.tsx should remain as the redirect handler, and /(marketing)/page.tsx will be the actual landing for non-auth users. Actually, better approach: make app/page.tsx the landing page for non-authenticated users, and redirect to dashboard if authenticated.

Update `app/page.tsx`:
- If session exists → redirect to /dashboard
- If no session → render the landing page content

**hero.tsx**:
- Big headline: "Управляйте отелем легко"
- Subtitle: "StayOS — современная платформа для мини-отелей, гостевых домов и хостелов"
- CTA buttons: "Начать бесплатно" → /register, "Узнать больше" → #features
- Background gradient or illustration placeholder
- Use Framer Motion for fade-in animations

**features.tsx**:
- Section title: "Всё что нужно для вашего отеля"
- Grid of 6 feature cards:
  1. Онлайн-бронирование (CalendarCheck icon)
  2. Управление номерами (BedDouble)
  3. CRM гостей (Users)
  4. Аналитика и отчёты (BarChart3)
  5. Telegram-уведомления (MessageCircle)
  6. Приём оплат (CreditCard)
- Each card: icon, title, 1-2 sentence description
- Framer Motion stagger animation

Commit: `"pages: add SaaS landing page with hero and features"`

---

### Task 3: Pricing Page

**Files:**
- Create: `app/(marketing)/pricing/page.tsx`
- Create: `components/marketing/pricing-cards.tsx`

**pricing-cards.tsx**:
- 4 plan cards side by side (responsive: stack on mobile):

  | Free | Starter | Pro | Enterprise |
  |------|---------|-----|------------|
  | 0 ₸/мес | 9 900 ₸/мес | 24 900 ₸/мес | 59 900 ₸/мес |
  | до 3 номеров | до 10 номеров | до 30 номеров | Без ограничений |
  | до 20 броней/мес | до 100 броней/мес | Без ограничений | Без ограничений |
  | Сайт + бронирование | + Telegram + Email | + Отчёты + API + CSV | + White-label + приоритет |

- Highlight "Pro" as recommended (border-primary, "Популярный" badge)
- CTA button: "Начать бесплатно" on all cards → /register
- Clean, modern card design

Commit: `"pages: add pricing page with plan cards"`

---

### Task 4: Hotel Public API

**Files:**
- Create: `app/api/hotels/[slug]/route.ts`
- Create: `app/api/hotels/[slug]/rooms/route.ts`

**hotels/[slug]/route.ts** — GET:
- Find hotel by slug with rooms included
- Return public-safe data (no tokens, no internal fields)
- 404 if not found

**hotels/[slug]/rooms/route.ts** — GET:
- Query params: checkIn, checkOut (optional dates)
- Return available rooms for the hotel
- If dates provided, filter out rooms with conflicting bookings:
  ```
  WHERE hotelId = hotel.id AND isActive = true
  AND id NOT IN (
    SELECT roomId FROM Booking
    WHERE hotelId = hotel.id
    AND status != 'CANCELLED'
    AND checkIn < checkOutParam
    AND checkOut > checkInParam
  )
  ```
- Return rooms sorted by sortOrder

Commit: `"api: add public hotel and rooms endpoints"`

---

### Task 5: Hotel Public Page

**Files:**
- Create: `app/[slug]/page.tsx`
- Create: `components/hotel-page/hotel-hero.tsx`
- Create: `components/hotel-page/room-card.tsx`
- Create: `components/hotel-page/amenities-list.tsx`

**app/[slug]/page.tsx** — Server component:
- Fetch hotel by slug from DB (with rooms)
- If not found → notFound()
- Render: HotelHero → amenities → room cards → contact info
- SEO: dynamic metadata (title, description)

**hotel-hero.tsx**:
- Cover image (or gradient placeholder if no image)
- Hotel name (large), city, short description
- Check-in/out times
- CTA: "Забронировать" button → /[slug]/book

**room-card.tsx**:
- Card with room photo placeholder (or first photo)
- Room name, type badge, capacity (guests icon + number)
- Price per night in KZT (formatted with spaces: 15 000 ₸)
- Amenities tags (first 4-5)
- "Выбрать" button

**amenities-list.tsx**:
- Grid of amenity badges with icons
- Map common amenity names to icons (WiFi → Wifi, Parking → Car, etc.)

Commit: `"pages: add hotel public site with rooms display"`

---

### Task 6: Public Booking API

**Files:**
- Create: `app/api/bookings/public/route.ts`

**POST** — Create a booking:
- Input: hotelId, roomId, checkIn, checkOut, guestFirstName, guestLastName, guestEmail, guestPhone, adults, children, specialRequests, paymentMethod ("online" | "on_arrival")
- Validate with zod
- Check room availability (no conflicting bookings)
- Calculate: nights (date-fns differenceInDays), pricePerNight (check weekend price), subtotal, totalPrice
- Generate bookingNumber: `STY-${year}-${padStart(count+1, 4, '0')}`
- Create or find Guest by email + hotelId
- Create Booking record
- Return booking data with bookingNumber

Commit: `"api: add public booking creation endpoint"`

---

### Task 7: Booking Wizard

**Files:**
- Create: `app/[slug]/book/page.tsx`
- Create: `components/booking/booking-wizard.tsx`
- Create: `components/booking/step-dates.tsx`
- Create: `components/booking/step-guest.tsx`
- Create: `components/booking/step-payment.tsx`

**app/[slug]/book/page.tsx** — Server component:
- Fetch hotel by slug
- If not found → notFound()
- Render BookingWizard with hotel data

**booking-wizard.tsx** — "use client":
- State: currentStep (1-4), bookingData
- Step indicator at top (1. Даты → 2. Гость → 3. Оплата → 4. Готово)
- Renders current step component
- Manages data flow between steps

**step-dates.tsx**:
- Date range picker for check-in / check-out
- Number of guests (adults/children) selectors
- Fetch available rooms from API when dates selected
- Display room cards with "Выбрать" buttons
- On room select → next step with room + dates data

**step-guest.tsx**:
- Form: firstName, lastName, email, phone
- Adults / children count
- Special requests textarea
- Validation with zod
- "Далее" button → next step

**step-payment.tsx**:
- Booking summary: room name, dates, nights, price breakdown
- Payment method choice:
  - "Оплатить онлайн" (disabled for now, will be enabled with Stripe)
  - "Оплатить при заезде" (active)
- Total price display
- "Подтвердить бронирование" button
- Submit to /api/bookings/public
- On success → redirect to /[slug]/book/success?booking=BOOKING_NUMBER

Commit: `"pages: add multi-step booking wizard"`

---

### Task 8: Booking Success Page

**Files:**
- Create: `app/[slug]/book/success/page.tsx`

- Show booking number prominently (#STY-2024-XXXX)
- Booking details: room, dates, guest name, total
- Instructions: check-in time, hotel address, contact info
- "Вернуться на сайт отеля" link

Commit: `"pages: add booking success page"`
