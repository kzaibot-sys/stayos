"use client"

import { useLang } from "@/lib/language-context"
import type { Language } from "@/lib/translations"

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "kz", label: "KZ", flag: "🇰🇿" },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-1 shadow-sm">
      {LANGUAGES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
            lang === code
              ? "bg-[#1a56db] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title={code.toUpperCase()}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
