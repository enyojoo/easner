"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { useDialogFocus } from "@/hooks/use-dialog-focus"
import { createPortal } from "react-dom"
import { ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PersonalBankingCtas } from "./personal-banking-ctas"
import { BusinessSignupLink } from "./business-signup-link"
import { BUSINESS_BANKING_CTA_DESCRIPTION } from "@/lib/marketing/constants"
import { MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS } from "@/lib/marketing/layout-constants"
import { captureCtaClicked } from "@/lib/marketing/analytics"
import { cn } from "@/lib/utils"

interface OpenAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ctaLocation?: string
}

export function OpenAccountDialog({ open, onOpenChange, ctaLocation }: OpenAccountDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
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

  useDialogFocus(open, dialogRef, onOpenChange)

  if (!open) return null
  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 bg-[#0F1110]/45 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-account-title"
        className="relative z-10 flex max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-3xl flex-col overflow-hidden rounded-[1.25rem] border border-[#E4DED1] bg-white shadow-[0_24px_90px_rgba(15,17,16,0.18)] sm:max-h-[min(920px,calc(100dvh-2rem))] sm:rounded-[1.75rem]"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[#E4DED1] px-4 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0 flex-1 pr-3 text-left sm:pr-4">
            <h2 id="open-account-title" className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS)}>
              Open your Easner account
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[#5F665F] sm:mt-2 sm:text-base">
              Choose a personal or business account.
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
              <h3 className="font-unbounded text-base font-bold text-[#0F1110] sm:text-lg">Personal Banking</h3>
              <PersonalBankingCtas
                className="mt-4 sm:mt-6"
                surface="open-account"
                compact
                align="start"
                descriptionVariant="open-account"
              />
            </div>
            <div className="p-4 sm:p-8">
              <h3 className="font-unbounded text-base font-bold text-[#0F1110] sm:text-lg">Business Banking</h3>
              <div className="mt-4 sm:mt-6">
                <p className="mb-3 text-sm leading-6 text-[#5F665F]">{BUSINESS_BANKING_CTA_DESCRIPTION}</p>
                <Button
                  asChild
                  className="inline-flex h-10 shrink-0 rounded-full bg-[#007ACC] px-3.5 text-[13px] font-semibold text-white hover:bg-[#0062A3] sm:text-sm"
                >
                  <BusinessSignupLink campaign={ctaLocation ?? "open_account_dialog"}>
                    Open Business account
                  </BusinessSignupLink>
                </Button>
              </div>
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
  /** Analytics location for outbound attribution (PostHog + cookie, not URL params). */
  ctaLocation?: string
  /** Parent-controlled dialog; render `<OpenAccountDialog />` separately. */
  dialogOpen?: boolean
  onDialogOpenChange?: (open: boolean) => void
}

export function OpenAccountButton({
  className,
  showArrow = false,
  onPress,
  ctaLocation,
  dialogOpen,
  onDialogOpenChange,
}: OpenAccountButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = onDialogOpenChange !== undefined
  const open = isControlled ? (dialogOpen ?? false) : internalOpen
  const setOpen = isControlled ? onDialogOpenChange : setInternalOpen

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => {
          if (ctaLocation) {
            captureCtaClicked({
              cta_location: ctaLocation,
              cta_label: "Open Account",
              destination: "open_account_dialog",
              destination_type: "dialog",
            })
          }
          setOpen(true)
          onPress?.()
        }}
      >
        Open Account
        {showArrow && <ArrowRight className="h-4 w-4" />}
      </Button>
      {!isControlled && (
        <OpenAccountDialog open={open} onOpenChange={setOpen} ctaLocation={ctaLocation} />
      )}
    </>
  )
}
