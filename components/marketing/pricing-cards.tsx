"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { Check, Sparkles, Building2, Rocket, Crown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type Plan = {
  name: string
  icon: React.ElementType
  description: string
  price: string
  period?: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted?: boolean
  badge?: string
  accent: string
}

const plans: Plan[] = [
  {
    name: "Free",
    icon: Zap,
    description: "Для старта",
    price: "0 ₸",
    period: "/мес",
    features: [
      "До 3 номеров",
      "До 20 броней/мес",
      "Сайт отеля + бронирование",
      "Базовая аналитика",
    ],
    cta: "Начать бесплатно",
    ctaHref: "/register",
    accent: "from-gray-50 to-white",
  },
  {
    name: "Starter",
    icon: Rocket,
    description: "Для малого бизнеса",
    price: "49 900 ₸",
    period: "/мес",
    features: [
      "До 15 номеров",
      "До 200 броней/мес",
      "Telegram-уведомления",
      "Email-уведомления",
      "CRM гостей",
      "Экспорт CSV",
    ],
    cta: "Выбрать Starter",
    ctaHref: "/register",
    accent: "from-[#1b4332]/5 to-white",
  },
  {
    name: "Pro",
    icon: Crown,
    description: "Самый популярный",
    price: "99 900 ₸",
    period: "/мес",
    features: [
      "До 50 номеров",
      "Без ограничений по броням",
      "Полная аналитика и отчёты",
      "API доступ",
      "Динамическое ценообразование",
      "Промокоды и скидки",
      "Приоритетная поддержка",
    ],
    cta: "Выбрать Pro",
    ctaHref: "/register",
    highlighted: true,
    badge: "Популярный",
    accent: "from-[#1b4332] to-[#2d6a4f]",
  },
  {
    name: "Enterprise",
    icon: Building2,
    description: "Для сетей отелей",
    price: "Индивидуально",
    features: [
      "Без ограничений",
      "White-label решение",
      "Выделенный менеджер",
      "Кастомные интеграции",
      "SLA 99.9%",
      "Обучение персонала",
    ],
    cta: "Связаться",
    ctaHref: "mailto:sales@stayos.aibot.kz",
    accent: "from-[#d4a373]/5 to-white",
  },
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export function PricingCards() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {plans.map((plan) => {
        const Icon = plan.icon
        const isHighlighted = plan.highlighted

        return (
          <motion.div
            key={plan.name}
            variants={item}
            className={cn(
              "relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300",
              isHighlighted
                ? "bg-[#1b4332] text-white shadow-2xl shadow-[#1b4332]/30 scale-[1.02] lg:scale-105 z-10"
                : "bg-white border border-gray-100 hover:border-[#1b4332]/15 hover:shadow-xl hover:shadow-[#1b4332]/5"
            )}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute top-0 right-0">
                <div className="bg-[#d4a373] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  {plan.badge}
                </div>
              </div>
            )}

            <div className="p-7 flex-1 flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <div className={cn(
                  "inline-flex size-10 items-center justify-center rounded-xl mb-4",
                  isHighlighted ? "bg-white/10" : "bg-[#1b4332]/10"
                )}>
                  <Icon className={cn("size-5", isHighlighted ? "text-[#d4a373]" : "text-[#1b4332]")} />
                </div>
                <h3 className={cn(
                  "text-lg font-bold mb-1",
                  isHighlighted ? "text-white" : "text-[#1b4332]"
                )}>
                  {plan.name}
                </h3>
                <p className={cn(
                  "text-sm",
                  isHighlighted ? "text-white/60" : "text-gray-500"
                )}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className={cn(
                    "text-3xl font-bold tracking-tight",
                    isHighlighted ? "text-white" : "text-[#1b4332]"
                  )}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={cn(
                      "text-sm mb-1",
                      isHighlighted ? "text-white/50" : "text-gray-400"
                    )}>
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <div className={cn(
                      "size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      isHighlighted ? "bg-[#d4a373]/20" : "bg-[#1b4332]/10"
                    )}>
                      <Check className={cn(
                        "size-3",
                        isHighlighted ? "text-[#d4a373]" : "text-[#1b4332]"
                      )} />
                    </div>
                    <span className={cn(
                      "text-sm",
                      isHighlighted ? "text-white/80" : "text-gray-600"
                    )}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={cn(
                  "block text-center font-semibold text-sm py-3.5 rounded-xl transition-all duration-200",
                  isHighlighted
                    ? "bg-[#d4a373] hover:bg-[#c4956a] text-white shadow-lg shadow-[#d4a373]/30"
                    : "bg-[#1b4332]/5 hover:bg-[#1b4332]/10 text-[#1b4332] border border-[#1b4332]/10"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
