import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16: Middleware is still supported but consider using route handlers for specific use cases
// This middleware sets cache headers for dynamic routes
export function middleware(request: NextRequest) {
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
    // Match all routes except static assets and images (handled by next.config.mjs)
    '/api/:path*',
    '/auth/:path*',
    '/user/:path*',
    '/admin/:path*',
  ],
}
