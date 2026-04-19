'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LoadingScreen from '@/components/LoadingScreen'
import { AuthUser } from '@/types'

export default function LoginPage() {
  const { t, isRTL } = useT()
  const router = useRouter()

  // Start with true for hydration matching (always show LoadingScreen on server and first client render)
  const [checking, setChecking] = useState(true)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // After mount: redirect if already logged in or stop checking
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

  // While checking / redirecting, show the branded loading screen
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
        .from('users')
        .select('id, clinic_id, full_name, role, password, is_active')
        .eq('username', username.trim().toLowerCase())
        .single()

      if (dbError || !data || !data.is_active || data.password !== password) {
        setError(t.errorWrongCredentials)
        return
      }

      // Update last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id)

      // Persist session
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

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className={`max-w-5xl mx-auto px-4 h-14 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm">{t.appName}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">{t.loginTitle}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.loginSubtitle}</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Error */}
              {error && (
                <div className={`flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                  {t.username}
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError('') }}
                    autoComplete="username"
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${isRTL ? 'text-right pr-4 pl-9' : 'pl-9'}`}
                    placeholder={t.username}
                  />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    autoComplete="current-password"
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${isRTL ? 'text-right pr-4 pl-9' : 'pl-9 pr-9'}`}
                    placeholder="••••••••"
                  />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors text-sm mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.loading}
                  </>
                ) : t.loginBtn}
              </button>
            </form>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            {t.noAccount}{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t.createAccount}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
