import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'MyClinic — نظام إدارة العيادات',
    template: '%s | MyClinic',
  },
  description:
    'نظام متكامل لإدارة العيادات: تسجيل المرضى، جدولة المواعيد، وإدارة السجلات الطبية. Système de gestion de clinique. Clinic Management System.',
  keywords: ['clinic', 'عيادة', 'patients', 'medical', 'appointments', 'مواعيد', 'Algeria', 'الجزائر'],
  authors: [{ name: 'MyClinic' }],
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    title: 'MyClinic — نظام إدارة العيادات',
    description: 'نظام متكامل لإدارة العيادات والمرضى والمواعيد',
    locale: 'ar_DZ',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-full antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
