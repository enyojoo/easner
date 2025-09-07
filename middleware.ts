import type { NextRequest } from "next/server"

export function middleware(_request: NextRequest) {
  // Security headers are best set at the route level or via config headers,
  // but we can keep this file for future use if needed.
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

