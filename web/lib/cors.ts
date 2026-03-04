import { type NextRequest } from "next/server"

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_OFFICE_URL || "https://bk.easner.com",
  "http://localhost:3002",
]

export function getOfficeCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") || ""
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  }
}
