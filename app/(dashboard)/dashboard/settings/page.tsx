"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Settings,
  Plug,
  Users,
  CreditCard,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const AMENITIES_LIST = [
  "WiFi", "Парковка", "Бассейн", "Спа", "Ресторан", "Бар", "Фитнес-зал",
  "Кондиционер", "Лифт", "Конференц-зал", "Трансфер", "Прачечная",
  "Сейф", "Консьерж", "Детская площадка", "Пляж", "Сауна",
]

const COUNTRIES = [
  { code: "KZ", name: "Казахстан" },
  { code: "RU", name: "Россия" },
  { code: "UZ", name: "Узбекистан" },
  { code: "KG", name: "Кыргызстан" },
  { code: "TJ", name: "Таджикистан" },
  { code: "TM", name: "Туркменистан" },
  { code: "AZ", name: "Азербайджан" },
  { code: "GE", name: "Грузия" },
  { code: "TR", name: "Турция" },
  { code: "AE", name: "ОАЭ" },
  { code: "US", name: "США" },
  { code: "DE", name: "Германия" },
  { code: "FR", name: "Франция" },
  { code: "OTHER", name: "Другая" },
]

const CURRENCIES = [
  { code: "KZT", label: "KZT — Тенге" },
  { code: "USD", label: "USD — Доллар" },
  { code: "EUR", label: "EUR — Евро" },
  { code: "RUB", label: "RUB — Рубль" },
]

const TIMEZONES = [
  "Asia/Almaty",
  "Asia/Tashkent",
  "Asia/Bishkek",
  "Asia/Dushanbe",
  "Asia/Ashgabat",
  "Asia/Baku",
  "Asia/Tbilisi",
  "Europe/Moscow",
  "Europe/Istanbul",
  "Asia/Dubai",
  "UTC",
]

const LANGUAGES = [
  { code: "ru", name: "Русский" },
  { code: "kk", name: "Қазақша" },
  { code: "en", name: "English" },
  { code: "uz", name: "O'zbekcha" },
]

const settingsTabs = [
  { label: "Профиль отеля", href: "/dashboard/settings", icon: Settings },
  { label: "Интеграции", href: "/dashboard/settings/integrations", icon: Plug },
  { label: "Команда", href: "/dashboard/settings/team", icon: Users },
  { label: "Тариф и оплата", href: "/dashboard/settings/billing", icon: CreditCard },
  { label: "Тарифные планы", href: "/dashboard/settings/rate-plans", icon: CreditCard },
]

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    address: "",
    city: "",
    country: "KZ",
    phone: "",
    email: "",
    website: "",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    currency: "KZT",
    language: "ru",
    timezone: "Asia/Almaty",
    amenities: [] as string[],
    prepaymentPercent: 0,
  })

  useEffect(() => {
    fetch('/api/hotels')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setForm({
            name: data.name || "",
            slug: data.slug || "",
            description: data.description || "",
            shortDescription: data.shortDescription || "",
            address: data.address || "",
            city: data.city || "",
            country: data.country || "KZ",
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || "",
            checkInTime: data.checkInTime || "14:00",
            checkOutTime: data.checkOutTime || "12:00",
            currency: data.currency || "KZT",
            language: data.language || "ru",
            timezone: data.timezone || "Asia/Almaty",
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            prepaymentPercent: data.prepaymentPercent ?? 0,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch('/api/hotels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Ошибка при сохранении")
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setSaving(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Настройки</h1>

      {/* Settings navigation tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.href === "/dashboard/settings"
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Основная информация</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название отеля <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL (slug)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">stayos.app/hotel/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="my-hotel"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Короткое описание
              </label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Краткое описание для превью"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Полное описание отеля"
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Местоположение</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Страна</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Contacts */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Контакты</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (777) 123-45-67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Вебсайт</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://myhotel.com"
              />
            </div>
          </div>
        </section>

        {/* Operations */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Операционные настройки</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Заезд</label>
              <input
                type="time"
                value={form.checkInTime}
                onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Выезд</label>
              <input
                type="time"
                value={form.checkOutTime}
                onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Язык</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Удобства</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {AMENITIES_LIST.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Booking settings */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Настройки бронирования</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Предоплата при бронировании (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.prepaymentPercent}
                  onChange={(e) =>
                    setForm({ ...form, prepaymentPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                  }
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">% от суммы бронирования</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                0 — полная оплата при заезде, 100 — полная предоплата
              </p>
            </div>
          </div>
        </section>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircle className="size-4 shrink-0" />
            Настройки успешно сохранены
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Сохранить
          </button>
        </div>
      </form>
    </div>
  )
}
