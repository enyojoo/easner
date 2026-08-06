"use client"

import { useEffect } from "react"
import Intercom from "@intercom/messenger-js-sdk"
import { intercomAppId, intercomRegion } from "@/lib/intercom-messenger"

export function MarketingIntercom() {
  useEffect(() => {
    const appId = intercomAppId()
    if (!appId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Intercom] Missing NEXT_PUBLIC_INTERCOM_APP_ID")
      }
      return
    }

    Intercom({
      app_id: appId,
      region: intercomRegion(),
    })
  }, [])

  return null
}
