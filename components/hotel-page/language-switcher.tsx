"use client"

import { useLang } from "@/lib/language-context"
import type { Language } from "@/lib/translations"

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "kz", label: "KZ" },
]

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang()

  return (
    <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${dark ? "bg-white/10" : "bg-[#1b4332]/10"}`}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
            lang === code
              ? "bg-[#d4a373] text-white shadow-sm"
              : dark
              ? "text-white/70 hover:text-white"
              : "text-[#1b4332]/70 hover:text-[#1b4332]"
          }`}
          title={code.toUpperCase()}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
