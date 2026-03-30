export const dynamic = 'force-dynamic'

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
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
