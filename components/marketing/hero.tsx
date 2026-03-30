"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Star, Shield, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1b4332 1px, transparent 1px), linear-gradient(to bottom, #1b4332 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
        }}
      />

      {/* Radial gradient accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] -z-10"
        style={{
          background: "radial-gradient(circle, rgba(27,67,50,0.08) 0%, rgba(212,163,115,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Decorative orbs */}
      <div className="absolute top-20 right-[15%] w-72 h-72 bg-[#d4a373]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-[#1b4332]/5 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1b4332]/5 border border-[#1b4332]/10 rounded-full px-5 py-2 mb-8">
            <Sparkles className="size-4 text-[#d4a373]" />
            <span className="text-sm font-medium text-[#1b4332]">Новое поколение управления отелями</span>
            <ArrowRight className="size-3.5 text-[#1b4332]/50" />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8">
            <span className="text-[#1b4332]">Управляйте</span>
            <br />
            <span className="text-[#1b4332]">отелем </span>
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, #d4a373 0%, #c4956a 50%, #1b4332 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              легко
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-500 leading-relaxed mb-12">
            StayOS — современная платформа для мини-отелей, гостевых домов и хостелов.
            Бронирования, управление номерами, аналитика — всё в одном месте.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#1b4332] text-white font-semibold text-base px-8 py-4 rounded-2xl hover:bg-[#2d6a4f] transition-all duration-300 shadow-lg shadow-[#1b4332]/20 hover:shadow-xl hover:shadow-[#1b4332]/30 hover:-translate-y-0.5"
            >
              Начать бесплатно
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-[#1b4332] font-medium text-base px-8 py-4 rounded-2xl border border-[#1b4332]/15 hover:border-[#1b4332]/30 hover:bg-[#1b4332]/5 transition-all duration-200"
            >
              Узнать больше
            </a>
          </div>

          {/* Social proof pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-[#1b4332]" />
              <span>Безопасно</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 text-[#d4a373] fill-[#d4a373]" />
              ))}
              <span className="ml-1">4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-[#d4a373]" />
              <span>Запуск за 5 минут</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
