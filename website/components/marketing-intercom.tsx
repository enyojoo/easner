"use client"

import { useEffect } from "react"
import Intercom, { onHide, update } from "@intercom/messenger-js-sdk"
import {
  intercomAppId,
  intercomRegion,
  INTERCOM_MOBILE_MEDIA_QUERY,
  restoreIntercomScrollPosition,
  shouldHideIntercomLauncher,
} from "@/lib/intercom-messenger"

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
      hide_default_launcher: shouldHideIntercomLauncher(),
    })

    onHide(() => {
      restoreIntercomScrollPosition()
    })

    const media = window.matchMedia(INTERCOM_MOBILE_MEDIA_QUERY)
    const syncLauncherVisibility = () => {
      update({ hide_default_launcher: media.matches })
    }

    media.addEventListener("change", syncLauncherVisibility)
    return () => media.removeEventListener("change", syncLauncherVisibility)
  }, [])

  return null
}
