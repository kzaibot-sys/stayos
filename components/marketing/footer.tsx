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
      { label: "support@stayos.app", href: "mailto:support@stayos.app" },
    ],
  },
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2 font-heading text-xl font-bold text-white">
          <BedDouble className="size-6" />
          <span>StayOS</span>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
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
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          © 2024 StayOS. Все права защищены.
        </div>
      </div>
    </footer>
  )
}
