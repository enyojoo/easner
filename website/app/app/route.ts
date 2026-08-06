import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { redirectAppPathOnMainSite, resolveShortLinkResponse } from "@/lib/short-link-redirect"
import { MARKETING_SITE_URL } from "@/lib/download-routing"

/**
 * Fallback route for /app when middleware does not run (edge cache, etc.).
 * link.easner.com/app → store/APK or /download; other hosts → www.
 */
export function GET(request: NextRequest) {
  const shortLink = resolveShortLinkResponse(request)
  if (shortLink) return shortLink

  const mainSite = redirectAppPathOnMainSite(request)
  if (mainSite) return mainSite

  return NextResponse.redirect(MARKETING_SITE_URL, 302)
}
