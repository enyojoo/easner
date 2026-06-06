"use client"

import { useEffect, useState } from "react"
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
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }

    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-[#E4DED1] bg-white shadow-[0_24px_90px_rgba(15,17,16,0.18)]"
      >
        <div className="flex items-start justify-between border-b border-[#E4DED1] px-6 py-5 sm:px-8">
          <div className="flex-1 pr-4 text-left">
            <h2 id="open-account-title" className="font-unbounded text-2xl font-semibold text-[#0F1110] sm:text-3xl">
              Begin your experience
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5F665F] sm:text-base">
              Choose the Easner banking that fits your needs.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-[#E4DED1] p-2 text-[#5F665F] transition-colors hover:bg-[#F8F6F0] hover:text-[#0F1110]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 pb-8 md:grid-cols-2 sm:pb-10">
          <div className="border-b border-[#E4DED1] p-6 sm:p-8 md:border-b-0 md:border-r">
            <h3 className="font-unbounded text-lg font-semibold text-[#0F1110]">Personal Banking</h3>
            <p className="mt-2 text-sm leading-6 text-[#5F665F]">
              Download the mobile app for global banking.
            </p>
            <StoreDownloadButtons className="mt-6" layout="grid" />
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="font-unbounded text-lg font-semibold text-[#0F1110]">Business Banking</h3>
            <p className="mt-2 text-sm leading-6 text-[#5F665F]">
              Open a business account on the web dashboard.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 h-12 w-full rounded-full bg-[#007ACC] px-6 text-white hover:bg-[#0062A3] sm:w-auto"
            >
              <Link href={BUSINESS_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
                Open Business account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OpenAccountButtonProps {
  className?: string
  showArrow?: boolean
}

export function OpenAccountButton({ className, showArrow = false }: OpenAccountButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" className={className} onClick={() => setOpen(true)}>
        Open Account
        {showArrow && <ArrowRight className="h-4 w-4" />}
      </Button>
      <OpenAccountDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
