import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as any)

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

  // 3. Create rooms
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
    },
  ]

  for (const roomData of roomsData) {
    const room = await prisma.room.create({ data: roomData })
    console.log(`Created room: ${room.name} (${room.id})`)
  }

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
