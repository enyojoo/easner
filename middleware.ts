import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to debug auth issues
  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/user/:path*"],
}
