@AGENTS.md

# StayOS — SaaS платформа для мини-отелей

## Проект
- **Домен:** stayos.aibot.kz
- **GitHub:** https://github.com/kzaibot-sys/stayos
- **Railway:** project ID 2edbc531-5a9e-44d3-8da7-891f87e6b993
- **PostgreSQL (public):** postgresql://postgres:yPYtZHOBayEoAkyooyvakSmzyfawAjSa@trolley.proxy.rlwy.net:43604/railway
- **PostgreSQL (internal):** postgresql://postgres:yPYtZHOBayEoAkyooyvakSmzyfawAjSa@postgres.railway.internal:5432/railway

## Аккаунты
- **Super Admin:** admin@stayos.aibot.kz / StayOS2026! (role: SUPER_ADMIN)
- База данных ОЧИЩЕНА 2026-03-30 — все тестовые данные удалены, только super admin остался

## Стек
- Next.js 16.2.1 (App Router, TypeScript, Tailwind v4)
- Prisma 7.6.0 + PrismaPg adapter (обязательно, без него PrismaClient не работает)
- prisma.config.ts для datasource URL (НЕ в schema.prisma)
- NextAuth v5 (next-auth@beta), trustHost: true для Railway
- shadcn/ui с @base-ui/react (НЕ radix — используем `render` prop, НЕ `asChild`)
- Stripe lazy init через getStripe()
- Resend для email (RESEND_API_KEY настроен в Railway)
- Dockerfile с node:22-alpine (Prisma 7 требует Node 22.12+)

## Дизайн
- **Бренд-цвета:** зелёный #1b4332 / #2d6a4f, золотой #d4a373
- **Публичная страница отеля:** полный редизайн в стиле Asyr Hotel — зелёный навбар, герой с градиентом, bento-grid преимущества, премиальные карточки номеров, тёмно-зелёная секция контактов
- **Лендинг (/):** современный с grid-фоном, градиентным текстом, статистикой, CTA-секциями
- **Тарифы (/pricing):** Free (0₸), Starter (49,900₸), Pro (99,900₸), Enterprise (индивидуально)
- **Дашборд:** CSS переменные для dark mode (bg-card, text-foreground, border-border)

## Email система (Resend)
8 брендированных шаблонов в lib/email-templates.ts:
1. Подтверждение бронирования (гостю)
2. Напоминание о заезде за день (гостю, cron)
3. Отмена бронирования (гостю)
4. Спасибо + отзыв после выезда (гостю)
5. Новое бронирование (админу отеля)
6. Отмена (админу отеля)
7. Welcome (при регистрации)
8. Квитанция оплаты (гостю)

Все шаблоны: зелёный хедер #1b4332, золотые кнопки #d4a373.

## Переключатель языков
React Context (LangProvider + useLang hook) в lib/language-context.tsx.
Переводы: RU/EN/KZ в lib/translations.ts.

## НЕЗАВЕРШЁННЫЕ ЗАДАЧИ (продолжить в следующей сессии)

### 1. Super Admin Panel (СОЗДАНО, нужна проверка)
Агент создал файлы, но работа была прервана — нужно проверить:
- app/(admin)/admin/layout.tsx — layout с sidebar, проверка SUPER_ADMIN
- app/(admin)/admin/page.tsx — dashboard со статистикой
- app/(admin)/admin/hotels/page.tsx — список отелей, смена тарифа
- app/(admin)/admin/users/page.tsx — список пользователей
- app/api/admin/stats/route.ts — API статистики
- app/api/admin/hotels/route.ts — API отелей
- app/api/admin/hotels/[id]/plan/route.ts — смена тарифа
- app/api/admin/users/route.ts — API пользователей

**Что проверить:** билд, работоспособность, UI в зелёно-золотом стиле, dark mode.

### 2. Dark Mode — МНОГО НЕДОРАБОТОК
Многие страницы дашборда всё ещё имеют хардкоженные цвета (bg-white, text-gray-*).
Нужно пройтись по ВСЕМ файлам и заменить на CSS переменные:
- bg-white → bg-card / bg-background
- bg-gray-50 → bg-muted
- text-gray-900 → text-foreground
- text-gray-600/500 → text-muted-foreground
- border-gray-200/100 → border-border

Файлы для проверки:
- app/(auth)/login/page.tsx, register/page.tsx
- ВСЕ файлы в app/(dashboard)/dashboard/**
- ВСЕ компоненты в components/dashboard/

### 3. Оптимизация производительности
- Проверить и оптимизировать загрузку страниц
- Убедиться что всё компилируется без ошибок

### 4. UI/UX улучшения
- Применить зелёно-золотой стиль к дашборду (сейчас синий #1a56db)
- Проверить все страницы на корректность

## Важные правила
- НЕ использовать `asChild` — это radix, у нас base-ui с `render` prop
- НЕ добавлять `url` в schema.prisma — только в prisma.config.ts
- Stripe инициализировать лениво через getStripe()
- Все домены: stayos.aibot.kz (не stayos.app)
- Год: 2026 (не 2024)
- Работать автономно, не задавать вопросы на каждом шаге
