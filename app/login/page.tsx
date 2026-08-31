'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LoadingScreen from '@/components/LoadingScreen'
import Logo from '@/components/Logo'
import { AuthUser } from '@/types'

export default function LoginPage() {
  const { t, isRTL } = useT()
  const router = useRouter()

  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    startTransition(() => {
      const stored = localStorage.getItem('clinic_user')
      if (stored) {
        router.replace('/dashboard')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) return <LoadingScreen />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError(t.errorRequired)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: dbError } = await supabase
        .rpc('app_login', {
          p_username: username.trim().toLowerCase(),
          p_password: password,
        })

      if (dbError || !data?.ok) {
        setError(t.errorWrongCredentials)
        return
      }

      const authUser: AuthUser = {
        id: data.id,
        clinic_id: data.clinic_id,
        full_name: data.full_name,
        role: data.role as 'doctor' | 'secretary',
      }
      localStorage.setItem('clinic_user', JSON.stringify(authUser))

      router.push('/dashboard')
    } catch {
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-3.5 rounded-2xl border border-primary-200 bg-primary-light/40 focus:bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm shadow-primary/5`

  return (
    <div className={`min-h-screen flex bg-white ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* ── Left/Branding Panel (Hidden on Mobile) ── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-primary via-accent to-accent-dark items-center justify-center p-12">
        {/* Animated Background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 text-center max-w-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 shadow-2xl mb-10 transform -rotate-3">
             <Logo className="w-24 h-24 mx-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">{t.appName}</h1>
          <p className="text-primary-100 text-lg font-medium opacity-80 leading-relaxed">{t.heroSubtitle}</p>
          
          <div className="mt-12 flex justify-center gap-1.5">
            <div className="h-1.5 w-8 rounded-full bg-white shadow-sm shadow-white/50" />
            <div className="h-1.5 w-2 rounded-full bg-white/30" />
            <div className="h-1.5 w-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* ── Right/Form Panel ── */}
      <div className="flex-1 flex flex-col bg-surface relative">
        <header className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-30 flex items-center gap-4`}>
          <LanguageSwitcher />
          <Link href="/" className="w-10 h-10 rounded-xl bg-primary-light/50 border border-primary-200 shadow-sm flex items-center justify-center hover:bg-primary-light transition-colors">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative overflow-hidden">
          {/* Mobile Background decoration */}
          <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary-200 rounded-full blur-[80px] opacity-20" />
          
          <div className="w-full max-w-md relative z-10">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-10">
              <Logo className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
              <h1 className="text-2xl font-black text-gray-900">{t.appName}</h1>
            </div>

            <div className={`mb-10 ${isRTL ? 'text-right' : ''}`}>
              <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{t.loginTitle}</h2>
              <p className="text-gray-500 font-medium">{t.loginSubtitle}</p>
            </div>

            {/* Glass Form Card */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {error && (
                  <div className={`flex items-center gap-3 px-4 py-4 bg-danger-light border border-danger-100 rounded-[1.25rem] text-danger text-sm`}>
                    <svg className="w-5 h-5 flex-shrink-0 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t.username}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError('') }}
                      autoComplete="username"
                      className={`${inputClass} ${isRTL ? 'pr-12' : 'pl-12'} group-hover:border-primary-200 transition-colors`}
                      placeholder={t.username}
                    />
                    <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors ${isRTL ? 'right-4' : 'left-4'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{t.password}</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      autoComplete="current-password"
                      className={`${inputClass} ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} group-hover:border-primary-200 transition-colors`}
                      placeholder="••••••••"
                    />
                    <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors ${isRTL ? 'right-4' : 'left-4'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[3.5rem] flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover disabled:bg-primary-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-primary/20 hover:shadow-primary/30 uppercase tracking-widest text-sm"
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : t.loginBtn}
                </button>
              </form>
            </div>

            <p className="text-center mt-10 text-gray-500 font-medium">
              {t.noAccount}{' '}
              <Link href="/register" className="text-primary hover:text-primary-hover font-black border-b-2 border-primary/20 hover:border-primary transition-all">
                {t.createAccount}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
