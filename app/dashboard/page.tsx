'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import { AuthUser, Patient, User, Appointment } from '@/types'
import Sidebar from '@/components/Sidebar'
import PatientDialog from '@/components/PatientDialog'
import AppointmentDialog from '@/components/AppointmentDialog'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LoadingScreen from '@/components/LoadingScreen'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

function fmtTime(t: string | null) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  no_show: 'bg-red-100 text-red-600',
}

// ─── Reusable UI ───────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

type Tab = 'patients' | 'appointments' | 'settings'

export default function DashboardPage() {
  const { t, isRTL } = useT()
  const router = useRouter()

  // Start with null/default states for SSR hydration matching
  const [isMounted, setIsMounted] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('patients')

  // Patients
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppts, setLoadingAppts] = useState(false)
  const [apptDialogOpen, setApptDialogOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [apptFilter, setApptFilter] = useState<'all' | 'scheduled' | 'today'>('all')
  const [apptSearch, setApptSearch] = useState('')
  const [apptDateFilter, setApptDateFilter] = useState('')

  // Settings (doctor only) — no `clinic` object needed; we only use the form
  const [clinicForm, setClinicForm] = useState({ name: '', specialty: '', city: '', phone: '', email: '', address: '' })
  const [clinicLoading, setClinicLoading] = useState(false)
  const [clinicSuccess, setClinicSuccess] = useState(false)
  const [clinicError, setClinicError] = useState('')
  const [secretaries, setSecretaries] = useState<User[]>([])
  const [secForm, setSecForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '' })
  const [secLoading, setSecLoading] = useState(false)
  const [secError, setSecError] = useState('')
  const [secSuccess, setSecSuccess] = useState(false)

  // ── Auth Check on Mount ──
  useEffect(() => {
    startTransition(() => {
      setIsMounted(true)
      const stored = localStorage.getItem('clinic_user')
      if (stored) {
        try {
          const u = JSON.parse(stored) as AuthUser
          setAuthUser(u)
          if (u.role === 'secretary') setActiveTab('appointments')
        } catch {
          localStorage.removeItem('clinic_user')
          router.replace('/login')
        }
      } else {
        router.replace('/login')
      }
    })
  }, [router])

  // ── Update document dir on language change ──
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [isRTL])

  // ── Load Patients ──
  const loadPatients = useCallback(async () => {
    if (!authUser) return
    setLoadingPatients(true)
    const { data } = await supabase
      .from('patients').select('*')
      .eq('clinic_id', authUser.clinic_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (data) setPatients(data as Patient[])
    setLoadingPatients(false)
  }, [authUser])

  // ── Load Appointments ──
  const loadAppointments = useCallback(async () => {
    if (!authUser) return
    setLoadingAppts(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(full_name)')
        .eq('clinic_id', authUser.clinic_id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
      // If table doesn't exist yet, ignore silently
      if (!error && data) {
        setAppointments(
          (data as Array<Record<string, unknown>>).map((a) => ({
            ...(a as unknown as Appointment),
            patient_name:
              (a.patients as Record<string, string> | null)?.full_name ?? '—',
          }))
        )
      }
    } catch {
      // appointments table may not exist yet — stay empty
    }
    setLoadingAppts(false)
  }, [authUser])

  // ── Load Clinic + Secretaries ──
  const loadClinic = useCallback(async () => {
    if (!authUser) return
    const { data } = await supabase.from('clinics').select('*').eq('id', authUser.clinic_id).single()
    if (data) {
      // No separate `clinic` object needed — populate the form directly
      setClinicForm({ name: data.name ?? '', specialty: data.specialty ?? '', city: data.city ?? '', phone: data.phone ?? '', email: data.email ?? '', address: data.address ?? '' })
    }
  }, [authUser])

  const loadSecretaries = useCallback(async () => {
    if (!authUser) return
    const { data } = await supabase.from('users').select('*').eq('clinic_id', authUser.clinic_id).eq('role', 'secretary').order('created_at', { ascending: false })
    if (data) setSecretaries(data as User[])
  }, [authUser])

  // startTransition lets React batch these state updates and prevents the
  // react-hooks/set-state-in-effect lint error about setState inside effect bodies.
  useEffect(() => {
    if (!authUser) return
    startTransition(() => { loadPatients(); loadAppointments() })
  }, [authUser, loadPatients, loadAppointments])

  useEffect(() => {
    if (!authUser || activeTab !== 'settings' || authUser.role !== 'doctor') return
    startTransition(() => { loadClinic(); loadSecretaries() })
  }, [authUser, activeTab, loadClinic, loadSecretaries])

  // ── Derived data ──
  const filteredPatients = patients.filter(p => {
    const q = patientSearch.toLowerCase()
    return p.full_name.toLowerCase().includes(q) || p.phone.includes(q)
  })

  const today = new Date().toISOString().split('T')[0]
  const filteredAppts = appointments.filter(a => {
    // Status filter
    if (apptFilter === 'today' && a.appointment_date !== today) return false
    if (apptFilter === 'scheduled' && a.status !== 'scheduled') return false
    // Date filter
    if (apptDateFilter && a.appointment_date !== apptDateFilter) return false
    // Search filter
    if (apptSearch) {
      const q = apptSearch.toLowerCase()
      const matchName = a.patient_name?.toLowerCase().includes(q)
      const matchReason = a.reason?.toLowerCase().includes(q)
      if (!matchName && !matchReason) return false
    }
    return true
  })

  const todayCount = appointments.filter(a => a.appointment_date === today).length
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length
  const completedCount = appointments.filter(a => a.status === 'completed').length

  // ── Actions ──
  const deactivatePatient = async (id: string) => {
    await supabase.from('patients').update({ is_active: false }).eq('id', id)
    setPatients(prev => prev.filter(p => p.id !== id))
  }

  const deleteAppointment = async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
  }

  const updateAppointmentStatus = async (id: string, status: 'completed' | 'no_show' | 'scheduled') => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const saveClinic = async () => {
    if (!authUser || !clinicForm.name.trim()) { setClinicError(t.errorRequired); return }
    setClinicLoading(true); setClinicError(''); setClinicSuccess(false)
    const { error } = await supabase.from('clinics').update({
      name: clinicForm.name.trim(), specialty: clinicForm.specialty.trim() || null,
      city: clinicForm.city.trim() || null, phone: clinicForm.phone.trim() || null,
      email: clinicForm.email.trim() || null, address: clinicForm.address.trim() || null,
    }).eq('id', authUser.clinic_id)
    if (error) setClinicError(t.errorGeneric); else setClinicSuccess(true)
    setClinicLoading(false)
  }

  const addSecretary = async () => {
    if (!authUser || !secForm.full_name.trim() || !secForm.username.trim() || !secForm.password.trim()) { setSecError(t.errorRequired); return }
    setSecLoading(true); setSecError(''); setSecSuccess(false)
    const { error } = await supabase.from('users').insert({
      clinic_id: authUser.clinic_id, full_name: secForm.full_name.trim(),
      username: secForm.username.trim().toLowerCase(),
      email: secForm.email.trim().toLowerCase() || `sec_${Date.now()}@clinic.local`,
      phone: secForm.phone.trim() || null, password: secForm.password, role: 'secretary', is_active: true,
    })
    if (error) { setSecError(error.code === '23505' ? t.errorUserExists : t.errorGeneric) }
    else { setSecSuccess(true); setSecForm({ full_name: '', username: '', email: '', phone: '', password: '' }); loadSecretaries() }
    setSecLoading(false)
  }

  const deactivateSecretary = async (id: string) => {
    await supabase.from('users').update({ is_active: false }).eq('id', id)
    setSecretaries(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s))
  }

  const handleLogout = async () => {
    localStorage.removeItem('clinic_user')
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // Show branded loading screen while checking auth or redirecting
  if (!isMounted || !authUser) return <LoadingScreen />

  const ic = `w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm shadow-black/5 ${isRTL ? 'text-right' : ''}`
  const lc = `block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`

  const statusLabels: Record<string, string> = {
    scheduled: t.statusScheduled, completed: t.statusCompleted,
    cancelled: t.statusCancelled, no_show: t.statusNoShow,
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className={`min-h-screen ${isRTL ? 'md:mr-60' : 'md:ml-60'} pb-20 md:pb-0 flex flex-col`}>
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className={`flex items-center justify-between h-14 px-4 sm:px-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-bold text-gray-900">{t.welcome}, <span className="text-blue-600">{authUser.full_name}</span></p>
              <p className="text-xs text-gray-400 capitalize">{authUser.role}</p>
            </div>
            <div className={`flex items-center gap-1 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <LanguageSwitcher />
              <button 
                onClick={handleLogout} 
                className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={t.logout}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6">

          {/* ══ PATIENTS TAB ══════════════════════════════════════════════════ */}
          {activeTab === 'patients' && (
            <div>
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard label={t.totalPatients} value={patients.length}
                  color="bg-blue-50 text-blue-600"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <StatCard label={t.todayAppointments} value={todayCount}
                  color="bg-teal-50 text-teal-600"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
                <StatCard label={t.pendingAppointments} value={scheduledCount}
                  color="bg-amber-50 text-amber-600"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
              </div>

              {/* Toolbar */}
              <div className={`flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <h2 className="text-lg font-bold text-gray-900">{t.patients}</h2>
                <div className={`flex gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="relative flex-1 sm:w-64">
                    <input type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className={`w-full px-4 py-2.5 ${isRTL ? 'pr-10 text-right' : 'pl-10'} rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                  </div>
                  <button onClick={() => { setSelectedPatient(null); setPatientDialogOpen(true) }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-blue-500/20 active:scale-95 hover:-translate-y-0.5 whitespace-nowrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {t.addPatient}
                  </button>
                </div>
              </div>

              {loadingPatients ? <Spinner /> : filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm">{t.noPatients}</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {[t.fullName, t.phone, t.gender, t.bloodType, t.createdAt, t.actions].map((col, i) => (
                            <th key={i} className={`px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredPatients.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-700 font-bold text-xs">{p.full_name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="font-medium text-gray-900">{p.full_name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-gray-600">{p.phone}</td>
                            <td className="px-5 py-3.5 text-gray-600">{p.gender ? (p.gender === 'male' ? t.male : t.female) : '—'}</td>
                            <td className="px-5 py-3.5">
                              {p.blood_type
                                ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">{p.blood_type}</span>
                                : '—'}
                            </td>
                            <td className="px-5 py-3.5 text-gray-500 text-xs">{fmtDate(p.created_at)}</td>
                            <td className="px-5 py-3.5">
                              <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <button onClick={() => { setSelectedPatient(p); setPatientDialogOpen(true) }}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors">{t.edit}</button>
                                <button onClick={() => deactivatePatient(p.id)}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors">{t.deactivate}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-2">
                    {filteredPatients.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-700 font-bold text-sm">{p.full_name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className={isRTL ? 'text-right' : ''}>
                              <p className="font-semibold text-gray-900 text-sm">{p.full_name}</p>
                              <p className="text-gray-400 text-xs">{p.phone}</p>
                            </div>
                          </div>
                          {p.blood_type && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">{p.blood_type}</span>}
                        </div>
                        <div className={`flex gap-2 mt-3 pt-3 border-t border-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="flex-1 text-xs text-gray-400 self-center">{fmtDate(p.created_at)}</span>
                          <button onClick={() => { setSelectedPatient(p); setPatientDialogOpen(true) }} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">{t.edit}</button>
                          <button onClick={() => deactivatePatient(p.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">{t.deactivate}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ APPOINTMENTS TAB ═══════════════════════════════════════════════ */}
          {activeTab === 'appointments' && (
            <div>
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-teal-600">{todayCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.todayAppointments}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-blue-600">{scheduledCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.statusScheduled}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.statusCompleted}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className={`flex flex-col gap-3 mb-4 ${isRTL ? 'items-end' : 'items-start'}`}>
                <div className={`flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <h2 className="text-lg font-bold text-gray-900">{t.appointments}</h2>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {(['all', 'today', 'scheduled'] as const).map(f => (
                      <button key={f} onClick={() => setApptFilter(f)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${apptFilter === f ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                        {f === 'today' ? t.todayAppointments : f === 'scheduled' ? t.statusScheduled : 'All'}
                      </button>
                    ))}
                    <button onClick={() => { setSelectedAppt(null); setApptDialogOpen(true) }}
                      className={`flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-teal-500/20 active:scale-95 hover:-translate-y-0.5 whitespace-nowrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {t.addAppointment}
                    </button>
                  </div>
                </div>
                {/* Search + Date Filter */}
                <div className={`flex flex-col sm:flex-row gap-2 w-full ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <div className="relative flex-1 sm:max-w-xs">
                    <input type="text" value={apptSearch} onChange={e => setApptSearch(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className={`w-full px-4 py-2.5 ${isRTL ? 'pr-10 text-right' : 'pl-10'} rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm`}
                    />
                    <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                  </div>
                  <input type="date" value={apptDateFilter} onChange={e => setApptDateFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm w-full sm:w-auto"
                  />
                  {(apptSearch || apptDateFilter) && (
                    <button onClick={() => { setApptSearch(''); setApptDateFilter('') }}
                      className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>

              {loadingAppts ? <Spinner /> : filteredAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{t.noAppointments}</p>
                  <button onClick={() => { setSelectedAppt(null); setApptDialogOpen(true) }}
                    className="text-teal-600 hover:text-teal-700 text-sm font-semibold transition-colors">
                    + {t.addAppointment}
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {[t.patientName, t.appointmentDate, t.appointmentTime, t.reason, t.status, t.actions].map((col, i) => (
                            <th key={i} className={`px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredAppts.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-gray-900">{a.patient_name}</td>
                            <td className="px-5 py-3.5 text-gray-600">{fmtDate(a.appointment_date)}</td>
                            <td className="px-5 py-3.5 text-gray-600">{fmtTime(a.appointment_time)}</td>
                            <td className="px-5 py-3.5 text-gray-500">{a.reason || '—'}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                {statusLabels[a.status] ?? a.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className={`flex gap-1.5 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <button onClick={() => { setSelectedAppt(a); setApptDialogOpen(true) }}
                                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition-colors">{t.edit}</button>
                                {a.status === 'scheduled' && (
                                  <>
                                    <button onClick={() => updateAppointmentStatus(a.id, 'completed')}
                                      className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors">✓ {t.statusCompleted}</button>
                                    <button onClick={() => updateAppointmentStatus(a.id, 'no_show')}
                                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors">{t.statusNoShow}</button>
                                    <button onClick={() => deleteAppointment(a.id)}
                                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors">{t.statusCancelled}</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-2">
                    {filteredAppts.map(a => (
                      <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="font-semibold text-gray-900 text-sm">{a.patient_name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{fmtDate(a.appointment_date)} · {fmtTime(a.appointment_time)}</p>
                            {a.reason && <p className="text-gray-400 text-xs mt-0.5">{a.reason}</p>}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {statusLabels[a.status] ?? a.status}
                          </span>
                        </div>
                        <div className={`flex gap-2 flex-wrap mt-3 pt-3 border-t border-gray-50 justify-end ${isRTL ? 'flex-row-reverse justify-start' : ''}`}>
                          <button onClick={() => { setSelectedAppt(a); setApptDialogOpen(true) }} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold">{t.edit}</button>
                          {a.status === 'scheduled' && (
                            <>
                              <button onClick={() => updateAppointmentStatus(a.id, 'completed')} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">✓</button>
                              <button onClick={() => updateAppointmentStatus(a.id, 'no_show')} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">{t.statusNoShow}</button>
                              <button onClick={() => deleteAppointment(a.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">{t.statusCancelled}</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ SETTINGS TAB (DOCTOR ONLY) ════════════════════════════════════ */}
          {activeTab === 'settings' && authUser.role === 'doctor' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className={`text-lg font-bold text-gray-900 ${isRTL ? 'text-right' : ''}`}>{t.settings}</h2>

              {/* Clinic Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className={`font-bold text-gray-800 mb-5 ${isRTL ? 'text-right' : ''}`}>{t.clinicInfo}</h3>
                {clinicError && <div className={`px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>{clinicError}</div>}
                {clinicSuccess && <div className={`px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>✓ {t.saveChanges}</div>}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lc}>{t.clinicName} *</label><input type="text" value={clinicForm.name} onChange={e => { setClinicForm({...clinicForm, name: e.target.value}); setClinicSuccess(false) }} className={ic} /></div>
                    <div><label className={lc}>{t.specialty}</label><input type="text" value={clinicForm.specialty} onChange={e => { setClinicForm({...clinicForm, specialty: e.target.value}); setClinicSuccess(false) }} className={ic} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lc}>{t.clinicPhone}</label><input type="tel" value={clinicForm.phone} onChange={e => { setClinicForm({...clinicForm, phone: e.target.value}); setClinicSuccess(false) }} className={ic} /></div>
                    <div><label className={lc}>{t.clinicEmail}</label><input type="email" value={clinicForm.email} onChange={e => { setClinicForm({...clinicForm, email: e.target.value}); setClinicSuccess(false) }} className={ic} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lc}>{t.city}</label><input type="text" value={clinicForm.city} onChange={e => { setClinicForm({...clinicForm, city: e.target.value}); setClinicSuccess(false) }} className={ic} /></div>
                    <div><label className={lc}>{t.clinicAddress}</label><input type="text" value={clinicForm.address} onChange={e => { setClinicForm({...clinicForm, address: e.target.value}); setClinicSuccess(false) }} className={ic} /></div>
                  </div>
                  <button onClick={saveClinic} disabled={clinicLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 hover:-translate-y-0.5 shadow-sm shadow-blue-500/20">
                    {clinicLoading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t.saving}</> : t.saveChanges}
                  </button>
                </div>
              </div>

              {/* Secretaries */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className={`font-bold text-gray-800 mb-5 ${isRTL ? 'text-right' : ''}`}>{t.secretaries}</h3>

                {secretaries.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {secretaries.map(s => (
                      <div key={s.id} className={`flex items-center justify-between p-3.5 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-700 font-bold text-xs">{s.full_name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="font-semibold text-gray-900 text-sm">{s.full_name}</p>
                            <p className="text-gray-400 text-xs">@{s.username}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {s.is_active ? t.active : t.inactive}
                          </span>
                          {s.is_active && (
                            <button onClick={() => deactivateSecretary(s.id)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold transition-colors">{t.deactivate}</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-5">
                  <h4 className={`font-semibold text-gray-700 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>{t.addSecretary}</h4>
                  {secError && <div className={`px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>{secError}</div>}
                  {secSuccess && <div className={`px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>✓ {t.addSecretary}</div>}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className={lc}>{t.secretaryName} *</label><input type="text" value={secForm.full_name} onChange={e => { setSecForm({...secForm, full_name: e.target.value}); setSecError(''); setSecSuccess(false) }} className={ic} /></div>
                      <div><label className={lc}>{t.secretaryUsername} *</label><input type="text" value={secForm.username} onChange={e => { setSecForm({...secForm, username: e.target.value}); setSecError(''); setSecSuccess(false) }} className={ic} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className={lc}>{t.email}</label><input type="email" value={secForm.email} onChange={e => setSecForm({...secForm, email: e.target.value})} className={ic} /></div>
                      <div><label className={lc}>{t.secretaryPhone}</label><input type="tel" value={secForm.phone} onChange={e => setSecForm({...secForm, phone: e.target.value})} className={ic} /></div>
                    </div>
                    <div><label className={lc}>{t.secretaryPassword} *</label><input type="password" value={secForm.password} onChange={e => { setSecForm({...secForm, password: e.target.value}); setSecError(''); setSecSuccess(false) }} className={ic} placeholder="••••••••" /></div>
                    <button onClick={addSecretary} disabled={secLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 hover:-translate-y-0.5 shadow-sm shadow-blue-500/20">
                      {secLoading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t.saving}</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>{t.addSecretary}</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secretary sees no Settings tab — show nothing */}
          {activeTab === 'settings' && authUser.role === 'secretary' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className="text-gray-400 text-sm">Access restricted</p>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      {patientDialogOpen && authUser && (
        <PatientDialog
          patient={selectedPatient}
          authUser={authUser}
          onClose={() => { setPatientDialogOpen(false); setSelectedPatient(null) }}
          onSave={() => { setPatientDialogOpen(false); setSelectedPatient(null); loadPatients() }}
        />
      )}

      {apptDialogOpen && authUser && (
        <AppointmentDialog
          appointment={selectedAppt}
          patients={patients}
          authUser={authUser}
          onClose={() => { setApptDialogOpen(false); setSelectedAppt(null) }}
          onSave={() => { setApptDialogOpen(false); setSelectedAppt(null); loadAppointments() }}
        />
      )}
    </div>
  )
}
