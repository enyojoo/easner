import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Protected user routes
  const userRoutes = [
    "/user/dashboard",
    "/user/send",
    "/user/transactions",
    "/user/recipients",
    "/user/profile",
    "/user/support",
  ]

  // Protected admin routes
  const adminRoutes = ["/admin/dashboard", "/admin/transactions", "/admin/users", "/admin/rates", "/admin/settings"]

  // Check if current path is a protected user route
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route))

  // Check if current path is a protected admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // If accessing protected routes without session, redirect to login
  if (!session && (isUserRoute || isAdminRoute)) {
    const loginUrl = isAdminRoute ? "/admin/login" : "/login"
    return NextResponse.redirect(new URL(loginUrl, req.url))
  }

  // If session exists, check if user is admin for admin routes
  if (session && isAdminRoute) {
    try {
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", session.user.id)
        .eq("status", "active")
        .single()

      if (!adminUser) {
        // Not an admin, redirect to user dashboard or login
        return NextResponse.redirect(new URL("/login", req.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  // If session exists, check if regular user for user routes
  if (session && isUserRoute) {
    try {
      const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

      if (!user || user.status !== "active") {
        // User not found or inactive, sign out and redirect
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL("/login", req.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
}
