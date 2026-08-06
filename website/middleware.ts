import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { captureDownloadRedirect } from "@/lib/download-analytics"
import {
  APP_LINK_URL,
  appendSearchParams,
  detectPlatform,
  DOWNLOAD_LANDING_URL,
  getDownloadDestination,
  isAppLinkHost,
  isMobilePlatform,
  parsePlatformOverride,
} from "@/lib/download-routing"

const APP_ORIGIN = "https://app.easner.com"

/**
 * Legacy mobile deep links used easner.com/user/* before app.easner.com.
 * Smart download routing for link.easner.com/app and /download.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const host = request.headers.get("host") ?? request.nextUrl.host
  const ua = request.headers.get("user-agent")
  const platformOverride = parsePlatformOverride(searchParams.get("platform"))
  const platform = platformOverride ?? detectPlatform(ua)
  const src = searchParams.get("src")

  // Legacy deep links
  if (pathname === "/user" || pathname.startsWith("/user/")) {
    return NextResponse.redirect(`${APP_ORIGIN}${pathname}${request.nextUrl.search}`, 308)
  }

  // Short link host: link.easner.com/app
  if (isAppLinkHost(host) && (pathname === "/app" || pathname === "/")) {
    if (isMobilePlatform(platform)) {
      const destination = getDownloadDestination(platform)
      if (destination) {
        const target = appendSearchParams(destination, searchParams)
        const response = NextResponse.redirect(target, 302)
        // Fire analytics without blocking (best-effort on edge)
        void captureDownloadRedirect({
          platform,
          destination: target,
          src,
          entry_host: host,
          entry_path: pathname,
        })
        return response
      }
    }
    // Desktop (or unknown): branded landing
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

  // www / apex /download smart routing
  if (pathname === "/download") {
    // Explicit platform from email fallback links
    if (platformOverride === "ios" || platformOverride === "android") {
      const destination = getDownloadDestination(platformOverride)
      if (destination) {
        const target = appendSearchParams(destination, searchParams)
        void captureDownloadRedirect({
          platform: platformOverride,
          destination: target,
          src,
          entry_host: host,
          entry_path: pathname,
        })
        return NextResponse.redirect(target, 302)
      }
    }

    // Mobile visitors → short link (preserves query)
    if (isMobilePlatform(platform) && !platformOverride) {
      const appLink = new URL(APP_LINK_URL)
      for (const [key, value] of searchParams.entries()) {
        appLink.searchParams.set(key, value)
      }
      void captureDownloadRedirect({
        platform,
        destination: appLink.toString(),
        src,
        entry_host: host,
        entry_path: pathname,
      })
      return NextResponse.redirect(appLink, 302)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/user", "/user/:path*", "/download", "/app", "/"],
}
