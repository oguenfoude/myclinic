// Next.js 16 — "proxy.ts" replaces the deprecated "middleware.ts".
// The exported function must be named "proxy" (not "middleware").
// This runs on every matched request before rendering.
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata)
     * - image extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
