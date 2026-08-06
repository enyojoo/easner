"use client"

import { useMemo } from "react"
import { detectPlatform, type DownloadPlatform } from "@/lib/download-routing"

export function useDownloadPlatform(): DownloadPlatform {
  return useMemo(() => {
    if (typeof navigator === "undefined") return "desktop"
    return detectPlatform(navigator.userAgent)
  }, [])
}
