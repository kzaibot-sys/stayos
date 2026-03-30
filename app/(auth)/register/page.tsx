"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { BedDouble, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [hotelName, setHotelName] = useState("")
  const [hotelSlug, setHotelSlug] = useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-generate slug from hotel name unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited) {
      setHotelSlug(generateSlug(hotelName))
    }
  }, [hotelName, slugManuallyEdited])

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManuallyEdited(true)
    // Only allow valid slug characters while typing
    setHotelSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов")
      return
    }

    if (!hotelSlug) {
      toast.error("Введите URL отеля")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, hotelName, hotelSlug }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMessage =
          typeof data.error === "string" ? data.error : "Ошибка при регистрации"
        toast.error(errorMessage)
        return
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.error("Аккаунт создан, но не удалось войти. Попробуйте войти вручную.")
        router.push("/login")
      } else {
        router.push("/dashboard")
      }
    } catch {
      toast.error("Произошла ошибка. Попробуйте снова.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto mt-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a56db]">
            <BedDouble className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground font-heading">StayOS</span>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-foreground text-center">
              Создать аккаунт
            </CardTitle>
            <CardDescription className="text-center">
              Зарегистрируйтесь и начните управлять отелем
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">
                  Имя
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="border-gray-300 focus:border-[#1a56db] focus:ring-[#1a56db]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-gray-300 focus:border-[#1a56db] focus:ring-[#1a56db]"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="border-gray-300 focus:border-[#1a56db] focus:ring-[#1a56db]"
                />
                {password.length > 0 && password.length < 6 && (
                  <p className="text-xs text-red-500">Минимум 6 символов</p>
                )}
              </div>

              {/* Hotel Name */}
              <div className="space-y-2">
                <Label htmlFor="hotelName" className="font-medium">
                  Название отеля
                </Label>
                <Input
                  id="hotelName"
                  type="text"
                  placeholder="Grand Hotel Moscow"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  required
                  className="border-gray-300 focus:border-[#1a56db] focus:ring-[#1a56db]"
                />
              </div>

              {/* Hotel Slug */}
              <div className="space-y-2">
                <Label htmlFor="hotelSlug" className="font-medium">
                  URL отеля
                </Label>
                <Input
                  id="hotelSlug"
                  type="text"
                  placeholder="grand-hotel-moscow"
                  value={hotelSlug}
                  onChange={handleSlugChange}
                  required
                  className="border-gray-300 focus:border-[#1a56db] focus:ring-[#1a56db]"
                />
                {hotelSlug && (
                  <p className="text-xs text-muted-foreground">
                    Ваш адрес:{" "}
                    <span className="font-medium text-[#1a56db]">
                      stayos.aibot.kz/{hotelSlug}
                    </span>
                  </p>
                )}
                {!hotelSlug && hotelName && (
                  <p className="text-xs text-red-500">URL не может быть пустым</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1a56db] hover:bg-[#1648c0] text-white font-medium h-11 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание аккаунта...
                  </>
                ) : (
                  "Создать аккаунт"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="text-[#1a56db] font-medium hover:underline"
              >
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
