import Link from "next/link"
import { BedDouble } from "lucide-react"

const footerLinks = {
  product: {
    title: "Продукт",
    links: [
      { label: "Возможности", href: "/#features" },
      { label: "Тарифы", href: "/pricing" },
      { label: "Документация", href: "/docs" },
    ],
  },
  company: {
    title: "Компания",
    links: [
      { label: "О нас", href: "/about" },
      { label: "Блог", href: "/blog" },
      { label: "Контакты", href: "/contact" },
    ],
  },
  support: {
    title: "Поддержка",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "support@stayos.aibot.kz", href: "mailto:support@stayos.aibot.kz" },
    ],
  },
}

export function Footer() {
  return (
    <footer className="bg-[#1b4332] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                <BedDouble className="size-4 text-[#d4a373]" />
              </div>
              <span className="font-bold text-lg text-white">StayOS</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Современная платформа для управления мини-отелями, гостевыми домами и хостелами.
            </p>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#d4a373]">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © 2026 StayOS. Все права защищены.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Условия
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
