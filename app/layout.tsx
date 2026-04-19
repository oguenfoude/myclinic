import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'MyClinic — Modern Clinic Management',
    template: '%s | MyClinic',
  },
  description: 'نظام متكامل لإدارة العيادات: تسجيل المرضى، جدولة المواعيد، وإدارة السجلات الطبية. The complete system for clinic management, appointments, and patient records.',
  keywords: ['clinic', 'management', 'medical', 'software', 'عيادة', 'طبيب', 'patients', 'Algeria'],
  authors: [{ name: 'MyClinic' }],
  creator: 'MyClinic',
  publisher: 'MyClinic',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'MyClinic',
    title: 'MyClinic — Clinic Management System',
    description: 'A professional and secure platform for managing your clinic, patients, and digital records.',
    locale: 'ar_DZ',
    alternateLocale: ['fr_FR', 'en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyClinic — Clinic Management System',
    description: 'A professional and secure platform for managing your clinic, patients, and digital records.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-full antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
