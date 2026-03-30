import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import path from 'path'
import { subDays, addDays, subMonths, setHours } from 'date-fns'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as any)

function rndInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rndItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data in correct order (dependents first)
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.ratePlan.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.room.deleteMany()
  await prisma.hotelMember.deleteMany()
  await prisma.hotel.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data.')

  // 1. Create user
  const user = await prisma.user.create({
    data: {
      name: 'Админ StayOS',
      email: 'admin@stayos.app',
      password: await bcrypt.hash('password123', 12),
      role: 'OWNER',
    },
  })
  console.log(`Created user: ${user.email} (${user.id})`)

  // 2. Create hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Гостевой дом Алатау',
      slug: 'alatau',
      description: 'Уютный гостевой дом в самом сердце Алматы с видом на горы.',
      shortDescription: 'Уют и горы Алматы',
      address: 'ул. Тулебаева 100',
      city: 'Алматы',
      country: 'KZ',
      phone: '+7 727 123 4567',
      email: 'info@alatau-hotel.kz',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      currency: 'KZT',
      timezone: 'Asia/Almaty',
      language: 'ru',
      amenities: JSON.stringify(['WiFi', 'Парковка', 'Кондиционер', 'Завтрак', 'Трансфер']),
      ownerId: user.id,
    },
  })
  console.log(`Created hotel: ${hotel.name} (${hotel.id})`)

  // 3. Create 8 rooms
  const roomsData = [
    {
      name: 'Стандарт 101',
      roomNumber: '101',
      type: 'STANDARD' as const,
      floor: 1,
      capacity: 2,
      bedCount: 1,
      bedType: 'Двуспальная',
      pricePerNight: 15000,
      description: 'Уютный номер с видом на двор',
      amenities: JSON.stringify(['WiFi', 'TV', 'Кондиционер']),
      hotelId: hotel.id,
      sortOrder: 1,
    },
    {
      name: 'Стандарт 102',
      roomNumber: '102',
      type: 'STANDARD' as const,
      floor: 1,
      capacity: 2,
      bedCount: 1,
      bedType: 'Двуспальная',
      pricePerNight: 15000,
      description: 'Стандартный номер с удобствами',
      amenities: JSON.stringify(['WiFi', 'TV', 'Кондиционер']),
      hotelId: hotel.id,
      sortOrder: 2,
    },
    {
      name: 'Делюкс 201',
      roomNumber: '201',
      type: 'DELUXE' as const,
      floor: 2,
      capacity: 2,
      bedCount: 1,
      bedType: 'Двуспальная King',
      pricePerNight: 25000,
      weekendPrice: 30000,
      description: 'Просторный номер с видом на горы',
      amenities: JSON.stringify(['WiFi', 'TV', 'Кондиционер', 'Мини-бар', 'Балкон']),
      hotelId: hotel.id,
      sortOrder: 3,
    },
    {
      name: 'Делюкс 202',
      roomNumber: '202',
      type: 'DELUXE' as const,
      floor: 2,
      capacity: 2,
      bedCount: 1,
      bedType: 'Двуспальная King',
      pricePerNight: 25000,
      weekendPrice: 30000,
      description: 'Делюкс номер с панорамным видом',
      amenities: JSON.stringify(['WiFi', 'TV', 'Кондиционер', 'Мини-бар', 'Балкон']),
      hotelId: hotel.id,
      sortOrder: 4,
    },
    {
      name: 'Люкс Панорама',
      roomNumber: '301',
      type: 'SUITE' as const,
      floor: 3,
      capacity: 4,
      bedCount: 2,
      bedType: 'Двуспальная King + диван',
      pricePerNight: 40000,
      weekendPrice: 50000,
      description: 'Роскошный люкс с панорамным видом на Алатау',
      amenities: JSON.stringify(['WiFi', 'TV', 'Кондиционер', 'Мини-бар', 'Балкон', 'Ванна', 'Халат']),
      hotelId: hotel.id,
      sortOrder: 5,
    },
    {
      name: 'Семейный 203',
      roomNumber: '203',
      type: 'APARTMENT' as const,
      floor: 2,
      capacity: 4,
      bedCount: 2,
      bedType: '2 двуспальные',
      pricePerNight: 35000,
      description: 'Просторные апартаменты для всей семьи',
      amenities: JSON.stringify(['WiFi', 'TV', 'Кондиционер', 'Кухня', 'Стиральная машина']),
      hotelId: hotel.id,
      sortOrder: 6,
    },
    {
      name: 'Эконом 103',
      roomNumber: '103',
      type: 'STANDARD' as const,
      floor: 1,
      capacity: 2,
      bedCount: 1,
      bedType: 'Односпальная',
      pricePerNight: 10000,
      description: 'Бюджетный номер с базовыми удобствами',
      amenities: JSON.stringify(['WiFi', 'TV']),
      hotelId: hotel.id,
      sortOrder: 7,
    },
    {
      name: 'Вилла Горная',
      roomNumber: 'V1',
      type: 'VILLA' as const,
      floor: 1,
      capacity: 6,
      bedCount: 3,
      bedType: '2 двуспальные + диван',
      pricePerNight: 80000,
      description: 'Отдельная вилла с террасой, видом на горы и собственным садом',
      amenities: JSON.stringify(['WiFi', 'TV', 'Кондиционер', 'Кухня', 'Терраса', 'Сад', 'Барбекю', 'Парковка']),
      hotelId: hotel.id,
      sortOrder: 8,
    },
  ]

  const rooms: any[] = []
  for (const roomData of roomsData) {
    const room = await prisma.room.create({ data: roomData })
    rooms.push(room)
    console.log(`Created room: ${room.name} (${room.id})`)
  }

  // 4. Create 30 guests
  const guestNames = [
    { firstName: 'Алибек', lastName: 'Джаксыбеков', email: 'alibek.j@gmail.com', phone: '+7 701 234 5678', tags: ['VIP'] },
    { firstName: 'Айгерим', lastName: 'Сейткали', email: 'aigenim.s@mail.ru', phone: '+7 702 345 6789', tags: ['Постоянный'] },
    { firstName: 'Нурлан', lastName: 'Ахметов', email: 'nurlan.a@gmail.com', phone: '+7 705 456 7890', tags: [] },
    { firstName: 'Гульнара', lastName: 'Бейсенова', email: 'gulnara.b@yandex.ru', phone: '+7 707 567 8901', tags: ['Корпоративный'] },
    { firstName: 'Серик', lastName: 'Омаров', email: 'serik.o@gmail.com', phone: '+7 708 678 9012', tags: ['VIP', 'Постоянный'] },
    { firstName: 'Динара', lastName: 'Касымова', email: 'dinara.k@mail.ru', phone: '+7 700 789 0123', tags: [] },
    { firstName: 'Бауыржан', lastName: 'Нуртаев', email: 'baur.n@gmail.com', phone: '+7 701 890 1234', tags: ['Постоянный'] },
    { firstName: 'Жанна', lastName: 'Сатыбалдина', email: 'zhanna.s@yandex.ru', phone: '+7 702 901 2345', tags: [] },
    { firstName: 'Мейрам', lastName: 'Байжанов', email: 'meyram.b@gmail.com', phone: '+7 705 012 3456', tags: ['Корпоративный'] },
    { firstName: 'Асель', lastName: 'Токтаганова', email: 'asel.t@mail.ru', phone: '+7 707 123 4567', tags: ['VIP'] },
    { firstName: 'Ерлан', lastName: 'Дюсенов', email: 'erlan.d@gmail.com', phone: '+7 708 234 5678', tags: [] },
    { firstName: 'Малика', lastName: 'Жанпеисова', email: 'malika.j@yandex.ru', phone: '+7 700 345 6789', tags: ['Постоянный'] },
    { firstName: 'Тимур', lastName: 'Алимбеков', email: 'timur.a@gmail.com', phone: '+7 701 456 7890', tags: [] },
    { firstName: 'Зарина', lastName: 'Мухамедова', email: 'zarina.m@mail.ru', phone: '+7 702 567 8901', tags: ['Корпоративный'] },
    { firstName: 'Адиль', lastName: 'Сейткалиев', email: 'adil.s@gmail.com', phone: '+7 705 678 9012', tags: [] },
    { firstName: 'Назгуль', lastName: 'Берикова', email: 'nazgul.b@yandex.ru', phone: '+7 707 789 0123', tags: ['VIP'] },
    { firstName: 'Данияр', lastName: 'Усенов', email: 'daniyar.u@gmail.com', phone: '+7 708 890 1234', tags: ['Постоянный'] },
    { firstName: 'Камила', lastName: 'Нурланова', email: 'kamila.n@mail.ru', phone: '+7 700 901 2345', tags: [] },
    { firstName: 'Руслан', lastName: 'Абдрахманов', email: 'ruslan.a@gmail.com', phone: '+7 701 012 3456', tags: ['Корпоративный'] },
    { firstName: 'Айша', lastName: 'Султанова', email: 'aysha.s@yandex.ru', phone: '+7 702 123 4567', tags: [] },
    { firstName: 'Болат', lastName: 'Жуматаев', email: 'bolat.zh@gmail.com', phone: '+7 705 234 5678', tags: ['VIP', 'Постоянный'] },
    { firstName: 'Сандугаш', lastName: 'Кенжеева', email: 'sand.k@mail.ru', phone: '+7 707 345 6789', tags: [] },
    { firstName: 'Арман', lastName: 'Темирланов', email: 'arman.t@gmail.com', phone: '+7 708 456 7890', tags: [] },
    { firstName: 'Гаухар', lastName: 'Мухтарова', email: 'gaukhar.m@yandex.ru', phone: '+7 700 567 8901', tags: ['Постоянный'] },
    { firstName: 'Ислам', lastName: 'Байсеитов', email: 'islam.b@gmail.com', phone: '+7 701 678 9012', tags: [] },
    { firstName: 'Перизат', lastName: 'Ергали', email: 'perizat.e@mail.ru', phone: '+7 702 789 0123', tags: ['Корпоративный'] },
    { firstName: 'Дархан', lastName: 'Мамытбеков', email: 'darkhan.m@gmail.com', phone: '+7 705 890 1234', tags: [] },
    { firstName: 'Айдана', lastName: 'Сагатова', email: 'aidana.s@yandex.ru', phone: '+7 707 901 2345', tags: ['VIP'] },
    { firstName: 'Жандос', lastName: 'Нургалиев', email: 'zhandos.n@gmail.com', phone: '+7 708 012 3456', tags: [] },
    { firstName: 'Толганай', lastName: 'Бекова', email: 'tol.b@mail.ru', phone: '+7 700 123 4567', tags: ['Постоянный'] },
  ]

  const guests: any[] = []
  for (const g of guestNames) {
    const guest = await prisma.guest.create({
      data: {
        hotelId: hotel.id,
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        phone: g.phone,
        tags: JSON.stringify(g.tags),
        nationality: 'KZ',
      },
    })
    guests.push(guest)
  }
  console.log(`Created ${guests.length} guests`)

  // 5. Create rate plans
  const now = new Date()
  const ratePlan = await prisma.ratePlan.create({
    data: {
      hotelId: hotel.id,
      name: 'Новогодние праздники',
      description: 'Повышенная цена в праздничный сезон',
      dateFrom: new Date(now.getFullYear(), 11, 25),
      dateTo: new Date(now.getFullYear() + 1, 0, 10),
      multiplier: 1.5,
      isActive: true,
    },
  })
  const ratePlan2 = await prisma.ratePlan.create({
    data: {
      hotelId: hotel.id,
      name: 'Летний сезон',
      description: 'Скидка в летний период',
      dateFrom: new Date(now.getFullYear(), 5, 1),
      dateTo: new Date(now.getFullYear(), 7, 31),
      multiplier: 0.9,
      isActive: true,
    },
  })
  console.log(`Created 2 rate plans`)

  // 6. Create 50 bookings (non-overlapping per room)
  // Track per-room bookings: { roomId -> [{checkIn, checkOut}] }
  const roomBookings: Record<string, Array<{ checkIn: Date; checkOut: Date }>> = {}
  for (const room of rooms) {
    roomBookings[room.id] = []
  }

  function hasConflict(roomId: string, checkIn: Date, checkOut: Date): boolean {
    return roomBookings[roomId].some(
      (b) => checkIn < b.checkOut && checkOut > b.checkIn
    )
  }

  const statuses: Array<'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'PENDING'> = [
    'CONFIRMED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_IN',
    'CHECKED_OUT', 'CHECKED_OUT', 'CHECKED_OUT',
    'CANCELLED', 'PENDING',
  ]
  const sources: Array<'DIRECT' | 'MANUAL' | 'WIDGET'> = ['DIRECT', 'DIRECT', 'MANUAL', 'WIDGET']

  const bookings: any[] = []
  let attempts = 0

  while (bookings.length < 50 && attempts < 2000) {
    attempts++
    const room = rndItem(rooms)
    const guest = rndItem(guests)
    const status = rndItem(statuses)
    const source = rndItem(sources)

    // Generate dates in the past 3 months
    const daysAgo = rndInt(1, 90)
    const stayLength = rndInt(1, 7)
    const checkIn = setHours(subDays(now, daysAgo), 14)
    const checkOut = setHours(addDays(checkIn, stayLength), 12)

    if (hasConflict(room.id, checkIn, checkOut)) continue

    roomBookings[room.id].push({ checkIn, checkOut })

    const nights = stayLength
    const isWeekendDay = (d: Date) => d.getDay() === 0 || d.getDay() === 6

    let subtotal = 0
    for (let i = 0; i < nights; i++) {
      const day = addDays(checkIn, i)
      if (isWeekendDay(day) && room.weekendPrice) {
        subtotal += room.weekendPrice
      } else {
        subtotal += room.pricePerNight
      }
    }
    const totalPrice = subtotal

    const bookingCount = bookings.length
    const year = checkIn.getFullYear()
    const bookingNumber = `STY-${year}-${String(bookingCount + 1).padStart(4, '0')}`

    const paidAmount = status === 'CHECKED_OUT' ? totalPrice
      : status === 'CHECKED_IN' ? totalPrice * 0.5
      : status === 'CANCELLED' ? 0
      : status === 'CONFIRMED' ? (Math.random() > 0.5 ? totalPrice : 0)
      : 0

    const paymentStatus = paidAmount >= totalPrice ? 'PAID'
      : paidAmount > 0 ? 'PARTIAL'
      : 'UNPAID'

    const checkedInAt = ['CHECKED_IN', 'CHECKED_OUT'].includes(status) ? checkIn : null
    const checkedOutAt = status === 'CHECKED_OUT' ? checkOut : null
    const cancelledAt = status === 'CANCELLED' ? addDays(checkIn, -1) : null

    const createdAt = subDays(checkIn, rndInt(1, 10))

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        hotelId: hotel.id,
        roomId: room.id,
        guestId: guest.id,
        guestFirstName: guest.firstName,
        guestLastName: guest.lastName,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        checkIn,
        checkOut,
        nights,
        adults: rndInt(1, Math.min(room.capacity, 3)),
        children: rndInt(0, 1),
        status,
        paymentStatus: paymentStatus as any,
        source,
        pricePerNight: room.pricePerNight,
        subtotal,
        totalPrice,
        paidAmount,
        checkedInAt,
        checkedOutAt,
        cancelledAt,
        createdAt,
        updatedAt: createdAt,
      },
    })
    bookings.push(booking)
  }
  console.log(`Created ${bookings.length} bookings (${attempts} attempts)`)

  // 7. Create payments for paid/partial bookings
  let paymentsCreated = 0
  const paymentMethods: Array<'CASH' | 'KASPI' | 'BANK_TRANSFER' | 'STRIPE'> = ['CASH', 'KASPI', 'BANK_TRANSFER', 'STRIPE']

  for (const booking of bookings) {
    if (booking.paidAmount > 0) {
      const method = rndItem(paymentMethods)
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.paidAmount,
          currency: 'KZT',
          method,
          status: 'succeeded',
          notes: method === 'CASH' ? 'Оплата наличными на стойке' : null,
          createdAt: booking.checkedInAt ?? addDays(new Date(booking.checkIn), -1),
        },
      })
      paymentsCreated++
    }
  }
  console.log(`Created ${paymentsCreated} payments`)

  // Update guest totalVisits and totalSpent
  for (const guest of guests) {
    const guestBookings = bookings.filter(
      (b) => b.guestId === guest.id && b.status !== 'CANCELLED'
    )
    const totalVisits = guestBookings.length
    const totalSpent = guestBookings.reduce((sum: number, b: any) => sum + b.paidAmount, 0)
    await prisma.guest.update({
      where: { id: guest.id },
      data: { totalVisits, totalSpent },
    })
  }
  console.log('Updated guest stats')

  console.log('\n✅ Seed complete!')
  console.log(`  - 1 hotel (slug: alatau)`)
  console.log(`  - 8 rooms`)
  console.log(`  - 30 guests`)
  console.log(`  - ${bookings.length} bookings`)
  console.log(`  - ${paymentsCreated} payments`)
  console.log(`  - 2 rate plans`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
