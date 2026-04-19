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
  email: string
  gender: 'male' | 'female' | ''
  date_of_birth: string
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | ''
  address: string
  city: string
  emergency_phone: string
  notes: string
}

interface FormErrors {
  full_name?: string
  phone?: string
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export default function PatientDialog({ patient, onClose, onSave, authUser }: PatientDialogProps) {
  const { t, isRTL } = useT()
  const isEdit = !!patient

  const [form, setForm] = useState<FormData>({
    full_name: patient?.full_name ?? '',
    phone: patient?.phone ?? '',
    email: patient?.email ?? '',
    gender: patient?.gender ?? '',
    date_of_birth: patient?.date_of_birth ?? '',
    blood_type: patient?.blood_type ?? '',
    address: patient?.address ?? '',
    city: patient?.city ?? '',
    emergency_phone: patient?.emergency_phone ?? '',
    notes: patient?.notes ?? '',
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
      email: form.email.trim() || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth || null,
      blood_type: form.blood_type || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      emergency_phone: form.emergency_phone.trim() || null,
      notes: form.notes.trim() || null,
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
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
    } ${isRTL ? 'text-right' : ''}`

  const labelClass = `block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isRTL ? 'text-right' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? t.editPatientTitle : t.addPatientTitle}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Server Error */}
          {serverError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          {/* Row 1: Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.fullName} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={inputClass(!!errors.full_name)}
                placeholder={t.fullName}
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className={labelClass}>{t.phone} <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass(!!errors.phone)}
                placeholder={t.phone}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 2: Email + Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass()}
                placeholder={t.email}
              />
            </div>
            <div>
              <label className={labelClass}>{t.dateOfBirth}</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className={inputClass()}
              />
            </div>
          </div>

          {/* Row 3: Gender + Blood Type */}
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
              <label className={labelClass}>{t.bloodType}</label>
              <select
                value={form.blood_type}
                onChange={(e) => setForm({ ...form, blood_type: e.target.value as FormData['blood_type'] })}
                className={inputClass()}
              >
                <option value="">—</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Address + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.address}</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass()}
                placeholder={t.address}
              />
            </div>
            <div>
              <label className={labelClass}>{t.city}</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass()}
                placeholder={t.city}
              />
            </div>
          </div>

          {/* Row 5: Emergency Phone */}
          <div>
            <label className={labelClass}>{t.emergencyPhone}</label>
            <input
              type="tel"
              value={form.emergency_phone}
              onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
              className={inputClass()}
              placeholder={t.emergencyPhone}
            />
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className={labelClass}>{t.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className={`${inputClass()} resize-none`}
              placeholder={t.notes}
            />
          </div>

          {/* Actions */}
          <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
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
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200 text-sm"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
