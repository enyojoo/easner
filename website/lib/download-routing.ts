import { resolveMobileAppStoreUrls } from "@easner/shared"

export type DownloadPlatform = "ios" | "android" | "desktop"

export const APP_LINK_URL =
  process.env.NEXT_PUBLIC_APP_LINK_URL ?? "https://www.easner.com/app"

export const APP_LINK_PATH = "/app"

export const DOWNLOAD_LANDING_URL = "https://www.easner.com/app"

export const MARKETING_SITE_URL = "https://www.easner.com"

export const APP_DOWNLOAD_API_URL =
  process.env.NEXT_PUBLIC_APP_DOWNLOAD_API_URL ??
  "https://api.easner.com/api/marketing/app-download-link"

const LINK_PREVIEW_CRAWLER =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot|googlebot|bingpreview|applebot|embedly|pinterest|vkshare|redditbot/i

/** Social / chat link-preview bots — must receive HTML+OG, not an instant 302. */
export function isLinkPreviewCrawler(userAgent: string | null | undefined): boolean {
  return LINK_PREVIEW_CRAWLER.test((userAgent ?? "").toLowerCase())
}

/** Prefer forwarded host — AFD may rewrite Host to the origin (www). */
export function getRequestHostname(request: {
  headers: Headers
  nextUrl?: { host: string }
}): string {
  const forwarded =
    request.headers.get("x-forwarded-host") ?? request.headers.get("x-original-host")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? ""
  }
  const host = request.headers.get("host") ?? request.nextUrl?.host ?? ""
  return host.split(":")[0]?.toLowerCase() ?? ""
}

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function detectPlatform(userAgent: string | null | undefined): DownloadPlatform {
  const ua = (userAgent ?? "").toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return "ios"
  if (/android/.test(ua)) return "android"
  return "desktop"
}

export function parsePlatformOverride(
  value: string | null | undefined
): DownloadPlatform | null {
  if (value === "ios" || value === "android" || value === "desktop") return value
  return null
}

export function isMobilePlatform(platform: DownloadPlatform): boolean {
  return platform === "ios" || platform === "android"
}

export function getStoreUrls() {
  return resolveMobileAppStoreUrls(process.env)
}

/** Destination for a mobile platform (App Store or Play Store). */
export function getDownloadDestination(platform: DownloadPlatform): string | null {
  const urls = getStoreUrls()
  if (platform === "ios") return urls.appStore
  if (platform === "android") return urls.playStore
  return null
}

export function buildAppLinkUrl(searchParams?: URLSearchParams): string {
  if (!searchParams || [...searchParams.keys()].length === 0) return APP_LINK_URL
  const next = new URLSearchParams(searchParams)
  return `${APP_LINK_URL}?${next.toString()}`
}

export function appendSearchParams(baseUrl: string, searchParams: URLSearchParams): string {
  const keys = [...searchParams.keys()]
  if (keys.length === 0) return baseUrl
  const url = new URL(baseUrl)
  for (const [key, value] of searchParams.entries()) {
    // Don't forward platform override into store URLs
    if (key === "platform") continue
    url.searchParams.set(key, value)
  }
  return url.toString()
}
