# StayOS Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a working Next.js app with database, authentication, and dashboard layout — the foundation for all subsequent features.

**Architecture:** Next.js 14 App Router with Prisma ORM (SQLite for local dev), NextAuth v5 for authentication, shadcn/ui for components. Multi-tenant by hotelId stored in session.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, NextAuth v5, shadcn/ui, bcryptjs, lucide-react, sonner

---

## File Structure

```
/app
  /layout.tsx                    — Root layout (fonts, providers)
  /page.tsx                      — Redirect to /login or /dashboard
  /(auth)
    /login/page.tsx              — Login form
    /register/page.tsx           — Register form (user + hotel)
  /(dashboard)
    /layout.tsx                  — Dashboard layout (sidebar + topbar)
    /page.tsx                    — Empty dashboard home placeholder
/components
  /ui/                           — shadcn components (auto-generated)
  /dashboard/
    /sidebar.tsx                 — Dark sidebar navigation
    /topbar.tsx                  — White topbar with breadcrumb
    /user-nav.tsx                — User avatar dropdown
  /providers.tsx                 — Session provider wrapper
/lib
  /prisma.ts                     — Prisma client singleton
  /auth.ts                       — NextAuth config
  /utils.ts                      — cn() helper
/prisma
  /schema.prisma                 — Full database schema
  /seed.ts                       — Test data seeder
/middleware.ts                   — Auth route protection
```

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: entire project scaffold via `create-next-app`

- [ ] **Step 1: Create Next.js app**

```bash
cd "C:/Users/aiman/OneDrive/Desktop/hotel"
npx create-next-app@latest stayos --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
```

- [ ] **Step 2: Move all files from stayos/ to hotel/ root**

Move contents of the created `stayos/` directory into the `hotel/` project root (the current working directory).

- [ ] **Step 3: Verify it runs**

```bash
npm run dev
```

Expected: Next.js dev server starts on http://localhost:3000

- [ ] **Step 4: Init git repo and commit**

```bash
git init
git add -A
git commit -m "init: Next.js 14 project scaffold"
```

---

### Task 2: Install All Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install core dependencies**

```bash
npm install @prisma/client next-auth@beta @auth/prisma-adapter zod react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Install UI dependencies**

```bash
npm install framer-motion lucide-react sonner clsx tailwind-merge
```

- [ ] **Step 3: Install data & utility dependencies**

```bash
npm install recharts date-fns bcryptjs @tanstack/react-query
npm install -D prisma @types/bcryptjs
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: install all project dependencies"
```

---

### Task 3: Initialize shadcn/ui

**Files:**
- Create: `components.json`
- Create: `components/ui/*.tsx` (all shadcn components)
- Modify: `tailwind.config.ts` (shadcn config + custom colors)
- Modify: `app/globals.css` (shadcn CSS variables)

- [ ] **Step 1: Init shadcn**

```bash
npx shadcn@latest init -d
```

Select: New York style, Zinc base color, CSS variables: yes.

- [ ] **Step 2: Install shadcn components**

```bash
npx shadcn@latest add button card input label select checkbox textarea badge dialog sheet dropdown-menu table tabs avatar skeleton calendar popover separator tooltip
```

- [ ] **Step 3: Update tailwind.config.ts with custom design tokens**

Add the StayOS color palette to `tailwind.config.ts` extend section:

```typescript
colors: {
  primary: {
    DEFAULT: '#1a56db',
    dark: '#1e429f',
    foreground: '#ffffff',
  },
  accent: {
    DEFAULT: '#0ea5e9',
    foreground: '#ffffff',
  },
  success: '#057a55',
  warning: '#c27803',
  danger: '#e02424',
  surface: '#ffffff',
  muted: {
    DEFAULT: '#f9fafb',
    foreground: '#6b7280',
  },
}
```

- [ ] **Step 4: Configure fonts in app/layout.tsx**

```typescript
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})
```

Apply to `<body className={`${jakarta.variable} ${inter.variable} font-sans`}>`.

Add to tailwind.config.ts:
```typescript
fontFamily: {
  sans: ['var(--font-body)', 'sans-serif'],
  heading: ['var(--font-heading)', 'sans-serif'],
}
```

- [ ] **Step 5: Create lib/utils.ts**

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "ui: initialize shadcn/ui with custom design tokens and fonts"
```

---

### Task 4: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`

- [ ] **Step 1: Create prisma/schema.prisma**

Full schema with SQLite provider. Remove all `@db.Decimal(10,2)` and `@db.Text` annotations (SQLite doesn't support them). Use `Float` instead of `Decimal` for SQLite compatibility. Keep all models: Hotel, User, HotelMember, Room, Booking, Guest, Payment, RatePlan, Account, Session. Keep all enums: Plan, UserRole, RoomType, RoomStatus, BookingStatus, PaymentStatus, BookingSource, PaymentMethod.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

enum Plan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum UserRole {
  SUPER_ADMIN
  OWNER
  ADMIN
  STAFF
}

model Hotel {
  id                 String    @id @default(cuid())
  name               String
  slug               String    @unique
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
  galleryUrls        String    @default("[]")
  amenities          String    @default("[]")
  checkInTime        String    @default("14:00")
  checkOutTime       String    @default("12:00")
  currency           String    @default("KZT")
  timezone           String    @default("Asia/Almaty")
  language           String    @default("ru")

  plan               Plan      @default(FREE)
  stripeCustomerId   String?
  stripeSubId        String?
  planExpiresAt      DateTime?

  telegramBotToken   String?
  telegramChatId     String?
  stripeAccountId    String?

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

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?
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
  name          String
  roomNumber    String?
  type          RoomType   @default(STANDARD)
  status        RoomStatus @default(AVAILABLE)
  floor         Int?
  capacity      Int        @default(2)
  bedCount      Int        @default(1)
  bedType       String?
  pricePerNight Float
  weekendPrice  Float?
  description   String?
  amenities     String     @default("[]")
  photos        String     @default("[]")
  isActive      Boolean    @default(true)
  sortOrder     Int        @default(0)
  bookings      Booking[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

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
  tags           String    @default("[]")
  totalVisits    Int       @default(0)
  totalSpent     Float     @default(0)
  bookings       Booking[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  @@unique([hotelId, email])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
}

enum BookingSource {
  DIRECT
  WIDGET
  MANUAL
  BOOKING_COM
  AIRBNB
  OTHER
}

model Booking {
  id              String        @id @default(cuid())
  bookingNumber   String        @unique
  hotelId         String
  hotel           Hotel         @relation(fields: [hotelId], references: [id])
  roomId          String
  room            Room          @relation(fields: [roomId], references: [id])
  guestId         String?
  guest           Guest?        @relation(fields: [guestId], references: [id])

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

  pricePerNight   Float
  subtotal        Float
  discount        Float         @default(0)
  taxes           Float         @default(0)
  totalPrice      Float
  paidAmount      Float         @default(0)

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
  amount            Float
  currency          String        @default("KZT")
  method            PaymentMethod @default(STRIPE)
  status            String
  stripePaymentId   String?
  stripeReceiptUrl  String?
  notes             String?
  createdAt         DateTime      @default(now())
}

model RatePlan {
  id          String    @id @default(cuid())
  hotelId     String
  hotel       Hotel     @relation(fields: [hotelId], references: [id])
  name        String
  description String?
  dateFrom    DateTime
  dateTo      DateTime
  multiplier  Float     @default(1.0)
  isActive    Boolean   @default(true)
  bookings    Booking[]
  createdAt   DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
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

- [ ] **Step 2: Create lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration creates all tables in SQLite, generates Prisma Client.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "db: add full Prisma schema with SQLite for local dev"
```

---

### Task 5: NextAuth Configuration

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `.env.local`

- [ ] **Step 1: Create .env.local**

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-dev-key-change-in-prod-32chars
```

- [ ] **Step 2: Create lib/auth.ts**

```typescript
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { hotels: true },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hotelId: user.hotels[0]?.id || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.hotelId = (user as any).hotelId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
        (session.user as any).role = token.role
        (session.user as any).hotelId = token.hotelId
      }
      return session
    },
  },
}
```

- [ ] **Step 3: Create app/api/auth/[...nextauth]/route.ts**

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 4: Create types/next-auth.d.ts for session typing**

```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      hotelId: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    hotelId: string | null
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "auth: configure NextAuth with credentials provider and JWT sessions"
```

---

### Task 6: Auth API Routes (Register)

**Files:**
- Create: `app/api/auth/register/route.ts`

- [ ] **Step 1: Create registration API route**

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  hotelName: z.string().min(2),
  hotelSlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, hotelName, hotelSlug } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email уже используется" }, { status: 400 })
    }

    const existingSlug = await prisma.hotel.findUnique({ where: { slug: hotelSlug } })
    if (existingSlug) {
      return NextResponse.json({ error: "Этот URL уже занят" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "OWNER",
        hotels: {
          create: {
            name: hotelName,
            slug: hotelSlug,
          },
        },
      },
      include: { hotels: true },
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      hotel: user.hotels[0],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "auth: add registration API with user + hotel creation"
```

---

### Task 7: Auth Middleware

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create middleware.ts**

```typescript
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "auth: add middleware to protect dashboard routes"
```

---

### Task 8: Session Provider

**Files:**
- Create: `components/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create components/providers.tsx**

```typescript
"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] **Step 2: Update app/layout.tsx to wrap with Providers**

Import and wrap `{children}` with `<Providers>`. Also add `<Toaster />` from sonner.

```typescript
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"

// In the body:
<Providers>
  {children}
  <Toaster richColors position="top-right" />
</Providers>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "auth: add session provider and toast notifications"
```

---

### Task 9: Login Page

**Files:**
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Create login page**

Full login form with:
- Email + Password fields (shadcn Input)
- "Войти" button (shadcn Button)
- Link to /register
- Uses `signIn("credentials", ...)` from next-auth/react
- Error display with sonner toast
- Redirect to /dashboard on success
- Centered card layout, StayOS branding

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "pages: add login page with credentials form"
```

---

### Task 10: Register Page

**Files:**
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create register page**

Registration form with:
- Name, Email, Password fields
- Hotel Name, Hotel URL (slug) fields
- Slug auto-generation from hotel name (transliterate + lowercase + dashes)
- "Создать аккаунт" button
- POST to /api/auth/register, then signIn on success
- Link to /login
- Centered card layout, StayOS branding

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "pages: add registration page with hotel creation"
```

---

### Task 11: Dashboard Sidebar

**Files:**
- Create: `components/dashboard/sidebar.tsx`

- [ ] **Step 1: Create sidebar component**

Dark sidebar (#111827 bg, 240px width):
- StayOS logo at top (text + BedDouble icon)
- Navigation items with lucide icons:
  - Главная (LayoutDashboard) → /dashboard
  - Брони (CalendarCheck) → /dashboard/bookings
  - Календарь (Calendar) → /dashboard/calendar
  - Номера (BedDouble) → /dashboard/rooms
  - Гости (Users) → /dashboard/guests
  - Платежи (CreditCard) → /dashboard/payments
  - Отчёты (BarChart3) → /dashboard/reports
  - Настройки (Settings) → /dashboard/settings
- Active state: highlight with primary color bg
- Use `usePathname()` to detect active route
- User info + logout button at bottom
- `"use client"` component

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "ui: add dashboard sidebar with navigation"
```

---

### Task 12: Dashboard Topbar

**Files:**
- Create: `components/dashboard/topbar.tsx`
- Create: `components/dashboard/user-nav.tsx`

- [ ] **Step 1: Create user-nav.tsx**

User avatar dropdown (DropdownMenu from shadcn):
- Avatar with initials
- User name + email
- Menu items: Профиль, Настройки, Выйти
- Logout calls `signOut()` from next-auth

- [ ] **Step 2: Create topbar.tsx**

White topbar (h-16, shadow-sm, border-b):
- Left: hamburger button (mobile only) + page title/breadcrumb
- Right: UserNav component
- Hotel name display

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ui: add dashboard topbar with user navigation"
```

---

### Task 13: Dashboard Layout

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Create dashboard layout**

```typescript
// Server component that gets session
// Renders Sidebar + Topbar + main content
// Mobile: Sidebar hidden, Sheet drawer via hamburger
// Desktop: Sidebar fixed left, content with ml-[240px]
```

Layout structure:
- Check session server-side with `getServerSession(authOptions)`
- If no session, redirect to /login
- Get hotel data from prisma using session.user.hotelId
- Pass hotel + user to Sidebar and Topbar
- Mobile responsive with Sheet component for sidebar drawer

- [ ] **Step 2: Create dashboard home page (placeholder)**

```typescript
// Simple page with "Добро пожаловать в StayOS" heading
// Will be expanded in Phase 3 with stats cards
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ui: add dashboard layout with responsive sidebar drawer"
```

---

### Task 14: Root Page Redirect

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update root page**

Check if user is authenticated:
- If yes → redirect to /dashboard
- If no → redirect to /login

(In Phase 2, this will become the marketing landing page)

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "pages: add root redirect based on auth status"
```

---

### Task 15: Seed Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

- [ ] **Step 1: Create prisma/seed.ts**

Create test data:
- 1 user: admin@stayos.app / password123
- 1 hotel: "Гостевой дом Алатау", slug: "alatau", city: Алматы
- 3 rooms: Стандарт (15000 KZT), Делюкс (25000 KZT), Люкс (40000 KZT)

Use bcryptjs to hash the password.

- [ ] **Step 2: Add seed config to package.json**

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

Install tsx: `npm install -D tsx`

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "db: add seed data with test hotel and rooms"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Start dev server and verify full flow**

```bash
npm run dev
```

Test:
1. Open http://localhost:3000 → redirects to /login
2. Click "Создать аккаунт" → register page
3. Register new user → redirects to dashboard
4. Dashboard shows sidebar + topbar + welcome message
5. Logout → redirects to login
6. Login with credentials → dashboard again
7. Login with seed user: admin@stayos.app / password123

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "phase1: foundation complete — auth, layout, database"
```
