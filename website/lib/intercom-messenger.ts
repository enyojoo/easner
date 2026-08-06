import { show } from "@intercom/messenger-js-sdk"
import { SUPPORT_EMAIL } from "@/lib/marketing/constants"

/** Matches Tailwind `md` — launcher hidden below this width. */
export const INTERCOM_MOBILE_MEDIA_QUERY = "(max-width: 767px)"

export function shouldHideIntercomLauncher(): boolean {
  if (typeof window === "undefined") return true
  return window.matchMedia(INTERCOM_MOBILE_MEDIA_QUERY).matches
}

export function intercomAppId(): string {
  return (
    process.env.NEXT_PUBLIC_INTERCOM_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_INTERCOM_APPID?.trim() ||
    ""
  )
}

export function intercomRegion(): "us" | "eu" | "ap" {
  const r = (process.env.NEXT_PUBLIC_INTERCOM_REGION ?? "us").trim().toLowerCase()
  if (r === "eu") return "eu"
  if (r === "ap" || r === "au") return "ap"
  return "us"
}

export function isIntercomConfigured(): boolean {
  return Boolean(intercomAppId())
}

export function openMarketingSupport(): void {
  if (typeof window === "undefined") return

  if (!isIntercomConfigured()) {
    window.location.href = `mailto:${SUPPORT_EMAIL}`
    return
  }

  try {
    show()
  } catch {
    window.location.href = `mailto:${SUPPORT_EMAIL}`
  }
}
