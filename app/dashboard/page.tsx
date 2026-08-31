'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/i18n'
import { AuthUser, Patient, User } from '@/types'
import Sidebar from '@/components/Sidebar'
import PatientDialog from '@/components/PatientDialog'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LoadingScreen from '@/components/LoadingScreen'

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-primary-100 shadow-sm shadow-primary/5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  )
}

function PieSegment({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
    </div>
  )
}

type Tab = 'patients' | 'analytics' | 'settings'

export default function DashboardPage() {
  const { t, isRTL } = useT()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('patients')

  const [patients, setPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)


  const [clinicForm, setClinicForm] = useState({ name: '', specialty: '', city: '', phone: '', email: '', address: '' })
  const [clinicLoading, setClinicLoading] = useState(false)
  const [clinicSuccess, setClinicSuccess] = useState(false)
  const [clinicError, setClinicError] = useState('')
  const [secretaries, setSecretaries] = useState<User[]>([])
  const [secForm, setSecForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '' })
  const [secLoading, setSecLoading] = useState(false)
  const [secError, setSecError] = useState('')
  const [secSuccess, setSecSuccess] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true)
      const stored = localStorage.getItem('clinic_user')
      if (stored) {
        try {
          const u = JSON.parse(stored) as AuthUser
          setAuthUser(u)
        } catch {
          localStorage.removeItem('clinic_user')
          router.replace('/login')
        }
      } else {
        router.replace('/login')
      }
    })
  }, [router])

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [isRTL])

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

  const loadClinic = useCallback(async () => {
    if (!authUser) return
    const { data } = await supabase.from('clinics').select('*').eq('id', authUser.clinic_id).single()
    if (data) {
      setClinicForm({ name: data.name ?? '', specialty: data.specialty ?? '', city: data.city ?? '', phone: data.phone ?? '', email: data.email ?? '', address: data.address ?? '' })
    }
  }, [authUser])

  const loadSecretaries = useCallback(async () => {
    if (!authUser) return
    const { data } = await supabase.rpc('list_secretaries', { p_clinic_id: authUser.clinic_id })
    if (data) setSecretaries(data as User[])
  }, [authUser])

  useEffect(() => {
    if (!authUser) return
    startTransition(() => { loadPatients() })
  }, [authUser, loadPatients])

  useEffect(() => {
    if (!authUser || activeTab !== 'settings' || authUser.role !== 'doctor') return
    startTransition(() => { loadClinic(); loadSecretaries() })
  }, [authUser, activeTab, loadClinic, loadSecretaries])

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = (() => {
    const d = new Date(now); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d.toISOString()
  })()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const todayCount = patients.filter(p => p.created_at >= startOfDay).length
  const maleCount = patients.filter(p => p.gender === 'male').length
  const femaleCount = patients.filter(p => p.gender === 'female').length

  const sumPrice = (list: Patient[]) => list.reduce((acc, p) => acc + (Number(p.price) || 0), 0)
  const todayPrice = sumPrice(patients.filter(p => p.created_at >= startOfDay))
  const weekPrice = sumPrice(patients.filter(p => p.created_at >= startOfWeek))
  const monthPrice = sumPrice(patients.filter(p => p.created_at >= startOfMonth))
  const totalPrice = sumPrice(patients)

  const fmtMoney = (n: number) => n.toLocaleString('en-US')
  const recentPatients = patients.slice(0, 5)

  const filteredPatients = patients.filter(p => {
    const q = patientSearch.toLowerCase()
    const matchesText = p.full_name.toLowerCase().includes(q) || p.phone.includes(q)
    if (!matchesText) return false
    if (dateFilter === 'today') return p.created_at >= startOfDay
    if (dateFilter === 'week') return p.created_at >= startOfWeek
    if (dateFilter === 'month') return p.created_at >= startOfMonth
    if (dateFilter === 'custom') {
      if (dateFrom && p.created_at < new Date(dateFrom).toISOString()) return false
      if (dateTo) {
        const endDate = new Date(dateTo); endDate.setDate(endDate.getDate() + 1)
        if (p.created_at >= endDate.toISOString()) return false
      }
      return true
    }
    return true
  })

  const handlePresetFilter = (preset: 'all' | 'today' | 'week' | 'month') => {
    setDateFilter(preset); setDateFrom(''); setDateTo('')
  }

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from); setDateTo(to)
    if (from || to) setDateFilter('custom'); else setDateFilter('all')
  }

  const deactivatePatient = async (id: string) => {
    await supabase.from('patients').update({ is_active: false }).eq('id', id)
    setPatients(prev => prev.filter(p => p.id !== id))
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
    const { data, error } = await supabase.rpc('add_secretary', {
      p_clinic_id: authUser.clinic_id,
      p_full_name: secForm.full_name.trim(),
      p_username: secForm.username.trim().toLowerCase(),
      p_password: secForm.password,
    })
    if (error || !data?.ok) { setSecError(data?.message === 'username_taken' ? t.errorUserExists : t.errorGeneric) }
    else { setSecSuccess(true); setSecForm({ full_name: '', username: '', email: '', phone: '', password: '' }); loadSecretaries() }
    setSecLoading(false)
  }

  const deactivateSecretary = async (id: string) => {
    await supabase.rpc('deactivate_secretary', { p_user_id: id })
    setSecretaries(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s))
  }

  const handleLogout = () => {
    localStorage.removeItem('clinic_user')
    router.replace('/login')
  }

  if (!isMounted || !authUser) return <LoadingScreen />

  const ic = `w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-primary-light/40 focus:bg-white text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm ${isRTL ? 'text-right' : ''}`
  const lc = `block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className={`min-h-screen ${isRTL ? 'md:mr-60' : 'md:ml-60'} pb-20 md:pb-0 flex flex-col`}>
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-primary-100 shadow-sm shadow-primary/5">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-accent to-primary-200" />
          <div className={`flex items-center justify-between h-14 px-4 sm:px-6`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-bold text-gray-900">{t.welcome}, <span className="text-primary">{authUser.full_name}</span></p>
              <p className="text-xs text-gray-500 capitalize">{authUser.role}</p>
            </div>
            <div className={`flex items-center gap-1 sm:gap-2`}>
              <LanguageSwitcher />
              <button onClick={handleLogout} className="md:hidden p-2 text-danger hover:bg-danger-light rounded-lg transition-colors" title={t.logout}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6">

          {/* ══ PATIENTS TAB ═══ */}
          {activeTab === 'patients' && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label={t.priceToday} value={fmtMoney(todayPrice)} color="bg-primary/10 text-primary"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard label={t.priceThisWeek} value={fmtMoney(weekPrice)} color="bg-primary-100 text-primary-dark"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
                <StatCard label={t.priceThisMonth} value={fmtMoney(monthPrice)} color="bg-primary-200/50 text-primary-dark"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                />
                <StatCard label={t.totalPrice} value={fmtMoney(totalPrice)} color="bg-accent/10 text-accent"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
              </div>

              <div className="space-y-3 mb-4">
                <div className={`flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between`}>
                  <h2 className="text-lg font-bold text-gray-900">{t.patients}</h2>
                  <div className={`flex gap-2 w-full sm:w-auto`}>
                    <div className="relative flex-1 sm:w-64">
                      <input type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder={t.searchPlaceholder}
                        className={`w-full px-4 py-2.5 ${isRTL ? 'pr-10 text-right' : 'pl-10'} rounded-xl border border-primary-200 bg-primary-light/40 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white hover:border-primary-300 transition-all`} />
                      <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </span>
                    </div>
                    <button onClick={() => { setSelectedPatient(null); setPatientDialogOpen(true) }}
                      className={`flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-primary active:scale-95 whitespace-nowrap`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {t.addPatient}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`flex items-center justify-between flex-wrap gap-2`}>
                    <div className={`flex items-center gap-1 bg-primary-light p-1 rounded-xl border border-primary-100`}>
                      {([
                        { key: 'all' as const, label: t.filterAll },
                        { key: 'today' as const, label: t.filterToday },
                        { key: 'week' as const, label: t.filterThisWeek },
                        { key: 'month' as const, label: t.filterThisMonth },
                      ]).map(f => (
                        <button key={f.key} onClick={() => handlePresetFilter(f.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === f.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary-dark'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{filteredPatients.length} {t.resultCount}</span>
                  </div>
                  <div className={`flex items-center gap-2 flex-wrap`}>
                    <div className={`flex items-center gap-1.5`}>
                      <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">{t.dateFrom}</span>
                      <input type="date" value={dateFrom} onChange={e => handleDateChange(e.target.value, dateTo)}
                        className={`px-3 py-1.5 rounded-lg border border-primary-200 bg-primary-light/40 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${dateFilter === 'custom' && dateFrom ? 'border-primary bg-primary/5' : ''}`} />
                    </div>
                    <div className={`flex items-center gap-1.5`}>
                      <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">{t.dateTo}</span>
                      <input type="date" value={dateTo} onChange={e => handleDateChange(dateFrom, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg border border-primary-200 bg-primary-light/40 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${dateFilter === 'custom' && dateTo ? 'border-primary bg-primary/5' : ''}`} />
                    </div>
                    {(dateFrom || dateTo) && (
                      <button onClick={() => handlePresetFilter('all')} className="px-2.5 py-1.5 text-xs font-bold text-danger hover:text-danger-hover hover:bg-danger-light rounded-lg transition-colors">
                        ✕ {t.clearFilter}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loadingPatients ? (
                <div className="rounded-2xl border border-primary-100 overflow-hidden bg-white">
                  <div className="hidden lg:grid grid-cols-7 gap-4 px-5 py-3.5 bg-primary-light border-b border-primary-100">
                    {[...Array(7)].map((_, i) => <div key={i} className="h-2.5 bg-primary/15 rounded animate-pulse" />)}
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-9 h-9 rounded-full bg-primary/10 animate-pulse flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-3 w-28 bg-skeleton-light rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse hidden sm:block" />
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse hidden lg:block" />
                      <div className="h-3 w-12 bg-gray-100 rounded animate-pulse hidden md:block" />
                    </div>
                  ))}
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-primary-100 border-dashed bg-gradient-to-br from-primary-light/60 via-white to-accent/5 shadow-inner overflow-hidden relative">
                  <div className="absolute top-[-30%] right-[-10%] w-52 h-52 bg-primary-200/40 rounded-full blur-3xl" />
                  <div className="absolute bottom-[-30%] left-[-10%] w-52 h-52 bg-accent-200/40 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-primary-dark font-semibold text-sm">{t.noPatients}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="hidden lg:block rounded-2xl border border-primary-100 overflow-hidden bg-white shadow-sm shadow-primary/5">
                    <table className="w-full text-sm">
                      <thead className="bg-primary-light border-b border-primary-100">
                        <tr>
                          {[t.fullName, t.phone, t.medicalStudies, t.price, t.gender, t.createdAt, t.actions].map((col, i) => (
                            <th key={i} className={`px-5 py-3.5 font-semibold text-primary-dark text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredPatients.map(p => (
                          <tr key={p.id} className="hover:bg-surface transition-colors group">
                            <td className={`px-5 py-3.5 ${isRTL ? 'text-right' : ''}`}>
                              <div className={`flex items-center gap-3`}>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                                  <span className="text-white font-bold text-xs">{p.full_name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className={isRTL ? 'text-right' : ''}>
                                  <span className="font-semibold text-gray-900 block">{p.full_name}</span>
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary mt-0.5">{fmtMoney(Number(p.price) || 0)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{p.phone}</td>
                            <td className="px-5 py-3.5 max-w-[280px]">
                              {p.medical_studies ? <span className="text-gray-700 text-xs leading-relaxed line-clamp-2">{p.medical_studies}</span> : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-primary-dark text-xs">{fmtMoney(Number(p.price) || 0)}</td>
                            <td className="px-5 py-3.5 text-gray-500 text-xs">{p.gender ? (p.gender === 'male' ? t.male : t.female) : '—'}</td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{fmtDate(p.created_at)}</td>
                            <td className="px-5 py-3.5">
                              <div className={`flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity`}>
                                <button onClick={() => { setSelectedPatient(p); setPatientDialogOpen(true) }} className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-colors">{t.edit}</button>
                                <button onClick={() => deactivatePatient(p.id)} className="px-3 py-1.5 bg-danger-light hover:bg-danger-100 text-danger rounded-lg text-xs font-semibold transition-colors">{t.deactivate}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="lg:hidden space-y-2">
                    {filteredPatients.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-primary-100 p-4 shadow-sm shadow-primary/5 hover:shadow-md transition-shadow">
                        <div className={`flex items-start justify-between`}>
                          <div className={`flex items-center gap-3`}>
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white font-bold text-sm">{p.full_name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className={isRTL ? 'text-right' : ''}>
                              <p className="font-bold text-gray-900 text-sm">{p.full_name}</p>
                              <p className="text-gray-400 text-xs font-mono">{p.phone}</p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary border border-primary-100">{fmtMoney(Number(p.price) || 0)}</span>
                                {p.gender && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-light text-primary border border-primary-100">{p.gender === 'male' ? t.male : t.female}</span>}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap mt-1">{fmtDate(p.created_at)}</span>
                        </div>
                        {p.medical_studies && (
                          <div className={`mt-3 p-3 bg-primary-light/40 rounded-xl text-xs text-gray-600 leading-relaxed border border-primary-100 ${isRTL ? 'text-right' : ''}`}>
                            <div className={`flex items-center gap-1.5 mb-1`}>
                              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                              <span className="font-bold text-primary uppercase tracking-wider text-[10px]">{t.medicalStudies}</span>
                            </div>
                            {p.medical_studies}
                          </div>
                        )}
                        <div className={`flex gap-2 mt-3 pt-3 border-t border-gray-50`}>
                          <button onClick={() => { setSelectedPatient(p); setPatientDialogOpen(true) }} className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-colors">{t.edit}</button>
                          <button onClick={() => deactivatePatient(p.id)} className="flex-1 px-3 py-2 bg-danger-light hover:bg-danger-100 text-danger rounded-xl text-xs font-bold transition-colors">{t.deactivate}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ ANALYTICS TAB ═══ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-bold text-gray-900 ${isRTL ? 'text-right' : ''}`}>{t.analyticsTitle}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label={t.totalPatients} value={patients.length} color="bg-primary/10 text-primary"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <StatCard label={t.newToday} value={todayCount} color="bg-primary-100 text-primary-dark"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard label={t.malePatients} value={maleCount} color="bg-primary-200/50 text-primary-dark"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                />
                <StatCard label={t.femalePatients} value={femaleCount} color="bg-accent/10 text-accent"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                />
              </div>

              {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-accent-100 border-dashed bg-gradient-to-br from-accent/5 via-white to-stat-month-50/50 shadow-inner overflow-hidden relative">
                  <div className="absolute top-[-30%] left-[-10%] w-64 h-64 bg-accent-200/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-[-30%] right-[-10%] w-64 h-64 bg-stat-month-600/20 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-stat-month-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent/30 mx-auto">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <p className="text-accent-dark font-semibold text-sm text-center">{t.noData}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-primary-100 shadow-sm shadow-primary/5 p-6">
                    <h3 className={`font-bold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>{t.patientsByGender}</h3>
                    <div className="space-y-3">
                      <PieSegment label={t.malePatients} value={maleCount} total={patients.length} color="bg-primary" />
                      <PieSegment label={t.femalePatients} value={femaleCount} total={patients.length} color="bg-accent" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-primary-100 shadow-sm shadow-primary/5 p-6">
                    <h3 className={`font-bold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>{t.recentActivity}</h3>
                    <div className="space-y-3">
                      {recentPatients.map(p => (
                        <div key={p.id} className={`flex items-center gap-3`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">{p.full_name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : ''}`}>
                            <p className="text-sm font-semibold text-gray-900 truncate">{p.full_name}</p>
                            <p className="text-[10px] text-gray-400">{fmtDate(p.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SETTINGS TAB ═══ */}
          {activeTab === 'settings' && authUser.role === 'doctor' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className={`text-lg font-bold text-gray-900 ${isRTL ? 'text-right' : ''}`}>{t.settings}</h2>

              <div className="bg-white rounded-2xl border border-primary-100 shadow-sm shadow-primary/5 p-6">
                <h3 className={`font-bold text-gray-900 mb-5 ${isRTL ? 'text-right' : ''}`}>{t.clinicInfo}</h3>
                {clinicError && <div className={`px-4 py-3 bg-danger-light border border-danger-200 rounded-xl text-danger text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>{clinicError}</div>}
                {clinicSuccess && <div className={`px-4 py-3 bg-success-light border border-success-200 rounded-xl text-success text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>✓ {t.saveChanges}</div>}
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 shadow-primary">
                    {clinicLoading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t.saving}</> : t.saveChanges}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-primary-100 shadow-sm shadow-primary/5 p-6">
                <h3 className={`font-bold text-gray-900 mb-5 ${isRTL ? 'text-right' : ''}`}>{t.secretaries}</h3>
                {secretaries.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {secretaries.map(s => (
                      <div key={s.id} className={`flex items-center justify-between p-3.5 bg-primary-light/40 border border-primary-100 rounded-xl`}>
                        <div className={`flex items-center gap-3`}>
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-accent font-bold text-xs">{s.full_name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="font-semibold text-gray-900 text-sm">{s.full_name}</p>
                            <p className="text-gray-400 text-xs">@{s.username}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2`}>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active ? 'bg-success-light text-success' : 'bg-gray-100 text-gray-400'}`}>
                            {s.is_active ? t.active : t.inactive}
                          </span>
                          {s.is_active && (
                            <button onClick={() => deactivateSecretary(s.id)}
                              className="px-2.5 py-1 bg-danger-light hover:bg-danger-100 text-danger rounded-lg text-xs font-semibold transition-colors">{t.deactivate}</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className={`font-semibold text-gray-700 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>{t.addSecretary}</h4>
                  {secError && <div className={`px-4 py-3 bg-danger-light border border-danger-200 rounded-xl text-danger text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>{secError}</div>}
                  {secSuccess && <div className={`px-4 py-3 bg-success-light border border-success-200 rounded-xl text-success text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>✓ {t.addSecretary}</div>}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className={lc}>{t.secretaryName} *</label><input type="text" value={secForm.full_name} onChange={e => { setSecForm({...secForm, full_name: e.target.value}); setSecError(''); setSecSuccess(false) }} className={ic} /></div>
                      <div><label className={lc}>{t.secretaryUsername} *</label><input type="text" value={secForm.username} onChange={e => { setSecForm({...secForm, username: e.target.value}); setSecError(''); setSecSuccess(false) }} className={ic} /></div>
                    </div>
                    <div><label className={lc}>{t.secretaryPassword} *</label><input type="password" value={secForm.password} onChange={e => { setSecForm({...secForm, password: e.target.value}); setSecError(''); setSecSuccess(false) }} className={ic} placeholder="••••••••" /></div>
                    <button onClick={addSecretary} disabled={secLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 shadow-primary">
                      {secLoading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t.saving}</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>{t.addSecretary}</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && authUser.role !== 'doctor' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-primary-light border border-primary-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className="text-gray-500 text-sm">{t.accessRestricted}</p>
            </div>
          )}
        </main>
      </div>

      {patientDialogOpen && authUser && (
        <PatientDialog
          patient={selectedPatient}
          authUser={authUser}
          onClose={() => { setPatientDialogOpen(false); setSelectedPatient(null) }}
          onSave={() => { setPatientDialogOpen(false); setSelectedPatient(null); loadPatients() }}
        />
      )}
    </div>
  )
}
