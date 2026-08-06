import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { resolveAppPathResponse } from "@/lib/short-link-redirect"

/** Smart download routing for /app. */
export function middleware(request: NextRequest) {
  const appPathResponse = resolveAppPathResponse(request)
  if (appPathResponse) return appPathResponse

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
