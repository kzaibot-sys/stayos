"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Plan = {
  name: string
  price: string
  period?: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted?: boolean
  badge?: string
  ctaVariant?: "default" | "outline"
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "0 ₸",
    period: "/мес",
    features: [
      "До 3 номеров",
      "До 20 броней/мес",
      "Сайт + бронирование",
    ],
    cta: "Начать бесплатно",
    ctaHref: "/register",
    ctaVariant: "outline",
  },
  {
    name: "Starter",
    price: "9 900 ₸",
    period: "/мес",
    features: [
      "До 10 номеров",
      "До 100 броней/мес",
      "Telegram-уведомления",
      "Email-уведомления",
    ],
    cta: "Начать бесплатно",
    ctaHref: "/register",
    ctaVariant: "outline",
  },
  {
    name: "Pro",
    price: "24 900 ₸",
    period: "/мес",
    features: [
      "До 30 номеров",
      "Без ограничений по броням",
      "Отчёты и аналитика",
      "API доступ",
      "Экспорт CSV",
    ],
    cta: "Начать бесплатно",
    ctaHref: "/register",
    ctaVariant: "default",
    highlighted: true,
    badge: "Популярный",
  },
  {
    name: "Enterprise",
    price: "59 900 ₸",
    period: "/мес",
    features: [
      "Без ограничений",
      "White-label",
      "Приоритетная поддержка",
    ],
    cta: "Связаться",
    ctaHref: "/contact",
    ctaVariant: "outline",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export function PricingCards() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {plans.map((plan) => (
        <motion.div
          key={plan.name}
          variants={item}
          className={cn(
            "relative rounded-xl bg-white p-8 shadow-sm flex flex-col",
            plan.highlighted && "border-2 border-[#1a56db]"
          )}
        >
          {plan.badge && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1a56db] px-3 py-0.5 text-xs font-semibold text-white">
              {plan.badge}
            </span>
          )}

          <div className="mb-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h3>
            <div className="flex items-end gap-1">
              <span className="font-heading text-3xl font-bold text-gray-900">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-sm text-gray-500 mb-1">{plan.period}</span>
              )}
            </div>
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {plan.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="mt-0.5 size-4 shrink-0 text-[#057a55]" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {plan.highlighted ? (
            <Button
              asChild
              className="w-full bg-[#1a56db] text-white hover:bg-[#1e429f]"
            >
              <Link href={plan.ctaHref}>{plan.cta}</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild className="w-full">
              <Link href={plan.ctaHref}>{plan.cta}</Link>
            </Button>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
