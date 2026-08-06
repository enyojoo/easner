"use client"

import { useEffect, useState } from "react"
import {
  OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION,
  OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION_MOBILE,
  PERSONAL_BANKING_CTA_DESCRIPTION,
  PERSONAL_BANKING_CTA_DESCRIPTION_MOBILE,
} from "@/lib/marketing/constants"
import { detectPlatform, type DownloadPlatform } from "@/lib/download-routing"

/** Client platform — updates after mount to avoid SSR mismatch. */
export function useDownloadPlatform(): DownloadPlatform {
  const [platform, setPlatform] = useState<DownloadPlatform>("desktop")

  useEffect(() => {
    setPlatform(detectPlatform(navigator.userAgent))
  }, [])

  return platform
}

/** Desktop-only Web App CTA — hidden until mount so mobile never flashes it. */
export function useShowWebAppCta(): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(detectPlatform(navigator.userAgent) === "desktop")
  }, [])

  return show
}

/** CTA helper copy — mobile-first until mount, then matches visible actions. */
export function usePersonalBankingCtaDescription(
  variant: "default" | "open-account" = "default"
): string {
  const desktopCopy =
    variant === "open-account"
      ? OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION
      : PERSONAL_BANKING_CTA_DESCRIPTION
  const mobileCopy =
    variant === "open-account"
      ? OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION_MOBILE
      : PERSONAL_BANKING_CTA_DESCRIPTION_MOBILE

  const [description, setDescription] = useState(mobileCopy)

  useEffect(() => {
    setDescription(
      detectPlatform(navigator.userAgent) === "desktop" ? desktopCopy : mobileCopy
    )
  }, [desktopCopy, mobileCopy])

  return description
}
