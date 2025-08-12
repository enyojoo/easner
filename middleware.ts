import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl

    console.log("Middleware:", { pathname, hasSession: !!session })

    // If user is logged in and tries to access login page, redirect to dashboard
    if (session && pathname === "/login") {
      console.log("Redirecting authenticated user from login to dashboard")
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }

    // If user is not logged in and tries to access protected user pages, redirect to login
    if (!session && pathname.startsWith("/user/")) {
      console.log("Redirecting unauthenticated user to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, protect user routes but allow login
    if (request.nextUrl.pathname.startsWith("/user/")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return res
  }
}

export const config = {
  matcher: ["/login", "/user/:path*"],
}
