import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOfficeCorsHeaders } from '@/lib/cors'

// App root redirect: app.easner.com/ -> /auth/user/login
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // CORS for office app (admin API routes)
  const isAdminApi = pathname.startsWith('/api/admin/') || pathname.startsWith('/api/auth/admin/')
  if (isAdminApi) {
    const corsHeaders = getOfficeCorsHeaders(request)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders })
    }
    const response = NextResponse.next()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/user/login', request.url))
  }

  const response = NextResponse.next()

  // Set cache headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set cache headers for auth pages
  if (pathname.startsWith('/auth/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set cache headers for user pages
  if (pathname.startsWith('/user/')) {
    response.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
    '/auth/:path*',
    '/user/:path*',
  ],
}
