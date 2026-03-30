# StayOS — Phase 1: Foundation Design

## Overview

Phase 1 creates the project skeleton: Next.js app, database schema, authentication, and dashboard layout. After this phase, users can register, log in, and see an empty dashboard with full navigation.

## Scope

- Project init (Next.js 14, App Router, TypeScript, Tailwind)
- All npm dependencies from spec
- Prisma schema (full, from spec) with SQLite for local dev
- Seed data (1 hotel, a few rooms, test user)
- NextAuth v5 (Credentials + Google OAuth stub)
- Auth middleware protecting `/dashboard/*`
- Dashboard layout: Sidebar (dark, 240px) + Topbar (white, breadcrumb)
- shadcn/ui components init
- Custom Tailwind theme (colors, fonts from spec)
- Registration page (creates user + hotel)
- Login page

## Architecture

### Database: SQLite (local) → PostgreSQL (deploy)

Prisma schema uses the full model set from spec:
- Hotel, User, HotelMember (multi-tenancy)
- Room, Booking, Guest, Payment, RatePlan (core domain)
- Account, Session (NextAuth)

SQLite for local development. Switch `datasource db.provider` to `postgresql` and set `DATABASE_URL` to Supabase before deploy.

### Auth Flow

1. Register: email + password + hotel name + slug → creates User (OWNER) + Hotel
2. Login: email + password → NextAuth session with `userId` + `hotelId`
3. Middleware: `/dashboard/*` requires valid session, redirects to `/login`
4. Google OAuth: configured but requires env vars to function

### Layout Structure

```
/(dashboard)/layout.tsx
├── Sidebar (240px, fixed, #111827 bg)
│   ├── Logo "StayOS"
│   ├── Nav items with lucide icons
│   │   ├── Dashboard (LayoutDashboard)
│   │   ├── Bookings (CalendarCheck)
│   │   ├── Calendar (Calendar)
│   │   ├── Rooms (BedDouble)
│   │   ├── Guests (Users)
│   │   ├── Payments (CreditCard)
│   │   ├── Reports (BarChart3)
│   │   └── Settings (Settings)
│   └── User info + logout at bottom
├── Topbar (white, shadow, h-16)
│   ├── Breadcrumb
│   ├── Hotel name
│   └── User avatar dropdown
└── Main content (ml-240px, p-6)
```

Mobile: Sidebar hidden, hamburger in Topbar opens Sheet (drawer).

### Design Tokens (Tailwind)

```
primary: #1a56db
primary-dark: #1e429f
accent: #0ea5e9
success: #057a55
warning: #c27803
danger: #e02424
bg: #f9fafb
surface: #ffffff
border: #e5e7eb
text: #111827
muted: #6b7280
```

Fonts: Plus Jakarta Sans (headings), Inter (body) via next/font/google.

### shadcn/ui Components

Init with "new-york" style. Install:
button, card, input, label, select, checkbox, textarea, badge,
dialog, sheet, dropdown-menu, table, tabs, avatar,
skeleton, calendar, popover.

Toast via sonner (not shadcn toast).

## Out of Scope (Phase 1)

- Public hotel pages
- Booking flow
- Room/booking CRUD
- Payments, reports, integrations
- Stripe, Telegram, Email, PDF
- Widget

## Success Criteria

1. `npm run dev` starts without errors
2. `/register` creates user + hotel in DB
3. `/login` authenticates and redirects to `/dashboard`
4. `/dashboard` shows sidebar + topbar + empty content
5. Unauthenticated users redirected to `/login`
6. Mobile sidebar works as drawer
