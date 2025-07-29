import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth tokens
  const userToken = request.cookies.get("auth-token")?.value
  const adminToken = request.cookies.get("admin-auth-token")?.value

  // Protected user routes
  if (pathname.startsWith("/user")) {
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protected admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
}
