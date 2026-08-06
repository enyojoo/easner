import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { resolveAppPathResponse, resolveShortLinkResponse } from "@/lib/short-link-redirect"
import { MARKETING_SITE_URL } from "@/lib/download-routing"

/**
 * Fallback route for /app when middleware does not run (edge cache, etc.).
 */
export function GET(request: NextRequest) {
  const appPath = resolveAppPathResponse(request)
  if (appPath) return appPath

  const shortLink = resolveShortLinkResponse(request)
  if (shortLink) return shortLink

  return NextResponse.redirect(MARKETING_SITE_URL, 302)
}
