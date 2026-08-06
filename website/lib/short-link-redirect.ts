import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { captureDownloadRedirect } from "@/lib/download-analytics"
import {
  appendSearchParams,
  detectPlatform,
  DOWNLOAD_LANDING_URL,
  getDownloadDestination,
  getRequestHostname,
  isAppLinkRequest,
  isMobilePlatform,
  MARKETING_SITE_URL,
  normalizePathname,
  parsePlatformOverride,
} from "@/lib/download-routing"

/** Smart redirect for link.easner.com (only `/` and `/app` are public). */
export function resolveShortLinkResponse(request: NextRequest): NextResponse | null {
  if (!isAppLinkRequest(request)) return null

  const host = getRequestHostname(request)
  const pathname = normalizePathname(request.nextUrl.pathname)
  const { searchParams } = request.nextUrl

  // Only /app is a short link; any other path → www home
  if (pathname !== "/app") {
    return NextResponse.redirect(MARKETING_SITE_URL, 302)
  }

  const ua = request.headers.get("user-agent")
  const platformOverride = parsePlatformOverride(searchParams.get("platform"))
  const platform = platformOverride ?? detectPlatform(ua)
  const src = searchParams.get("src")

  if (isMobilePlatform(platform)) {
    const destination = getDownloadDestination(platform)
    if (destination) {
      const target = appendSearchParams(destination, searchParams)
      void captureDownloadRedirect({
        platform,
        destination: target,
        src,
        entry_host: host,
        entry_path: pathname,
      })
      return NextResponse.redirect(target, 302)
    }
  }

  const landing = new URL(DOWNLOAD_LANDING_URL)
  for (const [key, value] of searchParams.entries()) {
    landing.searchParams.set(key, value)
  }
  void captureDownloadRedirect({
    platform: "desktop",
    destination: landing.toString(),
    src,
    entry_host: host,
    entry_path: pathname,
  })
  return NextResponse.redirect(landing, 302)
}

/** Non-link hosts hitting /app → marketing home (no orphan /app page). */
export function redirectAppPathOnMainSite(request: NextRequest): NextResponse | null {
  if (isAppLinkRequest(request)) return null
  if (normalizePathname(request.nextUrl.pathname) !== "/app") return null
  return NextResponse.redirect(MARKETING_SITE_URL, 302)
}
