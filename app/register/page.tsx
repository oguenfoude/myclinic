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
  // Start with true for hydration matching
  const [checking, setChecking] = useState(true)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  // After mount: redirect if already logged in or show form
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
      // 1. Insert clinic
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

      // 2. Insert doctor user
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
        // Rollback: delete clinic if user insert fails
        await supabase.from('clinics').delete().eq('id', clinicData.id)
        if (userError.code === '23505') {
          setServerError(t.errorUserExists)
        } else {
          setServerError(t.errorGeneric)
        }
        return
      }

      // 3. Auto-login: store session and go directly to dashboard
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

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
    } ${isRTL ? 'text-right' : ''}`

  const labelClass = `block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : ''}`

  const steps = [
    { num: 1, label: t.step1 },
    { num: 2, label: t.step2 },
    { num: 3, label: t.step3 },
  ]

  // Show branded loader immediately if already logged in
  if (checking) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className={`max-w-2xl mx-auto px-4 h-14 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/" className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Logo className="w-8 h-8" />
            <span className="font-bold text-gray-900 text-sm">{t.appName}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t.registerTitle}</h1>
        </div>

        {/* Step Indicator */}
        <div className={`flex items-center justify-center mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {steps.map((s, idx) => (
            <div key={s.num} className={`flex items-center ${isRTL && idx < steps.length - 1 ? 'flex-row-reverse' : ''}`}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step > s.num
                    ? 'bg-blue-600 text-white'
                    : step === s.num
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.num}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${step === s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors duration-300 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Server Error */}
          {serverError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          {/* Step 1 — Doctor Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className={`text-lg font-bold text-gray-800 mb-4 ${isRTL ? 'text-right' : ''}`}>{t.doctorInfo}</h2>
              <div>
                <label className={labelClass}>{t.doctorName} <span className="text-red-500">*</span></label>
                <input type="text" value={doctor.full_name}
                  onChange={(e) => setDoctor({ ...doctor, full_name: e.target.value })}
                  className={inputClass(!!errors.full_name)} placeholder={t.doctorName} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.doctorUsername} <span className="text-red-500">*</span></label>
                  <input type="text" value={doctor.username}
                    onChange={(e) => setDoctor({ ...doctor, username: e.target.value })}
                    className={inputClass(!!errors.username)} placeholder={t.doctorUsername} />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t.doctorPhone}</label>
                  <input type="tel" value={doctor.phone}
                    onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                    className={inputClass()} placeholder={t.doctorPhone} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t.doctorEmail} <span className="text-red-500">*</span></label>
                <input type="email" value={doctor.email}
                  onChange={(e) => setDoctor({ ...doctor, email: e.target.value })}
                  className={inputClass(!!errors.email)} placeholder={t.doctorEmail} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={labelClass}>{t.doctorPassword} <span className="text-red-500">*</span></label>
                <input type="password" value={doctor.password}
                  onChange={(e) => setDoctor({ ...doctor, password: e.target.value })}
                  className={inputClass(!!errors.password)} placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step 2 — Clinic Info */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className={`text-lg font-bold text-gray-800 mb-4 ${isRTL ? 'text-right' : ''}`}>{t.clinicInfoLabel}</h2>
              <div>
                <label className={labelClass}>{t.clinicNameLabel} <span className="text-red-500">*</span></label>
                <input type="text" value={clinic.name}
                  onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
                  className={inputClass(!!errors.clinic_name)} placeholder={t.clinicNameLabel} />
                {errors.clinic_name && <p className="text-red-500 text-xs mt-1">{errors.clinic_name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.clinicSpecialty} <span className="text-red-500">*</span></label>
                  <input type="text" value={clinic.specialty}
                    onChange={(e) => setClinic({ ...clinic, specialty: e.target.value })}
                    className={inputClass(!!errors.clinic_specialty)} placeholder={t.clinicSpecialty} />
                  {errors.clinic_specialty && <p className="text-red-500 text-xs mt-1">{errors.clinic_specialty}</p>}
                </div>
                <div>
                  <label className={labelClass}>{t.clinicCity}</label>
                  <input type="text" value={clinic.city}
                    onChange={(e) => setClinic({ ...clinic, city: e.target.value })}
                    className={inputClass()} placeholder={t.clinicCity} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.clinicPhoneLabel}</label>
                  <input type="tel" value={clinic.phone}
                    onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                    className={inputClass()} placeholder={t.clinicPhoneLabel} />
                </div>
                <div>
                  <label className={labelClass}>{t.clinicEmailLabel}</label>
                  <input type="email" value={clinic.email}
                    onChange={(e) => setClinic({ ...clinic, email: e.target.value })}
                    className={inputClass()} placeholder={t.clinicEmailLabel} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className={`text-lg font-bold text-gray-800 mb-4 ${isRTL ? 'text-right' : ''}`}>{t.reviewAndSubmit}</h2>

              {/* Doctor Review */}
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className={`font-semibold text-blue-700 text-sm uppercase tracking-wide mb-3 ${isRTL ? 'text-right' : ''}`}>{t.doctorInfo}</h3>
                <div className="space-y-2">
                  {[
                    { label: t.doctorName, value: doctor.full_name },
                    { label: t.doctorUsername, value: doctor.username },
                    { label: t.doctorEmail, value: doctor.email },
                    { label: t.doctorPhone, value: doctor.phone || '—' },
                  ].map(({ label, value }, i) => (
                    <div key={i} className={`flex gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-500 flex-shrink-0">{label}:</span>
                      <span className="font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinic Review */}
              <div className="bg-indigo-50 rounded-xl p-5">
                <h3 className={`font-semibold text-indigo-700 text-sm uppercase tracking-wide mb-3 ${isRTL ? 'text-right' : ''}`}>{t.clinicInfoLabel}</h3>
                <div className="space-y-2">
                  {[
                    { label: t.clinicNameLabel, value: clinic.name },
                    { label: t.clinicSpecialty, value: clinic.specialty },
                    { label: t.clinicCity, value: clinic.city || '—' },
                    { label: t.clinicPhoneLabel, value: clinic.phone || '—' },
                    { label: t.clinicEmailLabel, value: clinic.email || '—' },
                  ].map(({ label, value }, i) => (
                    <div key={i} className={`flex gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-500 flex-shrink-0">{label}:</span>
                      <span className="font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={`flex gap-3 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200 text-sm"
              >
                {t.back}
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
              >
                {t.next}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.submitting}
                  </>
                ) : t.submit}
              </button>
            )}
          </div>
        </div>

        {/* Login Link */}
        <p className={`text-center text-sm text-gray-500 mt-6 ${isRTL ? '' : ''}`}>
          {t.alreadyHaveAccount}{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            {t.loginLink}
          </Link>
        </p>
      </main>
    </div>
  )
}
