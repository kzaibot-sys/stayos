"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Settings,
  Plug,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  MessageCircle,
  Smartphone,
} from "lucide-react"

const settingsTabs = [
  { label: "Профиль отеля", href: "/dashboard/settings", icon: Settings },
  { label: "Интеграции", href: "/dashboard/settings/integrations", icon: Plug },
  { label: "Команда", href: "/dashboard/settings/team", icon: Users },
  { label: "Тариф и оплата", href: "/dashboard/settings/billing", icon: CreditCard },
]

export default function IntegrationsPage() {
  const [telegramToken, setTelegramToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramTestLoading, setTelegramTestLoading] = useState(false)
  const [telegramMsg, setTelegramMsg] = useState("")
  const [telegramError, setTelegramError] = useState("")
  const [showTelegramInstructions, setShowTelegramInstructions] = useState(false)

  const [hotelSlug, setHotelSlug] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/hotels')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setHotelSlug(data.slug || "")
          setTelegramToken(data.telegramBotToken || "")
          setTelegramChatId(data.telegramChatId || "")
          setTelegramConnected(!!(data.telegramBotToken && data.telegramChatId))
        }
      })
      .catch(() => {})
  }, [])

  const handleConnectTelegram = async () => {
    if (!telegramToken || !telegramChatId) {
      setTelegramError("Введите токен и Chat ID")
      return
    }
    setTelegramLoading(true)
    setTelegramError("")
    setTelegramMsg("")

    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: telegramToken, chatId: telegramChatId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setTelegramError(data.error || "Ошибка подключения")
      } else {
        setTelegramConnected(true)
        setTelegramMsg("Telegram успешно подключён!")
        setTimeout(() => setTelegramMsg(""), 3000)
      }
    } catch {
      setTelegramError("Ошибка сети")
    } finally {
      setTelegramLoading(false)
    }
  }

  const handleTestTelegram = async () => {
    setTelegramTestLoading(true)
    setTelegramError("")
    setTelegramMsg("")

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        setTelegramError(data.error || "Ошибка при отправке")
      } else {
        setTelegramMsg("Тестовое сообщение отправлено!")
        setTimeout(() => setTelegramMsg(""), 3000)
      }
    } catch {
      setTelegramError("Ошибка сети")
    } finally {
      setTelegramTestLoading(false)
    }
  }

  const embedCode = `<div id="stayos-widget"></div>\n<script src="https://stayos.aibot.kz/widget.js" data-hotel="${hotelSlug}"></script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Настройки</h1>

      {/* Settings navigation tabs */}
      <div className="flex gap-1 mb-8 border-b border-border">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.href === "/dashboard/settings/integrations"
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-[#1b4332] text-[#1b4332]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="space-y-6">
        {/* Telegram */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#1b4332]/10 flex items-center justify-center">
                <Send className="size-5 text-[#1b4332]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Telegram</h2>
                <p className="text-sm text-muted-foreground">Получайте уведомления о новых бронях в Telegram</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {telegramConnected ? (
                <>
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Подключено</span>
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Не подключено</span>
                </>
              )}
            </div>
          </div>

          {/* Instructions toggle */}
          <button
            onClick={() => setShowTelegramInstructions(!showTelegramInstructions)}
            className="flex items-center gap-2 text-sm text-[#2d6a4f] hover:text-[#1b4332] font-medium"
          >
            {showTelegramInstructions ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            Инструкция по подключению
          </button>

          {showTelegramInstructions && (
            <div className="bg-muted rounded-lg p-4 text-sm text-foreground space-y-2">
              <p className="font-medium text-foreground">Как подключить Telegram-бота:</p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Откройте <strong>@BotFather</strong> в Telegram</li>
                <li>Отправьте команду <code className="bg-muted px-1 rounded">/newbot</code> и следуйте инструкциям</li>
                <li>Скопируйте токен бота (выглядит как: <code className="bg-muted px-1 rounded">123456:ABC-DEF...</code>)</li>
                <li>Добавьте бота в группу или напишите ему в личку и отправьте любое сообщение</li>
                <li>Получите Chat ID: откройте <code className="bg-muted px-1 rounded">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code></li>
                <li>Вставьте токен и Chat ID ниже и нажмите «Подключить»</li>
              </ol>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Токен бота
              </label>
              <input
                type="text"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] font-mono"
                placeholder="123456:ABC-DEF..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Chat ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] font-mono"
                placeholder="-100123456789"
              />
            </div>
          </div>

          {telegramError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {telegramError}
            </p>
          )}
          {telegramMsg && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {telegramMsg}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConnectTelegram}
              disabled={telegramLoading}
              className="flex items-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {telegramLoading && <Loader2 className="size-4 animate-spin" />}
              Подключить
            </button>

            {telegramConnected && (
              <button
                onClick={handleTestTelegram}
                disabled={telegramTestLoading}
                className="flex items-center gap-2 border border-border hover:bg-muted text-foreground font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {telegramTestLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Отправить тестовое
              </button>
            )}
          </div>
        </section>

        {/* Online Payment (Stripe Connect) */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="size-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Онлайн-оплата (Stripe)</h2>
                <p className="text-sm text-muted-foreground">Принимайте оплату от гостей онлайн</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Не подключено</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Подключите Stripe для приёма онлайн-платежей от гостей. Stripe Connect позволяет
            безопасно принимать карты и переводить средства на ваш счёт.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            Функция Stripe Connect находится в разработке. Скоро будет доступна.
          </div>
        </section>

        {/* WhatsApp */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageCircle className="size-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">WhatsApp</h2>
                <p className="text-sm text-muted-foreground">Уведомления гостей через WhatsApp Business</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
              Скоро
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Автоматические уведомления гостям через WhatsApp: подтверждение брони, напоминание о заезде, счёт.
          </p>
          <div className="bg-muted border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
            Интеграция с WhatsApp Business API находится в разработке.
          </div>
        </section>

        {/* SMS */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Smartphone className="size-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">SMS-уведомления</h2>
                <p className="text-sm text-muted-foreground">Отправка SMS гостям при бронировании</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
              Скоро
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Автоматические SMS-уведомления гостям: подтверждение брони, напоминание о заезде, код доступа.
          </p>
          <div className="bg-muted border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
            Интеграция с SMS-провайдерами находится в разработке.
          </div>
        </section>

        {/* Booking Widget */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Plug className="size-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Виджет бронирования</h2>
              <p className="text-sm text-muted-foreground">Встройте форму бронирования на свой сайт</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Скопируйте код ниже и вставьте его на страницу вашего сайта, где должна появиться форма бронирования.
          </p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Код для вставки</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm text-[#2d6a4f] hover:text-[#1b4332] font-medium"
              >
                <Copy className="size-3.5" />
                {copied ? "Скопировано!" : "Копировать"}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>

          <div className="bg-[#1b4332]/5 border border-[#1b4332]/20 rounded-lg px-4 py-3 text-sm text-[#1b4332]">
            <strong>Превью:</strong> Виджет появится на вашем сайте по адресу{" "}
            <code className="font-mono">stayos.aibot.kz/{hotelSlug || "your-hotel"}</code>
          </div>
        </section>
      </div>
    </div>
  )
}
