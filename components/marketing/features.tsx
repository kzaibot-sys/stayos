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
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: CalendarCheck,
    title: "Онлайн-бронирование",
    description: "Принимайте брони 24/7 через ваш сайт и встраиваемый виджет",
    accent: "bg-[#1b4332]/10 text-[#1b4332]",
  },
  {
    icon: BedDouble,
    title: "Управление номерами",
    description: "Полный контроль над номерным фондом, ценами и статусами в реальном времени",
    accent: "bg-[#d4a373]/10 text-[#d4a373]",
  },
  {
    icon: Users,
    title: "CRM гостей",
    description: "База гостей с историей визитов, тегами и персональными заметками",
    accent: "bg-[#1b4332]/10 text-[#1b4332]",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    description: "Выручка, занятость, ADR, RevPAR — все метрики в реальном времени",
    accent: "bg-[#d4a373]/10 text-[#d4a373]",
  },
  {
    icon: MessageCircle,
    title: "Telegram-уведомления",
    description: "Мгновенные алерты о новых бронях прямо в Telegram",
    accent: "bg-[#1b4332]/10 text-[#1b4332]",
  },
  {
    icon: CreditCard,
    title: "Приём оплат",
    description: "Stripe и Kaspi QR для онлайн-оплаты бронирований",
    accent: "bg-[#d4a373]/10 text-[#d4a373]",
  },
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

export function Features() {
  return (
    <>
      {/* Features section */}
      <section id="features" className="relative py-24 overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#1b4332]/[0.02] to-white -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#1b4332]/5 border border-[#1b4332]/10 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm font-semibold text-[#1b4332]">Возможности</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1b4332] mb-4 tracking-tight">
              Всё что нужно для вашего отеля
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              От бронирования до аналитики — полный набор инструментов для управления
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
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
                  className="group relative bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#1b4332]/15 hover:shadow-xl hover:shadow-[#1b4332]/5 transition-all duration-300"
                >
                  <div
                    className={cn(
                      "mb-5 inline-flex size-12 items-center justify-center rounded-xl transition-colors duration-200",
                      feat.accent
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1b4332] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-[#1b4332]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Отелей" },
              { value: "50K+", label: "Бронирований" },
              { value: "4.9", label: "Рейтинг" },
              { value: "99.9%", label: "Аптайм" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-[#d4a373]">{stat.value}</p>
                <p className="text-sm text-white/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1b4332]/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-b from-white to-[#1b4332]/[0.02] rounded-3xl p-12 border border-gray-100 shadow-lg shadow-[#1b4332]/5">
            <div className="inline-flex items-center gap-2 bg-[#d4a373]/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="size-4 text-[#d4a373]" />
              <span className="text-sm font-semibold text-[#d4a373]">Готовы начать?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1b4332] mb-4">
              Создайте аккаунт за 2 минуты
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">
              Присоединяйтесь к сотням отелей, которые уже используют StayOS
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#1b4332] text-white font-semibold text-base px-8 py-4 rounded-2xl hover:bg-[#2d6a4f] transition-all duration-300 shadow-lg shadow-[#1b4332]/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Начать бесплатно
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
