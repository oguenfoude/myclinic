'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LoadingScreen from '@/components/LoadingScreen'
import Logo from '@/components/Logo'

interface DoctorForm {
  full_name: string
  username: string
  email: string
  phone: string
  password: string
}

interface ClinicForm {
  name: string
  specialty: string
  city: string
  phone: string
  email: string
}

interface StepErrors {
  [key: string]: string
}

export default function RegisterPage() {
  const { t, isRTL } = useT()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [step, setStep] = useState(1)
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

  const [doctor, setDoctor] = useState<DoctorForm>({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  })

  const [clinic, setClinic] = useState<ClinicForm>({
    name: '',
    specialty: '',
    city: '',
    phone: '',
    email: '',
  })

  const [errors, setErrors] = useState<StepErrors>({})

  const validateStep1 = (): boolean => {
    const e: StepErrors = {}
    if (!doctor.full_name.trim()) e.full_name = t.errorRequired
    if (!doctor.username.trim()) e.username = t.errorRequired
    if (!doctor.email.trim()) e.email = t.errorRequired
    if (!doctor.password.trim()) e.password = t.errorRequired
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = (): boolean => {
    const e: StepErrors = {}
    if (!clinic.name.trim()) e.clinic_name = t.errorRequired
    if (!clinic.specialty.trim()) e.clinic_specialty = t.errorRequired
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    setLoading(true)
    setServerError('')

    try {
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: clinic.name.trim(),
          specialty: clinic.specialty.trim() || null,
          city: clinic.city.trim() || null,
          phone: clinic.phone.trim() || null,
          email: clinic.email.trim() || null,
          is_active: true,
        })
        .select('id')
        .single()

      if (clinicError) throw clinicError

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          clinic_id: clinicData.id,
          full_name: doctor.full_name.trim(),
          username: doctor.username.trim().toLowerCase(),
          email: doctor.email.trim().toLowerCase(),
          phone: doctor.phone.trim() || null,
          password: doctor.password,
          role: 'doctor',
          is_active: true,
          last_login: new Date().toISOString(),
        })
        .select('id, clinic_id, full_name, role')
        .single()

      if (userError) {
        await supabase.from('clinics').delete().eq('id', clinicData.id)
        if (userError.code === '23505') setServerError(t.errorUserExists)
        else setServerError(t.errorGeneric)
        return
      }

      if (userData) {
        localStorage.setItem('clinic_user', JSON.stringify({
          id: userData.id,
          clinic_id: userData.clinic_id,
          full_name: userData.full_name,
          role: userData.role,
        }))
      }
      router.push('/dashboard')
    } catch {
      setServerError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  if (checking) return <LoadingScreen />

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3.5 rounded-2xl border ${hasError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'} focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm shadow-black/5`

  const labelClass = `block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest ${isRTL ? 'text-right' : ''}`

  return (
    <div className={`min-h-screen flex bg-white ${isRTL ? 'flex-row-reverse text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* ── Left Branding ── */}
      <div className="hidden lg:flex lg:w-[38%] relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 items-center justify-center p-12">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 shadow-2xl mb-10 transform rotate-2">
             <Logo className="w-24 h-24 mx-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{t.appName}</h1>
          <p className="text-blue-100 font-medium opacity-80 leading-relaxed">{t.heroSubtitle}</p>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        <header className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-30 flex items-center gap-4`}>
          <LanguageSwitcher />
          <Link href="/" className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50">
             <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
          <div className="w-full max-w-xl relative z-10">
            
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-6 leading-tight">{t.registerTitle}</h2>
              <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 h-full bg-blue-600 transition-all duration-500 ease-out shadow-sm" 
                  style={{ 
                    width: `${(step / 3) * 100}%`,
                    [isRTL ? 'right' : 'left']: 0 
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className={step >= 1 ? 'text-blue-600' : ''}>{t.step1}</span>
                <span className={step >= 2 ? 'text-blue-600' : ''}>{t.step2}</span>
                <span className={step >= 3 ? 'text-blue-600' : ''}>{t.step3}</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              
              {serverError && (
                <div className={`flex items-center gap-3 px-4 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <span className="font-medium">{serverError}</span>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div>
                    <label className={labelClass}>{t.doctorName} *</label>
                    <input type="text" value={doctor.full_name} onChange={e => setDoctor({...doctor, full_name: e.target.value})} className={inputClass(!!errors.full_name)} placeholder={t.doctorName} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>{t.doctorUsername} *</label><input type="text" value={doctor.username} onChange={e => setDoctor({...doctor, username: e.target.value})} className={inputClass(!!errors.username)} placeholder={t.doctorUsername} /></div>
                    <div><label className={labelClass}>{t.doctorPhone}</label><input type="tel" value={doctor.phone} onChange={e => setDoctor({...doctor, phone: e.target.value})} className={inputClass()} placeholder={t.doctorPhone} /></div>
                  </div>
                  <div><label className={labelClass}>{t.doctorEmail} *</label><input type="email" value={doctor.email} onChange={e => setDoctor({...doctor, email: e.target.value})} className={inputClass(!!errors.email)} placeholder={t.doctorEmail} /></div>
                  <div><label className={labelClass}>{t.doctorPassword} *</label><input type="password" value={doctor.password} onChange={e => setDoctor({...doctor, password: e.target.value})} className={inputClass(!!errors.password)} placeholder="••••••••" /></div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div><label className={labelClass}>{t.clinicNameLabel} *</label><input type="text" value={clinic.name} onChange={e => setClinic({...clinic, name: e.target.value})} className={inputClass(!!errors.clinic_name)} placeholder={t.clinicNameLabel} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>{t.clinicSpecialty} *</label><input type="text" value={clinic.specialty} onChange={e => setClinic({...clinic, specialty: e.target.value})} className={inputClass(!!errors.clinic_specialty)} placeholder={t.clinicSpecialty} /></div>
                    <div><label className={labelClass}>{t.clinicCity}</label><input type="text" value={clinic.city} onChange={e => setClinic({...clinic, city: e.target.value})} className={inputClass()} placeholder={t.clinicCity} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>{t.clinicPhoneLabel}</label><input type="tel" value={clinic.phone} onChange={e => setClinic({...clinic, phone: e.target.value})} className={inputClass()} placeholder={t.clinicPhoneLabel} /></div>
                    <div><label className={labelClass}>{t.clinicEmailLabel}</label><input type="email" value={clinic.email} onChange={e => setClinic({...clinic, email: e.target.value})} className={inputClass()} placeholder={t.clinicEmailLabel} /></div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">{t.doctorInfo}</h3>
                    <div className="space-y-2 text-sm font-medium text-gray-600">
                      <p>{doctor.full_name} • <span className="text-gray-400">@{doctor.username}</span></p>
                      <p>{doctor.email}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">{t.clinicInfoLabel}</h3>
                    <div className="space-y-2 text-sm font-medium text-gray-600">
                      <p className="text-lg font-black text-gray-900">{clinic.name}</p>
                      <p>{clinic.specialty} • {clinic.city || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`flex gap-3 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {step > 1 && (
                  <button onClick={handleBack} className="flex-1 h-[3.5rem] bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm">{t.back}</button>
                )}
                <button
                  onClick={step < 3 ? handleNext : handleSubmit}
                  disabled={loading}
                  className="flex-[2] h-[3.5rem] flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest text-sm"
                >
                  {loading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : (step < 3 ? t.next : t.submit)}
                </button>
              </div>
            </div>

            <p className="text-center mt-8 text-gray-500 font-medium">
              {t.alreadyHaveAccount}{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-black border-b-2 border-blue-600/20 hover:border-blue-600 transition-all">{t.loginLink}</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
