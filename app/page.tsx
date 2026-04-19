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
      color: 'text-blue-600',
      bgType: 'bg-blue-50',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: t.feature2Title,
      desc: t.feature2Desc,
      color: 'text-indigo-600',
      bgType: 'bg-indigo-50',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: t.feature3Title,
      desc: t.feature3Desc,
      color: 'text-violet-600',
      bgType: 'bg-violet-50',
    },
  ]

  const stats = [
    { value: '100%', label: t.statSecure },
    { value: '3', label: t.statLanguages },
    { value: '∞', label: t.statPatients },
  ]

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-violet-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20" />

      {/* ── Navbar ── */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between h-20 ${isRTL ? 'flex-row-reverse' : ''}`}>
            
            {/* Logo */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Logo className="w-10 h-10 shadow-sm rounded-xl" />
              <span className="font-extrabold text-xl text-gray-900 tracking-tight">{t.appName}</span>
            </div>

            {/* Nav */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <LanguageSwitcher />
              <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl hover:bg-black/5 transition-all">
                {t.loginBtn}
              </Link>
              <Link href="/register" className="text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 transition-all transform hover:-translate-y-0.5">
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
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-gray-200/50 text-gray-700 text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {t.appTagline}
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {t.heroTitle.split(' ').slice(0, 2).join(' ')}
            </span>{' '}
            {t.heroTitle.split(' ').slice(2).join(' ')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {t.heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Link href="/register"
              className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:-translate-y-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {t.getStarted}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
              </svg>
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-8 py-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-gray-300">
              {t.loginBtn}
            </Link>
          </div>
        </div>

        {/* ── Mockup UI (Abstract Dashboard) ── */}
        <div className="mt-20 max-w-5xl mx-auto perspective-[2000px]">
          <div className="relative rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl p-2 sm:p-3 shadow-2xl transform rotateX-[5deg] scale-[0.98] hover:rotateX-0 hover:scale-100 transition-all duration-700 ease-out">
            <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm aspect-[16/10] sm:aspect-[21/9] flex flex-col relative w-full">
              {/* Mockup Header */}
              <div className="h-10 sm:h-12 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/80">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
                </div>
              </div>
              {/* Mockup Body */}
              <div className="flex-1 flex bg-slate-50/50">
                {/* Sidebar Mock */}
                <div className="w-1/4 max-w-[200px] border-r border-gray-100 bg-white p-4 space-y-3 hidden sm:block">
                  <div className="w-full h-8 bg-blue-50 border border-blue-100 rounded-lg" />
                  <div className="w-3/4 h-8 bg-slate-50 rounded-lg" />
                  <div className="w-5/6 h-8 bg-slate-50 rounded-lg" />
                </div>
                {/* Content Mock */}
                <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4">
                  <div className="w-1/3 h-5 sm:h-6 bg-slate-200 rounded animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                     <div className="h-20 sm:h-24 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center p-4"><div className="w-10 h-10 rounded-full bg-blue-50 mr-3" /><div className="flex-1 space-y-2"><div className="w-full h-2 bg-slate-100 rounded" /><div className="w-1/2 h-2 bg-slate-100 rounded" /></div></div>
                     <div className="hidden sm:flex h-24 bg-white rounded-xl border border-gray-100 shadow-sm items-center p-4"><div className="w-10 h-10 rounded-full bg-indigo-50 mr-3" /><div className="flex-1 space-y-2"><div className="w-full h-2 bg-slate-100 rounded" /><div className="w-1/2 h-2 bg-slate-100 rounded" /></div></div>
                     <div className="hidden sm:flex h-24 bg-white rounded-xl border border-gray-100 shadow-sm items-center p-4"><div className="w-10 h-10 rounded-full bg-teal-50 mr-3" /><div className="flex-1 space-y-2"><div className="w-full h-2 bg-slate-100 rounded" /><div className="w-1/2 h-2 bg-slate-100 rounded" /></div></div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm mt-2 p-4">
                    <div className="w-full h-full border-2 border-dashed border-slate-100 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
            {/* Overlay Gradient for blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.statSecure}</h2>
            <p className="text-gray-500">{t.statLanguages}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgType} ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-20 py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[2.5rem] p-10 sm:p-16 text-center shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10">{t.appName}</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-10 relative z-10">{t.appTagline}</p>
          <Link href="/register" className="relative z-10 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors">
            {t.getStarted}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-20 border-t border-gray-200 bg-white py-12">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Logo className="w-6 h-6 grayscale opacity-50" />
            <span className="font-bold text-gray-400 tracking-wide">{t.appName}</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} {t.appName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
