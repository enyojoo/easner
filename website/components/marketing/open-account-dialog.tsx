"use client"

import { useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StoreDownloadButtons } from "./store-download-buttons"
import { BUSINESS_SIGNUP_URL } from "@/lib/marketing/constants"

interface OpenAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OpenAccountDialog({ open, onOpenChange }: OpenAccountDialogProps) {
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null
  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[#0F1110]/45 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-account-title"
        className="relative z-10 flex max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-3xl flex-col overflow-hidden rounded-[1.25rem] border border-[#E4DED1] bg-white shadow-[0_24px_90px_rgba(15,17,16,0.18)] sm:max-h-[min(920px,calc(100dvh-2rem))] sm:rounded-[1.75rem]"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[#E4DED1] px-4 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0 flex-1 pr-3 text-left sm:pr-4">
            <h2 id="open-account-title" className="font-unbounded text-xl font-semibold leading-tight text-[#0F1110] sm:text-2xl md:text-3xl">
              Begin your experience
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[#5F665F] sm:mt-2 sm:text-base">
              Choose the Easner banking that fits your needs.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="shrink-0 rounded-full border border-[#E4DED1] p-2 text-[#5F665F] transition-colors hover:bg-[#F8F6F0] hover:text-[#0F1110]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-[#E4DED1] p-4 sm:p-8 md:border-b-0 md:border-r">
              <h3 className="font-unbounded text-base font-semibold text-[#0F1110] sm:text-lg">Personal Banking</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#5F665F] sm:mt-2">
                Download the mobile app for global banking.
              </p>
              <StoreDownloadButtons className="mt-4 sm:mt-6" layout="grid" />
            </div>
            <div className="p-4 sm:p-8">
              <h3 className="font-unbounded text-base font-semibold text-[#0F1110] sm:text-lg">Business Banking</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#5F665F] sm:mt-2">
                Open a business account on the web dashboard.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-4 h-11 w-full rounded-full bg-[#007ACC] px-5 text-sm text-white hover:bg-[#0062A3] sm:mt-6 sm:h-12 sm:w-auto sm:px-6"
              >
                <Link href={BUSINESS_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
                  Open Business account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

interface OpenAccountButtonProps {
  className?: string
  showArrow?: boolean
  onPress?: () => void
}

export function OpenAccountButton({ className, showArrow = false, onPress }: OpenAccountButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => {
          onPress?.()
          setOpen(true)
        }}
      >
        Open Account
        {showArrow && <ArrowRight className="h-4 w-4" />}
      </Button>
      <OpenAccountDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
