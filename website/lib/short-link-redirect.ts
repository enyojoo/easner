import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { captureDownloadRedirect } from "@/lib/download-analytics"
import {
  appendSearchParams,
  detectPlatform,
  DOWNLOAD_LANDING_URL,
  getDownloadDestination,
  isAppLinkHost,
  isMobilePlatform,
  MARKETING_SITE_URL,
  parsePlatformOverride,
} from "@/lib/download-routing"

/** Smart redirect for link.easner.com/app (shared by middleware + route handler). */
export function resolveShortLinkResponse(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host") ?? request.nextUrl.host
  if (!isAppLinkHost(host)) return null

  const { pathname, searchParams } = request.nextUrl

  // link.easner.com without /app → main marketing site
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
  const host = request.headers.get("host") ?? request.nextUrl.host
  if (isAppLinkHost(host)) return null
  if (request.nextUrl.pathname !== "/app") return null
  return NextResponse.redirect(MARKETING_SITE_URL, 302)
}
