"use client"

import { useEffect, useState } from "react"
import {
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
export function usePersonalBankingCtaDescription(): string {
  const [description, setDescription] = useState(PERSONAL_BANKING_CTA_DESCRIPTION_MOBILE)

  useEffect(() => {
    setDescription(
      detectPlatform(navigator.userAgent) === "desktop"
        ? PERSONAL_BANKING_CTA_DESCRIPTION
        : PERSONAL_BANKING_CTA_DESCRIPTION_MOBILE
    )
  }, [])

  return description
}
