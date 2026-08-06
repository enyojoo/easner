import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { captureDownloadRedirect } from "@/lib/download-analytics"
import {
  appendSearchParams,
  detectPlatform,
  getDownloadDestination,
  getRequestHostname,
  isMobilePlatform,
  parsePlatformOverride,
} from "@/lib/download-routing"
import { redirectAppPathOnMainSite, resolveShortLinkResponse } from "@/lib/short-link-redirect"

/** Smart download routing for link.easner.com/app and www /download. */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const host = getRequestHostname(request)
  const ua = request.headers.get("user-agent")
  const platformOverride = parsePlatformOverride(searchParams.get("platform"))
  const platform = platformOverride ?? detectPlatform(ua)
  const src = searchParams.get("src")

  // link.easner.com — only / and /app; everything else → www home
  const shortLinkResponse = resolveShortLinkResponse(request)
  if (shortLinkResponse) return shortLinkResponse

  // www.easner.com/app (no page) → home
  const mainSiteAppResponse = redirectAppPathOnMainSite(request)
  if (mainSiteAppResponse) return mainSiteAppResponse

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

    // Mobile visitors → store/APK directly (preserves query)
    if (isMobilePlatform(platform) && !platformOverride) {
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
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
