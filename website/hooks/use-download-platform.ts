"use client"

import { useSyncExternalStore } from "react"
import {
  OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION,
  OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION_MOBILE,
  PERSONAL_BANKING_CTA_DESCRIPTION,
  PERSONAL_BANKING_CTA_DESCRIPTION_MOBILE,
} from "@/lib/marketing/constants"
import { detectPlatform, type DownloadPlatform } from "@/lib/download-routing"

const subscribeToPlatform = () => () => {}
const getPlatform = () => detectPlatform(navigator.userAgent)
const getServerPlatform = (): DownloadPlatform => "desktop"

/** Client platform, with a stable server snapshot for hydration. */
export function useDownloadPlatform(): DownloadPlatform {
  return useSyncExternalStore(subscribeToPlatform, getPlatform, getServerPlatform)
}

function subscribeToDesktopLayout(onChange: () => void) {
  const media = window.matchMedia("(min-width: 768px)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

const getDesktopAccess = () =>
  getPlatform() === "desktop" && window.matchMedia("(min-width: 768px)").matches
const getServerAccess = () => false

/** Desktop-only Web App CTA — hidden until mount so mobile never flashes it. */
export function useShowWebAppCta(): boolean {
  return useSyncExternalStore(subscribeToDesktopLayout, getDesktopAccess, getServerAccess)
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

  return useShowWebAppCta() ? desktopCopy : mobileCopy
}
