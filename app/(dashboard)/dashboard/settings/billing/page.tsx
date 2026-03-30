"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Settings,
  Plug,
  Users,
  CreditCard,
  Check,
  Loader2,
  CheckCircle,
  Zap,
  Building2,
  Crown,
} from "lucide-react"

const settingsTabs = [
  { label: "Профиль отеля", href: "/dashboard/settings", icon: Settings },
  { label: "Интеграции", href: "/dashboard/settings/integrations", icon: Plug },
  { label: "Команда", href: "/dashboard/settings/team", icon: Users },
  { label: "Тариф и оплата", href: "/dashboard/settings/billing", icon: CreditCard },
]

interface PlanCard {
  name: string
  planKey: string
  price: string
  priceId: string | null
  icon: React.ComponentType<any>
  color: string
  description: string
  features: string[]
}

const PLANS: PlanCard[] = [
  {
    name: "Бесплатный",
    planKey: "FREE",
    price: "0",
    priceId: null,
    icon: Building2,
    color: "text-gray-600",
    description: "Для начала работы",
    features: [
      "До 3 номеров",
      "До 20 броней в месяц",
      "Сайт отеля",
      "Форма бронирования",
    ],
  },
  {
    name: "Стартер",
    planKey: "STARTER",
    price: "9 990",
    priceId: "STARTER",
    icon: Zap,
    color: "text-blue-600",
    description: "Для небольших отелей",
    features: [
      "До 10 номеров",
      "До 100 броней в месяц",
      "Telegram-уведомления",
      "Email-уведомления",
      "Сайт отеля",
      "Форма бронирования",
    ],
  },
  {
    name: "Про",
    planKey: "PRO",
    price: "24 990",
    priceId: "PRO",
    icon: Crown,
    color: "text-purple-600",
    description: "Для растущего бизнеса",
    features: [
      "До 30 номеров",
      "Неограниченные брони",
      "Отчёты и аналитика",
      "CSV-экспорт",
      "API доступ",
      "Telegram + Email",
    ],
  },
  {
    name: "Enterprise",
    planKey: "ENTERPRISE",
    price: "По запросу",
    priceId: null,
    icon: Building2,
    color: "text-yellow-600",
    description: "Для крупных объектов",
    features: [
      "Неограниченные номера",
      "Неограниченные брони",
      "White-label решение",
      "Приоритетная поддержка",
      "Все функции Про",
      "Индивидуальная интеграция",
    ],
  },
]

function BillingContent() {
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('success') === 'true'

  const [currentPlan, setCurrentPlan] = useState<string>("FREE")
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null)
  const [stripeSubId, setStripeSubId] = useState<string | null>(null)
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch('/api/hotels')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setCurrentPlan(data.plan || "FREE")
          setPlanExpiresAt(data.planExpiresAt || null)
          setStripeSubId(data.stripeSubId || null)
        }
      })
      .catch(() => {})
  }, [])

  const handleUpgrade = async (priceId: string) => {
    setLoadingPriceId(priceId)
    setError("")

    try {
      const res = await fetch('/api/stripe/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-checkout', priceId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ошибка при создании сессии оплаты")
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setLoadingPriceId(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    setError("")

    try {
      const res = await fetch('/api/stripe/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-portal' }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Ошибка при открытии портала")
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setPortalLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const currentPlanInfo = PLANS.find((p) => p.planKey === currentPlan)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Настройки</h1>

      {/* Settings navigation tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.href === "/dashboard/settings/billing"
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

      {/* Success message */}
      {justUpgraded && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
          <CheckCircle className="size-4 shrink-0" />
          Подписка успешно оформлена! Ваш тариф обновлён.
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Current plan info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Текущий тариф</h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {currentPlanInfo && (
              <div
                className={`size-10 rounded-lg flex items-center justify-center ${
                  currentPlan === "FREE"
                    ? "bg-gray-100"
                    : currentPlan === "STARTER"
                    ? "bg-blue-100"
                    : currentPlan === "PRO"
                    ? "bg-purple-100"
                    : "bg-yellow-100"
                }`}
              >
                {currentPlanInfo && (
                  <currentPlanInfo.icon className={`size-5 ${currentPlanInfo.color}`} />
                )}
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-gray-900">
                {currentPlanInfo?.name || currentPlan}
              </p>
              {planExpiresAt && (
                <p className="text-sm text-gray-500">
                  Действует до: {formatDate(planExpiresAt)}
                </p>
              )}
              {!planExpiresAt && currentPlan !== "FREE" && (
                <p className="text-sm text-gray-500">Активная подписка</p>
              )}
            </div>
          </div>

          {stripeSubId && (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {portalLoading && <Loader2 className="size-4 animate-spin" />}
              Управление подпиской
            </button>
          )}
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isCurrent = plan.planKey === currentPlan
          const isLoading = loadingPriceId === plan.priceId

          return (
            <div
              key={plan.planKey}
              className={`relative bg-white rounded-xl border-2 p-5 flex flex-col transition-all ${
                isCurrent
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Текущий
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center ${
                    plan.planKey === "FREE"
                      ? "bg-gray-100"
                      : plan.planKey === "STARTER"
                      ? "bg-blue-100"
                      : plan.planKey === "PRO"
                      ? "bg-purple-100"
                      : "bg-yellow-100"
                  }`}
                >
                  <Icon className={`size-4 ${plan.color}`} />
                </div>
                <span className="font-semibold text-gray-900 text-sm">{plan.name}</span>
              </div>

              <div className="mb-1">
                {plan.price === "По запросу" ? (
                  <span className="text-xl font-bold text-gray-900">По запросу</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xs text-gray-500 ml-1">₸/мес</span>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-4">{plan.description}</p>

              <ul className="space-y-1.5 mb-5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <Check className="size-3.5 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-2 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 cursor-default"
                >
                  Текущий тариф
                </button>
              ) : plan.priceId ? (
                <button
                  onClick={() => handleUpgrade(plan.priceId!)}
                  disabled={isLoading}
                  className="w-full py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {isLoading && <Loader2 className="size-3 animate-spin" />}
                  Перейти
                </button>
              ) : plan.planKey === "ENTERPRISE" ? (
                <a
                  href="mailto:sales@stayos.app"
                  className="w-full py-2 rounded-lg text-xs font-medium border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors text-center block"
                >
                  Связаться
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Недоступно
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Могу ли я отменить подписку?</p>
            <p className="text-sm text-gray-500 mt-1">
              Да, вы можете отменить подписку в любое время через портал управления подпиской. Доступ к платным функциям сохранится до конца оплаченного периода.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Как осуществляется оплата?</p>
            <p className="text-sm text-gray-500 mt-1">
              Оплата осуществляется банковской картой через безопасный платёжный шлюз Stripe. Мы не храним данные вашей карты.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Что произойдёт при превышении лимита?</p>
            <p className="text-sm text-gray-500 mt-1">
              При достижении лимита бронирований или номеров вы получите уведомление. Вы сможете перейти на более высокий тариф в любой момент.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
