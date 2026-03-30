"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { BedDouble, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Неверный email или пароль")
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto mt-20">
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
              Войти в аккаунт
            </CardTitle>
            <CardDescription className="text-center">
              Введите ваши данные для входа
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="border-gray-300 focus:border-[#1a56db] focus:ring-[#1a56db]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1a56db] hover:bg-[#1648c0] text-white font-medium h-11 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link
                href="/register"
                className="text-[#1a56db] font-medium hover:underline"
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
