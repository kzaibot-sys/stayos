"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface GuestData {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

interface StepGuestProps {
  initialData?: Partial<GuestData>
  onNext: (data: GuestData) => void
  onBack: () => void
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function StepGuest({ initialData, onNext, onBack }: StepGuestProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "")
  const [lastName, setLastName] = useState(initialData?.lastName ?? "")
  const [email, setEmail] = useState(initialData?.email ?? "")
  const [phone, setPhone] = useState(initialData?.phone ?? "")
  const [specialRequests, setSpecialRequests] = useState(
    initialData?.specialRequests ?? ""
  )
  const [errors, setErrors] = useState<Partial<Record<keyof GuestData, string>>>({})

  function validate() {
    const newErrors: Partial<Record<keyof GuestData, string>> = {}
    if (!firstName.trim()) newErrors.firstName = "Обязательное поле"
    if (!lastName.trim()) newErrors.lastName = "Обязательное поле"
    if (!email.trim()) {
      newErrors.email = "Обязательное поле"
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = "Введите корректный email"
    }
    return newErrors
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    onNext({ firstName, lastName, email, phone, specialRequests })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">Данные гостя</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <Label htmlFor="firstName">
              Имя <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Иван"
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <Label htmlFor="lastName">
              Фамилия <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Иванов"
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="text-xs text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 700 000 00 00"
            />
          </div>
        </div>

        {/* Special Requests */}
        <div className="space-y-1.5">
          <Label htmlFor="specialRequests">Особые пожелания</Label>
          <Textarea
            id="specialRequests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Ранний заезд, высокий этаж, тихий номер..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none"
        >
          Назад
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-[#1a56db] text-white hover:bg-[#1e429f]"
        >
          Далее
        </Button>
      </div>
    </form>
  )
}
