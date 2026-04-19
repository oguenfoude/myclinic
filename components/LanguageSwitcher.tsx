'use client'

import { useT, Lang } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { lang } = useT()

  const switchLang = (newLang: Lang) => {
    localStorage.setItem('lang', newLang)
    window.dispatchEvent(new Event('lang-changed'))
  }

  const langs: { code: Lang; label: string }[] = [
    { code: 'ar', label: 'ع' },
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
  ]

  return (
    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
      {langs.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200
            ${lang === code
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
