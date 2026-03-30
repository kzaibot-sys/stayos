import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export async function POST(req: Request) {
  const session = await auth()
  const hotelId = (session?.user as any)?.hotelId

  if (!hotelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const files = formData.getAll("files") as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 })
  }

  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: неподдерживаемый тип файла (только изображения)`)
      continue
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: файл слишком большой (максимум 5 МБ)`)
      continue
    }

    try {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const dataUrl = `data:${file.type};base64,${base64}`
      urls.push(dataUrl)
    } catch {
      errors.push(`${file.name}: ошибка при обработке`)
    }
  }

  if (errors.length > 0 && urls.length === 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 })
  }

  return NextResponse.json({ urls, errors: errors.length > 0 ? errors : undefined })
}
