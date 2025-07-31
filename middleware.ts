import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected user routes
  if (req.nextUrl.pathname.startsWith("/user")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Protected admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/admin/login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
}
