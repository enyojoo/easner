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

/** Smart redirect for `/app` on any host (store/APK or desktop /download). */
export function resolveAppPathResponse(request: NextRequest): NextResponse | null {
  const pathname = normalizePathname(request.nextUrl.pathname)
  if (pathname !== "/app") return null

  const host = getRequestHostname(request)
  const { searchParams } = request.nextUrl
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

/** link.easner.com root (and stray paths) → www home. */
export function resolveShortLinkResponse(request: NextRequest): NextResponse | null {
  if (!isAppLinkRequest(request)) return null

  const pathname = normalizePathname(request.nextUrl.pathname)
  if (pathname === "/app") return null

  return NextResponse.redirect(MARKETING_SITE_URL, 302)
}
