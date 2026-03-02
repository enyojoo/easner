import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// App root redirect: app.easner.com/ -> /auth/user/login
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/user/login', request.url))
  }

  const response = NextResponse.next()

  // Set cache headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set cache headers for auth pages
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set cache headers for user/admin pages
  if (request.nextUrl.pathname.startsWith('/user/') || request.nextUrl.pathname.startsWith('/admin/')) {
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
    '/admin/:path*',
  ],
}
