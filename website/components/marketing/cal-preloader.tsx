"use client"

import { useEffect } from "react"
import { preconnect, prefetchDNS } from "react-dom"
import { getCalApi } from "@calcom/embed-react"
import { CAL_LINK, CAL_NAMESPACE } from "@/lib/marketing/constants"

const CAL_ORIGIN = "https://app.cal.com"

/**
 * Warms the Cal.com booking calendar in the background on every marketing page, so /contact shows it
 * straight away: connect to Cal early, then, once the page has loaded and the browser is idle, load the
 * embed script and preload the booking page's assets into the cache. Skipped when the visitor has asked
 * to save data. Renders nothing.
 */
export function CalPreloader() {
  prefetchDNS(CAL_ORIGIN)
  preconnect(CAL_ORIGIN)

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return

    let cancelled = false
    let idleHandle: number | undefined
    let timeoutHandle: number | undefined

    const warm = async () => {
      if (cancelled) return
      const cal = await getCalApi({ namespace: CAL_NAMESPACE })
      if (cancelled) return
      cal("preload", { calLink: CAL_LINK })
    }

    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(() => void warm(), { timeout: 4000 })
      } else {
        timeoutHandle = window.setTimeout(() => void warm(), 1500)
      }
    }

    if (document.readyState === "complete") schedule()
    else window.addEventListener("load", schedule, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener("load", schedule)
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle)
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle)
    }
  }, [])

  return null
}
