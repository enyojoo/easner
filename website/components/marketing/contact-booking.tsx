"use client"

import { useEffect } from "react"
import Cal, { getCalApi, type EmbedEvent } from "@calcom/embed-react"
import { CAL_LINK, CAL_NAMESPACE } from "@/lib/marketing/constants"
import { contactBooking } from "@/lib/marketing/content/contact"
import { captureBookingCompleted } from "@/lib/marketing/analytics"
import { MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

export function ContactBooking() {
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

      cal("on", { action: "bookingSuccessfulV2", callback: onBookingSuccess })

      return () => {
        cal("off", { action: "bookingSuccessfulV2", callback: onBookingSuccess })
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
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#E4DED1] bg-white/90 shadow-[0_18px_60px_rgba(15,17,16,0.08)] sm:scroll-mt-28 sm:rounded-[1.75rem]"
    >
      <div className="border-b border-[#E4DED1] px-4 py-4 text-center sm:px-8 sm:py-5">
        <h2 className={cn("text-balance font-unbounded font-bold text-[#0F1110]", MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS)}>
          {contactBooking.headline}
        </h2>
      </div>
      <div className="min-h-[min(640px,calc(100dvh-12rem))] overflow-x-auto p-3 sm:min-h-[600px] sm:p-6">
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
