"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AMENITIES = [
  "WiFi",
  "TV",
  "Кондиционер",
  "Холодильник",
  "Фен",
  "Балкон",
  "Ванная",
  "Кухня",
  "Мини-бар",
  "Сейф",
  "Халат",
  "Тапочки",
]

const ROOM_TYPES = [
  { value: "STANDARD", label: "Стандарт" },
  { value: "DELUXE", label: "Делюкс" },
  { value: "SUITE", label: "Люкс" },
  { value: "APARTMENT", label: "Апартаменты" },
  { value: "DORMITORY", label: "Общая комната" },
  { value: "VILLA", label: "Вилла" },
]

const ROOM_STATUSES = [
  { value: "AVAILABLE", label: "Активен" },
  { value: "MAINTENANCE", label: "Техобслуживание" },
  { value: "BLOCKED", label: "Заблокирован" },
]

interface RoomFormProps {
  mode: "create" | "edit"
  roomId?: string
  defaultValues?: {
    name?: string
    roomNumber?: string
    type?: string
    floor?: number | null
    capacity?: number
    bedCount?: number
    bedType?: string
    pricePerNight?: number
    weekendPrice?: number | null
    description?: string
    amenities?: string[]
    status?: string
  }
}

export function RoomForm({ mode, roomId, defaultValues }: RoomFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState(defaultValues?.name ?? "")
  const [roomNumber, setRoomNumber] = useState(defaultValues?.roomNumber ?? "")
  const [type, setType] = useState(defaultValues?.type ?? "STANDARD")
  const [floor, setFloor] = useState(
    defaultValues?.floor != null ? String(defaultValues.floor) : ""
  )
  const [capacity, setCapacity] = useState(
    String(defaultValues?.capacity ?? 2)
  )
  const [bedCount, setBedCount] = useState(
    String(defaultValues?.bedCount ?? 1)
  )
  const [bedType, setBedType] = useState(defaultValues?.bedType ?? "")
  const [pricePerNight, setPricePerNight] = useState(
    defaultValues?.pricePerNight != null
      ? String(defaultValues.pricePerNight)
      : ""
  )
  const [weekendPrice, setWeekendPrice] = useState(
    defaultValues?.weekendPrice != null
      ? String(defaultValues.weekendPrice)
      : ""
  )
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  )
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    defaultValues?.amenities ?? []
  )
  const [status, setStatus] = useState(defaultValues?.status ?? "AVAILABLE")

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Укажите название номера")
      return
    }
    if (!pricePerNight || parseFloat(pricePerNight) < 0) {
      toast.error("Укажите корректную цену за ночь")
      return
    }

    setIsSubmitting(true)

    const payload = {
      name: name.trim(),
      roomNumber: roomNumber.trim() || null,
      type,
      floor: floor ? parseInt(floor, 10) : null,
      capacity: parseInt(capacity, 10) || 2,
      bedCount: parseInt(bedCount, 10) || 1,
      bedType: bedType.trim() || null,
      pricePerNight: parseFloat(pricePerNight),
      weekendPrice: weekendPrice ? parseFloat(weekendPrice) : null,
      description: description.trim() || null,
      amenities: selectedAmenities,
      status,
    }

    try {
      const url = mode === "create" ? "/api/rooms" : `/api/rooms/${roomId}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? "Ошибка при сохранении")
      }

      toast.success(
        mode === "create" ? "Номер добавлен" : "Номер обновлён"
      )
      router.push("/dashboard/rooms")
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Произошла ошибка"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Название номера <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Напр. Стандартный двухместный"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roomNumber">Номер комнаты</Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Напр. 101"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Тип номера</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "STANDARD")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Статус</Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "AVAILABLE")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание номера..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Room details */}
      <Card>
        <CardHeader>
          <CardTitle>Параметры номера</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="floor">Этаж</Label>
              <Input
                id="floor"
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="1"
                min={1}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capacity">Вместимость</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min={1}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bedCount">Количество кроватей</Label>
              <Input
                id="bedCount"
                type="number"
                value={bedCount}
                onChange={(e) => setBedCount(e.target.value)}
                min={1}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bedType">Тип кровати</Label>
              <Input
                id="bedType"
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                placeholder="Двуспальная"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Цены</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pricePerNight">
                Цена за ночь (KZT) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pricePerNight"
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder="15000"
                min={0}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weekendPrice">Цена на выходные (KZT)</Label>
              <Input
                id="weekendPrice"
                type="number"
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(e.target.value)}
                placeholder="20000"
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Удобства</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 select-none">
                  {amenity}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение..." : "Сохранить"}
        </Button>
        <Link href="/dashboard/rooms">
          <Button type="button" variant="outline">
            Отмена
          </Button>
        </Link>
      </div>
    </form>
  )
}
