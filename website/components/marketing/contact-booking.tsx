"use client"

import { useEffect } from "react"
import Cal, { getCalApi } from "@calcom/embed-react"
import { CAL_LINK, CAL_NAMESPACE } from "@/lib/marketing/constants"
import { contactBooking } from "@/lib/marketing/content/contact"

export function ContactBooking() {
  useEffect(() => {
    ;(async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE })
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: { "cal-brand": "#007ACC" },
          dark: { "cal-brand": "#007ACC" },
        },
        hideEventTypeDetails: true,
        layout: "month_view",
      })
    })()
  }, [])

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4DED1] bg-white/90 shadow-[0_18px_60px_rgba(15,17,16,0.08)] sm:rounded-[1.75rem]">
      <div className="border-b border-[#E4DED1] px-4 py-4 text-center sm:px-8 sm:py-5">
        <h2 className="text-balance font-unbounded text-xl font-semibold text-[#0F1110] sm:text-2xl md:text-3xl">
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
