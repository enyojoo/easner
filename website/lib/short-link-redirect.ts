import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { captureDownloadRedirect } from "@/lib/download-analytics"
import {
  appendSearchParams,
  detectPlatform,
  getDownloadDestination,
  getRequestHostname,
  isLinkPreviewCrawler,
  isMobilePlatform,
  normalizePathname,
  parsePlatformOverride,
} from "@/lib/download-routing"

/** Smart redirect for `/app` on mobile (store/APK). Desktop renders the download page. */
export function resolveAppPathResponse(request: NextRequest): NextResponse | null {
  const pathname = normalizePathname(request.nextUrl.pathname)
  if (pathname !== "/app") return null

  const ua = request.headers.get("user-agent")
  if (isLinkPreviewCrawler(ua)) return null

  const host = getRequestHostname(request)
  const { searchParams } = request.nextUrl
  const platformOverride = parsePlatformOverride(searchParams.get("platform"))
  const platform = platformOverride ?? detectPlatform(ua)
  const src = searchParams.get("src")

  if (!isMobilePlatform(platform) && !platformOverride) return null

  const destinationPlatform =
    platformOverride === "ios" || platformOverride === "android" ? platformOverride : platform

  if (destinationPlatform === "ios" || destinationPlatform === "android") {
    const destination = getDownloadDestination(destinationPlatform)
    if (destination) {
      const target = appendSearchParams(destination, searchParams)
      void captureDownloadRedirect({
        platform: destinationPlatform,
        destination: target,
        src,
        entry_host: host,
        entry_path: pathname,
      })
      return NextResponse.redirect(target, 302)
    }
  }

  return null
}
