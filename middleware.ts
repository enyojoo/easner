import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Set cache headers for images
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
