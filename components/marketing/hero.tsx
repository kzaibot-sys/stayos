"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 text-center">
      {/* Gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(to bottom, #eff6ff 0%, #ffffff 100%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        >
          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
            Управляйте отелем{" "}
            <span className="text-[#1a56db]">легко</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            StayOS — современная платформа для мини-отелей, гостевых домов и
            хостелов в СНГ. Бронирования, управление номерами, аналитика — всё
            в одном месте.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#1a56db] px-8 text-base text-white hover:bg-[#1e429f]"
              )}
            >
              Начать бесплатно
            </Link>
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-8 text-base"
              )}
            >
              Узнать больше
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
