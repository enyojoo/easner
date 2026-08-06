"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { X } from "lucide-react"
import { BrandLogo } from "@easner/shared"
import { DownloadEmailForm } from "./download-email-form"
import { DownloadQr } from "./download-qr"
import { APP_STORE_URL, ANDROID_APK_URL } from "@/lib/marketing/constants"
import { APP_LINK_URL, isMobilePlatform, type DownloadPlatform } from "@/lib/download-routing"
import { posthog } from "@/lib/posthog"
import { cn } from "@/lib/utils"

interface DownloadAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: DownloadPlatform
  src?: string
  surface?: string
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.493 2.096-1.316 2.915-.862.858-1.874 1.338-3.042 1.257-.126-1.106.413-2.14 1.122-2.886.862-.905 2.003-1.456 3.236-1.286zm1.37 4.968c-1.874-.108-3.465 1.066-4.356 1.066-.911 0-2.316-1.044-3.806-.998-1.96.042-3.765 1.14-4.773 2.902-2.037 3.534-.522 8.765 1.463 11.634 1.002 1.445 2.195 3.066 3.764 3.008 1.516-.063 2.086-.98 3.915-.98 1.829 0 2.336.98 3.915.95 1.618-.027 2.64-1.47 3.63-2.924 1.145-1.674 1.616-3.296 1.644-3.378-.036-.016-3.158-1.212-3.186-4.81-.021-3.012 2.465-4.45 2.577-4.522-1.403-2.055-3.587-2.334-4.353-2.376z" />
    </svg>
  )
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#3DDC84"
        d="M17.6 9.48l1.84-3.18a.5.5 0 0 0-.18-.68.5.5 0 0 0-.68.18l-1.87 3.24a7.02 7.02 0 0 0-7.42 0L6.32 5.8a.5.5 0 0 0-.68-.18.5.5 0 0 0-.18.68L7.4 9.48A6.97 6.97 0 0 0 4 14.5h16a6.97 6.97 0 0 0-3.4-5.02zM8.5 13.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm7 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"
      />
      <path
        fill="#3DDC84"
        d="M4 15.5v2.75A2.75 2.75 0 0 0 6.75 21h.5v2.25a1.25 1.25 0 0 0 2.5 0V21h4.5v2.25a1.25 1.25 0 0 0 2.5 0V21h.5A2.75 2.75 0 0 0 20 18.25V15.5H4z"
      />
    </svg>
  )
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
                <AppleIcon className="h-6 w-6" />
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
                <AndroidIcon className="h-6 w-6" />
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
            — or get a download link via email —
          </p>

          <DownloadEmailForm className="mt-3" src={src} />
        </div>
      </div>
    </div>,
    document.body
  )
}
