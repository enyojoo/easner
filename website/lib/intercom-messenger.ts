import { show } from "@intercom/messenger-js-sdk"

/** Matches Tailwind `md` – launcher hidden below this width. */
export const INTERCOM_MOBILE_MEDIA_QUERY = "(max-width: 767px)"

let pendingMobileScrollRestore: number | null = null

export function shouldHideIntercomLauncher(): boolean {
  if (typeof window === "undefined") return true
  return window.matchMedia(INTERCOM_MOBILE_MEDIA_QUERY).matches
}

export function markIntercomScrollPosition(): void {
  if (typeof window === "undefined" || !shouldHideIntercomLauncher()) return
  pendingMobileScrollRestore = window.scrollY
}

export function restoreIntercomScrollPosition(): void {
  if (pendingMobileScrollRestore === null) return

  const scrollY = pendingMobileScrollRestore
  pendingMobileScrollRestore = null

  const restore = () => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "auto" })
  }

  restore()
  requestAnimationFrame(() => {
    restore()
    requestAnimationFrame(restore)
  })
  window.setTimeout(restore, 0)
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
  if (typeof window === "undefined" || !isIntercomConfigured()) return

  try {
    markIntercomScrollPosition()
    show()
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Intercom] Failed to open messenger")
    }
  }
}
