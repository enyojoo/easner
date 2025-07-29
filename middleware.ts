import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // If already logged in and trying to access admin login, redirect to admin dashboard
      if (session) {
        // Check if user is admin by checking admin_users table
        const { data: adminUser } = await supabase.from("admin_users").select("id").eq("id", session.user.id).single()

        if (adminUser) {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        }
      }
      return res
    }

    // For all other admin routes, require authentication and admin role
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    // Check if user is admin
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("id", session.user.id).single()

    if (!adminUser) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    return res
  }

  // User routes protection
  if (pathname.startsWith("/user")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check if user exists in users table
    const { data: user } = await supabase.from("users").select("id").eq("id", session.user.id).single()

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return res
  }

  // Redirect authenticated users away from login/register pages
  if (session && (pathname === "/login" || pathname === "/register")) {
    // Check if user is admin
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("id", session.user.id).single()

    if (adminUser) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    } else {
      return NextResponse.redirect(new URL("/user/dashboard", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login", "/register"],
}
