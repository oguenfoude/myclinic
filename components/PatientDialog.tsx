'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import { Patient, AuthUser } from '@/types'

interface PatientDialogProps {
  patient?: Patient | null
  onClose: () => void
  onSave: () => void
  authUser: AuthUser
}

interface FormData {
  full_name: string
  phone: string
  gender: 'male' | 'female' | ''
  medical_studies: string
  price: number
}

interface FormErrors {
  full_name?: string
  phone?: string
}

export default function PatientDialog({ patient, onClose, onSave, authUser }: PatientDialogProps) {
  const { t, isRTL } = useT()
  const isEdit = !!patient

  const [form, setForm] = useState<FormData>({
    full_name: patient?.full_name ?? '',
    phone: patient?.phone ?? '',
    gender: patient?.gender ?? '',
    medical_studies: patient?.medical_studies ?? '',
    price: patient?.price ?? 0,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!form.full_name.trim()) newErrors.full_name = t.errorRequired
    if (!form.phone.trim()) newErrors.phone = t.errorRequired
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerError('')

    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      gender: form.gender || null,
      medical_studies: form.medical_studies.trim() || null,
      price: form.price,
    }

    try {
      if (isEdit && patient) {
        const { error } = await supabase
          .from('patients')
          .update(payload)
          .eq('id', patient.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('patients')
          .insert({
            ...payload,
            clinic_id: authUser.clinic_id,
            created_by: authUser.id,
            is_active: true,
          })
        if (error) throw error
      }
      onSave()
    } catch {
      setServerError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
      hasError ? 'border-danger bg-danger-light' : 'border-primary-200 bg-primary-light/40 focus:bg-white'
    } ${isRTL ? 'text-right' : ''}`

  const labelClass = `block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto ${isRTL ? 'text-right' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? t.editPatientTitle : t.addPatientTitle}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-primary-dark hover:bg-primary-light transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {serverError && (
            <div className={`flex items-center gap-2 px-4 py-3 bg-danger-light border border-danger-200 rounded-xl text-danger text-sm`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.fullName} <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={inputClass(!!errors.full_name)}
                placeholder={t.fullName}
              />
              {errors.full_name && <p className="text-danger text-xs mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className={labelClass}>{t.phone} <span className="text-danger">*</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass(!!errors.phone)}
                placeholder={t.phone}
              />
              {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.gender}</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as FormData['gender'] })}
                className={inputClass()}
              >
                <option value="">—</option>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t.price}</label>
              <input
                type="number"
                min={0}
                step="any"
                value={form.price}
                onChange={(e) => {
                  const v = e.target.value === '' ? 0 : Number(e.target.value)
                  setForm({ ...form, price: Math.max(0, isNaN(v) ? 0 : v) })
                }}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault()
                }}
                className={`${inputClass()} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-ms-clear]:hidden`}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.medicalStudies}</label>
            <textarea
              value={form.medical_studies}
              onChange={(e) => setForm({ ...form, medical_studies: e.target.value })}
              rows={3}
              className={`${inputClass()} resize-none`}
              placeholder={t.medicalStudies}
            />
          </div>

          <div className={`flex gap-3 pt-2`}>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-primary-400 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm shadow-primary/20 text-sm"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-primary-light/60 hover:bg-primary-light text-gray-700 font-semibold rounded-xl transition-all active:scale-95 text-sm"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
