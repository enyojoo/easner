import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const APP_ORIGIN = "https://app.easner.com"

/**
 * Legacy mobile deep links used easner.com/user/* before app.easner.com.
 * Forward to the consumer app host (Expo web + verified App Links).
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === "/user" || pathname.startsWith("/user/")) {
    return NextResponse.redirect(`${APP_ORIGIN}${pathname}${search}`, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/user", "/user/:path*"],
}
