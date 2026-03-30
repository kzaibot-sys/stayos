"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from '@/lib/translations'

type Lang = 'ru' | 'en' | 'kz'
type Translations = typeof translations.ru

const LangContext = createContext<{ lang: Lang; t: Translations; setLang: (l: Lang) => void }>({
  lang: 'ru',
  t: translations.ru,
  setLang: () => {},
})

export function useLang() { return useContext(LangContext) }

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')

  useEffect(() => {
    const stored = localStorage.getItem('hotel-lang') as Lang | null
    if (stored && translations[stored]) setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('hotel-lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  )
}
