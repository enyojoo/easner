import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown"
  }
  return request.headers.get("x-real-ip") ?? "unknown"
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set business owner IP when they visit the invoices section
  if (request.nextUrl.pathname.startsWith("/invoices")) {
    const ip = getClientIp(request)
    response.cookies.set("easner_business_owner_ip", ip, {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: ["/invoices/:path*"],
}
