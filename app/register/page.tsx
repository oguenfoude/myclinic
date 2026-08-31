'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LoadingScreen from '@/components/LoadingScreen'
import Logo from '@/components/Logo'

interface FormData {
  full_name: string
  clinic_name: string
  username: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-danger' }
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-warning' }
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-primary' }
  return { score: 4, label: 'Strong', color: 'bg-success' }
}

export default function RegisterPage() {
  const { t, isRTL } = useT()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

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

  const [form, setForm] = useState<FormData>({
    full_name: '',
    clinic_name: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const clearError = (key: string) => {
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.full_name.trim()) e.full_name = t.errorRequired
    if (!form.clinic_name.trim()) e.clinic_name = t.errorRequired
    if (!form.username.trim()) e.username = t.errorRequired
    if (!form.password.trim()) e.password = t.errorRequired
    else if (form.password.length < 6) e.password = t.errorPasswordMin
    if (form.password !== form.confirmPassword) e.confirmPassword = t.errorPasswordMatch
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerError('')

    try {
      const { data, error } = await supabase.rpc('register_clinic', {
        p_clinic_name: form.clinic_name.trim(),
        p_doctor_name: form.full_name.trim(),
        p_username: form.username.trim().toLowerCase(),
        p_password: form.password,
        p_email: '',
      })

      if (error || !data?.ok) {
        if (data?.message === 'username_taken') setServerError(t.errorUserExists)
        else setServerError(t.errorGeneric)
        setLoading(false)
        return
      }

      localStorage.setItem('clinic_user', JSON.stringify({
        id: data.id,
        clinic_id: data.clinic_id,
        full_name: data.full_name,
        role: data.role,
      }))
      router.push('/dashboard')
    } catch {
      setServerError(t.errorGeneric)
      setLoading(false)
    }
  }

  if (checking) return <LoadingScreen />

  const ic = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl border ${hasError ? 'border-danger bg-danger-light/30' : 'border-primary-200 bg-primary-light/40'} focus:bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm`

  const lc = `block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`
  const pw = getPasswordStrength(form.password)

  return (
    <div className={`min-h-screen flex bg-white ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Left Branding ── */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden bg-gradient-to-br from-primary via-accent to-accent-dark items-center justify-center p-12">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl mb-10">
            <Logo className="w-24 h-24 mx-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">{t.appName}</h1>
          <p className="text-primary-100 font-medium opacity-80 leading-relaxed">{t.heroSubtitle}</p>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="flex-1 flex flex-col bg-surface relative">
        <header className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-30 flex items-center gap-4`}>
          <LanguageSwitcher />
          <Link href="/" className="w-10 h-10 rounded-xl bg-primary-light/50 border border-primary-200 shadow-sm flex items-center justify-center hover:bg-primary-light">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
          <div className="w-full max-w-md relative z-10">

            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{t.registerTitle}</h2>
              <p className="text-sm text-gray-500">{t.loginSubtitle}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-7 sm:p-9 shadow-2xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              {serverError && (
                <div className={`flex items-center gap-3 px-4 py-4 bg-danger-light border border-danger-100 rounded-xl text-danger text-sm mb-6`}>
                  <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <span className="font-medium">{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className={lc}>{t.fullName} *</label>
                  <input type="text" value={form.full_name} onChange={e => { setForm({...form, full_name: e.target.value}); clearError('full_name') }} className={ic(!!errors.full_name)} placeholder={t.fullName} />
                  {errors.full_name && <p className="text-danger text-xs mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className={lc}>{t.clinicNameLabel} *</label>
                  <input type="text" value={form.clinic_name} onChange={e => { setForm({...form, clinic_name: e.target.value}); clearError('clinic_name') }} className={ic(!!errors.clinic_name)} placeholder={t.clinicNameLabel} />
                  {errors.clinic_name && <p className="text-danger text-xs mt-1">{errors.clinic_name}</p>}
                </div>

                <div>
                  <label className={lc}>{t.doctorUsername} *</label>
                  <input type="text" value={form.username} onChange={e => { setForm({...form, username: e.target.value}); clearError('username') }} className={ic(!!errors.username)} placeholder={t.doctorUsername} />
                  {errors.username && <p className="text-danger text-xs mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className={lc}>{t.doctorPassword} *</label>
                  <input type="password" value={form.password} onChange={e => { setForm({...form, password: e.target.value}); clearError('password') }} className={ic(!!errors.password)} placeholder="••••••••" />
                  {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${i <= pw.score ? pw.color : 'bg-primary-100'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{pw.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className={lc}>{t.confirmPassword} *</label>
                  <input type="password" value={form.confirmPassword} onChange={e => { setForm({...form, confirmPassword: e.target.value}); clearError('confirmPassword') }} className={ic(!!errors.confirmPassword)} placeholder="••••••••" />
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[3.25rem] flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover disabled:bg-primary-400 text-white font-black rounded-xl transition-all active:scale-95 shadow-primary text-sm"
                >
                  {loading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : t.createAccount}
                </button>
              </form>
            </div>

            <p className="text-center mt-8 text-gray-500 font-medium text-sm">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="text-primary hover:text-primary-hover font-bold transition-all">{t.loginLink}</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
