"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import {
  CalendarCheck,
  BedDouble,
  Users,
  BarChart3,
  MessageCircle,
  CreditCard,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: CalendarCheck,
    color: "bg-blue-100 text-blue-600",
    title: "Онлайн-бронирование",
    description: "Принимайте брони 24/7 через ваш сайт и виджет",
  },
  {
    icon: BedDouble,
    color: "bg-indigo-100 text-indigo-600",
    title: "Управление номерами",
    description: "Полный контроль над номерным фондом, ценами и статусами",
  },
  {
    icon: Users,
    color: "bg-purple-100 text-purple-600",
    title: "CRM гостей",
    description: "База гостей с историей визитов, тегами и заметками",
  },
  {
    icon: BarChart3,
    color: "bg-emerald-100 text-emerald-600",
    title: "Аналитика",
    description: "Выручка, занятость, ADR, RevPAR — все метрики в реальном времени",
  },
  {
    icon: MessageCircle,
    color: "bg-sky-100 text-sky-600",
    title: "Telegram-уведомления",
    description: "Мгновенные алерты о новых бронях прямо в Telegram",
  },
  {
    icon: CreditCard,
    color: "bg-rose-100 text-rose-600",
    title: "Приём оплат",
    description: "Stripe и Kaspi QR для онлайн-оплаты бронирований",
  },
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
}

export function Features() {
  return (
    <>
      {/* Features section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-center text-gray-900 mb-12">
            Всё что нужно для вашего отеля
          </h2>

          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={feat.title}
                  variants={item}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div
                    className={cn(
                      "mb-4 inline-flex size-12 items-center justify-center rounded-full",
                      feat.color
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-white text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4">
            Готовы начать?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Создайте аккаунт за 2 минуты
          </p>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[#1a56db] px-8 text-base text-white hover:bg-[#1e429f]"
            )}
          >
            Начать бесплатно
          </Link>
        </div>
      </section>
    </>
  )
}
