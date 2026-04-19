'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'
import { AuthUser } from '@/types'
import Logo from '@/components/Logo'

type Tab = 'patients' | 'appointments' | 'settings'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const PatientsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t, isRTL } = useT()
  const router = useRouter()
  const [user] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('clinic_user')
    if (!stored) return null
    try { return JSON.parse(stored) as AuthUser }
    catch { return null }
  })


  const handleLogout = () => {
    localStorage.removeItem('clinic_user')
    router.push('/login')
  }

  const navItems = [
    { id: 'patients' as Tab, label: t.patients, icon: <PatientsIcon /> },
    { id: 'appointments' as Tab, label: t.appointments, icon: <CalendarIcon /> },
    ...(user?.role === 'doctor'
      ? [{ id: 'settings' as Tab, label: t.settings, icon: <SettingsIcon /> }]
      : []),
  ]

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = activeTab === item.id
    return (
      <button
        onClick={() => onTabChange(item.id)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
          ${isRTL ? 'flex-row-reverse' : ''}
          ${isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
      >
        <span className={isActive ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col w-60 min-h-screen bg-white border-gray-100 shadow-sm fixed top-0 z-20 ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        }`}
      >
        {/* Brand */}
        <div className={`flex items-center gap-2.5 px-5 py-5 border-b border-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Logo className="w-8 h-8 flex-shrink-0" />
          <div className={isRTL ? 'text-right' : ''}>
            <p className="font-bold text-gray-900 text-sm leading-none">{t.appName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.appTagline}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => <NavItem key={item.id} item={item} />)}
        </nav>

        {/* User info + Logout */}
        <div className="px-3 py-4 border-t border-gray-50 space-y-2">
          {user && (
            <div className={`flex items-center gap-2.5 px-2 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`min-w-0 ${isRTL ? 'text-right' : ''}`}>
                <p className="text-xs font-semibold text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <LogoutIcon />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex items-center justify-around py-1 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[56px] transition-all ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-red-400 hover:text-red-600 transition-colors"
          >
            <LogoutIcon />
            <span className="text-xs font-medium">{t.logout}</span>
          </button>
        </div>
      </nav>
    </>
  )
}
