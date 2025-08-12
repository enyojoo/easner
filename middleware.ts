import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the session token from cookies
  const sessionCookie = request.cookies.get("sb-access-token") || request.cookies.get("supabase-auth-token")
  const hasSession = !!sessionCookie?.value

  // If user is logged in and tries to access login page, redirect to dashboard
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url))
  }

  // If user is not logged in and tries to access protected user pages, redirect to login
  if (!hasSession && pathname.startsWith("/user/")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/user/:path*"],
}
