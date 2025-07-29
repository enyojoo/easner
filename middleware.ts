import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the route is protected
  const isUserRoute = req.nextUrl.pathname.startsWith("/user")
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isAdminLoginRoute = req.nextUrl.pathname === "/admin/login"
  const isLoginRoute = req.nextUrl.pathname === "/login"

  // If accessing admin routes
  if (isAdminRoute && !isAdminLoginRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    // Check if user is admin
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("id", session.user.id).single()

    if (!adminUser) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  // If accessing user routes
  if (isUserRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check if user exists in users table
    const { data: user } = await supabase.from("users").select("id").eq("id", session.user.id).single()

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Redirect authenticated users away from login pages
  if (session && (isLoginRoute || isAdminLoginRoute)) {
    // Check if user is admin
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("id", session.user.id).single()

    if (adminUser && isLoginRoute) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    } else if (!adminUser && isAdminLoginRoute) {
      return NextResponse.redirect(new URL("/user/dashboard", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/login", "/admin/login"],
}
