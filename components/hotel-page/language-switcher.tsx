"use client"

import { useState, useEffect } from "react"
import { translations, type Language } from "@/lib/translations"

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "kz", label: "KZ", flag: "🇰🇿" },
]

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Language>("ru")

  useEffect(() => {
    const stored = localStorage.getItem("hotel-lang") as Language | null
    if (stored && stored in translations) {
      setLang(stored)
    }
  }, [])

  function handleSelect(code: Language) {
    setLang(code)
    localStorage.setItem("hotel-lang", code)
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent("hotel-lang-change", { detail: { lang: code } }))
  }

  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-1 shadow-sm">
      {LANGUAGES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => handleSelect(code)}
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
