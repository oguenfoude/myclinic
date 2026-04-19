'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import { Appointment, Patient, AuthUser } from '@/types'

interface AppointmentDialogProps {
  appointment?: Appointment | null
  patients: Patient[]
  authUser: AuthUser
  onClose: () => void
  onSave: () => void
}

const STATUS_OPTIONS = ['scheduled', 'completed', 'cancelled', 'no_show'] as const

export default function AppointmentDialog({
  appointment,
  patients,
  authUser,
  onClose,
  onSave,
}: AppointmentDialogProps) {
  const { t, isRTL } = useT()
  const isEdit = !!appointment

  const [form, setForm] = useState({
    patient_id: appointment?.patient_id ?? '',
    appointment_date: appointment?.appointment_date ?? '',
    appointment_time: appointment?.appointment_time ?? '',
    reason: appointment?.reason ?? '',
    status: appointment?.status ?? 'scheduled',
    notes: appointment?.notes ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.patient_id) e.patient_id = t.errorRequired
    if (!form.appointment_date) e.appointment_date = t.errorRequired
    if (!form.appointment_time) e.appointment_time = t.errorRequired
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')

    const payload = {
      patient_id: form.patient_id,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      reason: form.reason.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    }

    try {
      if (isEdit && appointment) {
        const { error } = await supabase
          .from('appointments')
          .update(payload)
          .eq('id', appointment.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert({ ...payload, clinic_id: authUser.clinic_id, created_by: authUser.id })
        if (error) throw error
      }
      onSave()
    } catch {
      setServerError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  const ic = (hasErr?: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
      hasErr ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
    } ${isRTL ? 'text-right' : ''}`

  const lc = `block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`

  const statusLabels: Record<string, string> = {
    scheduled: t.statusScheduled,
    completed: t.statusCompleted,
    cancelled: t.statusCancelled,
    no_show: t.statusNoShow,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? t.editAppointmentTitle : t.addAppointmentTitle}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {/* Patient */}
          <div>
            <label className={lc}>{t.patientName} <span className="text-red-500">*</span></label>
            <select
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              className={ic(!!errors.patient_id)}
            >
              <option value="">{t.selectPatient}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name} — {p.phone}</option>
              ))}
            </select>
            {errors.patient_id && <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>{t.appointmentDate} <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                className={ic(!!errors.appointment_date)}
              />
              {errors.appointment_date && <p className="text-red-500 text-xs mt-1">{errors.appointment_date}</p>}
            </div>
            <div>
              <label className={lc}>{t.appointmentTime} <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={form.appointment_time}
                onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                className={ic(!!errors.appointment_time)}
              />
              {errors.appointment_time && <p className="text-red-500 text-xs mt-1">{errors.appointment_time}</p>}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className={lc}>{t.reason}</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className={ic()}
              placeholder={t.reason}
            />
          </div>

          {/* Status */}
          <div>
            <label className={lc}>{t.status}</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
              className={ic()}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className={lc}>{t.notes}</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${ic()} resize-none`}
              placeholder={t.notes}
            />
          </div>

          {/* Actions */}
          <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.saving}
                </>
              ) : t.save}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
