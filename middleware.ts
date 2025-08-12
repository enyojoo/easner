import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip middleware entirely - let client-side handle redirects
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
