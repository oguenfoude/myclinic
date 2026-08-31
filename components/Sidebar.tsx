'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'
import { AuthUser } from '@/types'
import Logo from '@/components/Logo'

type Tab = 'patients' | 'analytics' | 'settings'

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

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
    { id: 'analytics' as Tab, label: t.analytics, icon: <AnalyticsIcon /> },
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
         
          ${isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 hover:text-primary-dark hover:bg-primary-light'
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
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col w-60 min-h-screen bg-white border-primary-100 shadow-sm fixed top-0 z-20 ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        }`}
      >
        <div className={`flex items-center gap-2.5 px-5 py-5 border-b border-primary-100`}>
          <Logo className="w-8 h-8 flex-shrink-0" />
          <div className={isRTL ? 'text-right' : ''}>
            <p className="font-bold text-gray-900 text-sm leading-none">{t.appName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.appTagline}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => <NavItem key={item.id} item={item} />)}
        </nav>

        <div className="px-3 py-4 border-t border-primary-100 space-y-2">
          {user && (
            <div className={`flex items-center gap-2.5 px-2 py-2`}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xs">
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
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger-light transition-colors`}
          >
            <LogoutIcon />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-primary-100 shadow-lg">
        <div className="flex items-center justify-around py-1 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[56px] transition-all ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-danger hover:text-danger-hover transition-colors"
          >
            <LogoutIcon />
            <span className="text-xs font-medium">{t.logout}</span>
          </button>
        </div>
      </nav>
    </>
  )
}
