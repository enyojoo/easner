import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth tokens from cookies
  const accessToken =
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("supabase-auth-token")?.value ||
    request.cookies.get("sb-localhost-auth-token")?.value

  const refreshToken =
    request.cookies.get("sb-refresh-token")?.value ||
    request.cookies.get("supabase-refresh-token")?.value ||
    request.cookies.get("sb-localhost-refresh-token")?.value

  const hasValidSession = !!(accessToken && refreshToken)

  console.log("Middleware check:", {
    pathname,
    hasValidSession,
    accessToken: !!accessToken,
    refreshToken: !!refreshToken,
  })

  // If user has session and tries to access login, redirect to dashboard
  if (hasValidSession && pathname === "/login") {
    console.log("Redirecting logged in user from login to dashboard")
    return NextResponse.redirect(new URL("/user/dashboard", request.url))
  }

  // If user has no session and tries to access user pages, redirect to login
  if (!hasValidSession && pathname.startsWith("/user/")) {
    console.log("Redirecting unauthenticated user to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/user/:path*"],
}
