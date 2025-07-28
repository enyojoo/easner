import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for a protected user route
  if (pathname.startsWith("/user")) {
    // Get the Supabase session token from cookies
    const supabaseAuthToken = request.cookies.get("sb-access-token")?.value
    const supabaseRefreshToken = request.cookies.get("sb-refresh-token")?.value

    // If no tokens exist, redirect to login
    if (!supabaseAuthToken && !supabaseRefreshToken) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // If we have tokens, continue to the requested page
    return NextResponse.next()
  }

  // Check if the request is for a protected admin route
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Get the admin auth token from cookies
    const adminAuthToken = request.cookies.get("admin-auth-token")?.value

    // If no token exists, redirect to admin login
    if (!adminAuthToken) {
      const adminLoginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(adminLoginUrl)
    }

    // If we have admin token, continue to the requested page
    return NextResponse.next()
  }

  // For all other routes, continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
