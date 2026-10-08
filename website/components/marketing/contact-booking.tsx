"use client"

import { useEffect, useState } from "react"
import Cal, { getCalApi, type EmbedEvent } from "@calcom/embed-react"
import { CAL_LINK, CAL_NAMESPACE } from "@/lib/marketing/constants"
import { contactBooking } from "@/lib/marketing/content/contact"
import { captureBookingCompleted } from "@/lib/marketing/analytics"
import { Headline } from "@/components/ds/headline"

export function ContactBooking() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const setupCal = async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE })
      if (cancelled) return

      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: { "cal-brand": "#007ACC" },
          dark: { "cal-brand": "#007ACC" },
        },
        hideEventTypeDetails: true,
        layout: "month_view",
      })

      const onBookingSuccess = (event: EmbedEvent<"bookingSuccessfulV2">) => {
        const data = event.detail.data
        captureBookingCompleted({
          uid: data.uid,
          title: data.title,
          startTime: data.startTime,
          eventTypeId: data.eventTypeId,
        })
      }

      const onLinkReady = () => setReady(true)

      cal("on", { action: "bookingSuccessfulV2", callback: onBookingSuccess })
      cal("on", { action: "linkReady", callback: onLinkReady })

      return () => {
        cal("off", { action: "bookingSuccessfulV2", callback: onBookingSuccess })
        cal("off", { action: "linkReady", callback: onLinkReady })
      }
    }

    const cleanupPromise = setupCal()

    return () => {
      cancelled = true
      void cleanupPromise.then((cleanup) => cleanup?.())
    }
  }, [])

  return (
    <div
      id={contactBooking.anchor}
      className="scroll-mt-24 overflow-hidden rounded-[16px] border border-web-hairline bg-web-canvas/90 shadow-panel sm:scroll-mt-28 sm:rounded-[1.75rem]"
    >
      <div className="border-b border-web-hairline px-4 py-4 text-center sm:px-8 sm:py-5">
        <Headline level="display" className="text-balance">
          {contactBooking.headline}
        </Headline>
      </div>
      <div className="relative min-h-[min(640px,calc(100dvh-12rem))] overflow-x-auto p-3 sm:min-h-[600px] sm:p-6">
        {!ready && (
          <div
            role="status"
            className="absolute inset-3 flex flex-col items-center justify-center gap-3 rounded-[16px] bg-web-plate text-sm text-web-meta sm:inset-6"
          >
            <span className="size-5 animate-spin rounded-full border-2 border-brand-primary/25 border-t-brand-primary" aria-hidden="true" />
            Loading available times…
          </div>
        )}
        <Cal
          namespace={CAL_NAMESPACE}
          calLink={CAL_LINK}
          style={{ width: "100%", height: "100%", minHeight: "520px", overflow: "auto" }}
          config={{ layout: "column_view", theme: "light" }}
        />
      </div>
    </div>
  )
}
