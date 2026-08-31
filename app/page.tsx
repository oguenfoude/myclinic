'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useT } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Logo from '@/components/Logo'

export default function LandingPage() {
  const { t, isRTL } = useT()
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('clinic_user')
    if (stored) router.replace('/dashboard')
  }, [router])

  const features = [
    {
      icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      ),
      title: t.feature1Title,
      desc: t.feature1Desc,
      color: 'text-primary',
      bgType: 'bg-primary/10',
    },
    {
      icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      ),
      title: t.feature2Title,
      desc: t.feature2Desc,
      color: 'text-accent',
      bgType: 'bg-accent/10',
    },
    {
      icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      ),
      title: t.feature3Title,
      desc: t.feature3Desc,
      color: 'text-accent-dark',
      bgType: 'bg-accent/10',
    },
  ]

  const stats = [
    { value: '100%', label: t.statSecure },
    { value: '3', label: t.statLanguages },
    { value: '∞', label: t.statPatients },
  ]

  return (
    <div className="relative min-h-screen bg-surface overflow-hidden font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-accent-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-20" />

      {/* ── Navbar ── */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between h-20`}>
            
            {/* Logo */}
            <div className={`flex items-center gap-3`}>
              <Logo className="w-10 h-10 shadow-sm rounded-xl" />
              <span className="font-extrabold text-xl text-gray-900 tracking-tight">{t.appName}</span>
            </div>

            {/* Nav */}
            <div className={`flex items-center gap-3`}>
              <LanguageSwitcher />
              <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-primary hover:text-primary-dark px-4 py-2.5 rounded-xl hover:bg-primary/5 transition-all">
                {t.loginBtn}
              </Link>
              <Link href="/register" className="text-sm font-bold bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5">
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-20 pb-24 lg:pt-32 lg:pb-32 text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-primary-200/60 text-gray-700 text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-sm shadow-primary/5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t.appTagline}
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {t.heroTitle.split(' ').slice(0, 2).join(' ')}
            </span>{' '}
            {t.heroTitle.split(' ').slice(2).join(' ')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {t.heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center`}>
            <Link href="/register"
              className={`flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5`}>
              {t.getStarted}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
              </svg>
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 bg-primary-light/50 hover:bg-primary-light text-gray-800 font-bold px-8 py-4 rounded-xl border border-primary-200 shadow-sm transition-all hover:border-primary-300">
              {t.loginBtn}
            </Link>
          </div>

          {/* Stats section */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-16">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1 group-hover:scale-110 transition-transform duration-300">{s.value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mockup UI (Abstract Dashboard) ── */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl p-2 sm:p-3 shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-white border border-primary-100 shadow-sm aspect-[16/10] sm:aspect-[21/9] flex flex-col relative w-full">
              {/* Mockup Header */}
              <div className="h-10 sm:h-12 border-b border-primary-100 flex items-center px-4 gap-2 bg-primary-light/50">
                <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-mock-red" />
                   <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-mock-amber" />
                   <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-mock-green" />
                </div>
              </div>
              {/* Mockup Body */}
              <div className="flex-1 flex bg-surface/50">
                {/* Sidebar Mock */}
                <div className="w-1/4 max-w-[200px] border-r border-primary-100 bg-white p-4 space-y-3 hidden sm:block">
                  <div className="w-full h-8 bg-primary-light border border-primary-200 rounded-lg" />
                  <div className="w-3/4 h-8 bg-primary-light/60 border border-primary-100 rounded-lg" />
                  <div className="w-5/6 h-8 bg-primary-light/40 border border-primary-100 rounded-lg" />
                </div>
                {/* Content Mock */}
                <div className="flex-1 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
                  <div className="w-full h-6 sm:h-7 bg-skeleton rounded-lg" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-3 sm:p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Today</p>
                          <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight">12,500</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block bg-white rounded-xl border border-primary-100 shadow-sm p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Patients</p>
                          <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight">1,248</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block bg-white rounded-xl border border-primary-100 shadow-sm p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-stat-today-50 flex items-center justify-center flex-shrink-0"><svg className="w-4 h-4 text-stat-today-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">This Month</p>
                          <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight">96</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-primary-100 shadow-sm mt-1 p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex gap-2">
                        <div className="w-16 h-5 bg-primary/10 rounded-md" />
                        <div className="w-14 h-5 bg-primary-light rounded-md" />
                        <div className="hidden sm:block w-14 h-5 bg-primary-light rounded-md" />
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-5 h-5 bg-gray-100 rounded-md" />
                        <div className="w-5 h-5 bg-gray-100 rounded-md" />
                      </div>
                    </div>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="flex items-center gap-3 py-2 border-t border-gray-50">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex-shrink-0" />
                        <div className="h-3 w-24 sm:w-32 bg-skeleton-light rounded" />
                        <div className="h-3 w-14 sm:w-20 bg-gray-100 rounded hidden sm:block" />
                        <div className="h-4 w-9 sm:w-12 bg-primary/10 rounded ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Overlay Gradient for blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-20 bg-white border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.feature1Title}</h2>
            <p className="text-gray-600">{t.feature1Desc}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-primary-light/40 border border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgType} ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-20 py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary via-accent to-accent-dark rounded-[2.5rem] p-10 sm:p-16 text-center shadow-2xl shadow-primary/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full mix-blend-screen filter blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full mix-blend-multiply filter blur-[100px]" />
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10">{t.appName}</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-10 relative z-10">{t.appTagline}</p>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold px-8 py-4 rounded-xl shadow-primary transition-colors">
              {t.getStarted}
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border border-white/20 transition-colors">
              {t.loginBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-20 border-t border-primary-100 bg-white py-12">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className={`flex items-center gap-2`}>
            <Logo className="w-6 h-6 opacity-80" />
            <span className="font-bold text-gray-400 tracking-wide">{t.appName}</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} {t.appName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
