import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface AuthUser {
  userId: string
  email: string
  role: "user" | "admin"
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get("auth-token")?.value || request.cookies.get("admin-auth-token")?.value

  if (!token) return null

  return verifyToken(token)
}

export function requireAuth(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export function requireAdmin(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}
