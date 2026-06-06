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
    <div className="overflow-hidden rounded-[1.75rem] border border-[#E4DED1] bg-white/90 shadow-[0_18px_60px_rgba(15,17,16,0.08)]">
      <div className="border-b border-[#E4DED1] px-6 py-5 text-center sm:px-8">
        <h2 className="font-unbounded text-2xl font-semibold text-[#0F1110] sm:text-3xl">
          {contactBooking.headline}
        </h2>
      </div>
      <div className="min-h-[640px] p-4 sm:p-6">
        <Cal
          namespace={CAL_NAMESPACE}
          calLink={CAL_LINK}
          style={{ width: "100%", height: "100%", minHeight: "600px", overflow: "auto" }}
          config={{ layout: "column_view", theme: "light" }}
        />
      </div>
    </div>
  )
}
