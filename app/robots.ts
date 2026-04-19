import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myclinic.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // Protect internal dashboard areas from SEO crawlers
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
