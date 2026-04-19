'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useT } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function LandingPage() {
  const { t, isRTL } = useT()
  const router = useRouter()

  // Auto-redirect logged-in users to dashboard.
  // Pure navigation side-effect — no setState, so no lint issue.
  // Always render href="/register" during SSR/hydration to avoid mismatch.
  useEffect(() => {
    const stored = localStorage.getItem('clinic_user')
    if (stored) router.replace('/dashboard')
  }, [router])

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t.feature1Title,
      desc: t.feature1Desc,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: t.feature2Title,
      desc: t.feature2Desc,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: t.feature3Title,
      desc: t.feature3Desc,
      color: 'from-violet-500 to-violet-600',
    },
  ]

  const stats = [
    { value: '100%', label: t.statSecure },
    { value: '3', label: t.statLanguages },
    { value: '∞', label: t.statPatients },
  ]

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>

            {/* Logo */}
            <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">{t.appName}</span>
            </div>

            {/* Nav */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <LanguageSwitcher />
              <Link href="/login"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                {t.loginBtn}
              </Link>
              <Link href="/register"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          {t.appTagline}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          {t.heroTitle}
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-3 justify-center items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg">
            {t.getStarted}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-7 py-3.5 rounded-xl transition-colors border border-gray-200">
            {t.loginBtn}
          </Link>
        </div>

        {/* Stats */}
        <div className={`flex flex-col sm:flex-row gap-10 justify-center mt-14 pt-10 border-t border-gray-100 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-extrabold text-blue-600">{stat.value}</span>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-200">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-5 shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {t.appName} — {t.appTagline}
        </div>
      </footer>
    </div>
  )
}
