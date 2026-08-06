"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { X } from "lucide-react"
import { BrandLogo } from "@easner/shared"
import { DownloadEmailForm } from "./download-email-form"
import { DownloadQr } from "./download-qr"
import { APP_STORE_URL, ANDROID_APK_URL, PERSONAL_WEB_APP_URL } from "@/lib/marketing/constants"
import { APP_LINK_URL, isMobilePlatform, type DownloadPlatform } from "@/lib/download-routing"
import { posthog } from "@/lib/posthog"
import { cn } from "@/lib/utils"
import { AppleStoreIcon, AndroidStoreIcon } from "./store-icons"

interface DownloadAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: DownloadPlatform
  src?: string
  surface?: string
}

export function DownloadAppDialog({
  open,
  onOpenChange,
  platform,
  src,
  surface = "dialog",
}: DownloadAppDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const showQr = !isMobilePlatform(platform)

  useLayoutEffect(() => {
    if (!open) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const { body, documentElement: html } = document
    const prevBodyOverflow = body.style.overflow
    const prevBodyPaddingRight = body.style.paddingRight
    const prevHtmlOverflow = html.style.overflow

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.paddingRight = prevBodyPaddingRight
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    posthog.capture("download_dialog_view", { surface, platform })
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange, platform, surface])

  if (!open) return null
  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[rgba(15,17,16,0.4)] backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-app-title"
        className={cn(
          "relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#E9E4D8] bg-white shadow-[0_24px_90px_rgba(15,17,16,0.18)]",
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200"
        )}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 rounded-full border border-[#E9E4D8] p-2 text-[#6F756F] transition-colors hover:bg-[#F8F6F0] hover:text-[#0F1110]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-7 pt-8 text-center sm:px-8">
          <div className="mx-auto mb-5 flex justify-center">
            <BrandLogo className="h-7 w-auto" />
          </div>

          <h2
            id="download-app-title"
            className="font-unbounded text-xl font-bold text-[#0F1110] sm:text-[1.35rem]"
          >
            Get the Easner app
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#3D403D] sm:text-[15px]">
            {showQr
              ? "Scan the QR code to download the app"
              : "Install Easner Banking on your phone"}
          </p>

          {showQr ? (
            <div className="mt-6 flex justify-center">
              <DownloadQr value={APP_LINK_URL} size={168} />
            </div>
          ) : (
            <div className="mt-6 grid gap-2.5">
              <Link
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-[#0F1110] bg-[#0F1110] px-4 py-3 text-white transition-opacity hover:opacity-90"
              >
                <AppleStoreIcon className="size-6 text-white" />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-white/75">
                    Download on
                  </span>
                  <span className="block text-sm font-semibold">App Store</span>
                </span>
              </Link>
              <Link
                href={ANDROID_APK_URL}
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-[#E9E4D8] bg-white px-4 py-3 text-[#0F1110] transition-colors hover:border-[#007ACC]/30"
              >
                <AndroidStoreIcon />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-[#6F756F]">
                    Download
                  </span>
                  <span className="block text-sm font-semibold">Android APK</span>
                </span>
              </Link>
            </div>
          )}

          <p className="mt-6 text-[13px] leading-5 text-[#6F756F] sm:text-sm">
            – or get a download link via email –
          </p>

          <DownloadEmailForm className="mt-3" src={src} />

          {showQr ? (
            <p className="mt-5 text-sm leading-6 text-[#6F756F]">
              Prefer not to install?{" "}
              <Link
                href={PERSONAL_WEB_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => posthog.capture("web_app_click", { surface: `${surface}-dialog` })}
                className="font-semibold text-[#007ACC] hover:underline"
              >
                Use the web app
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  )
}
