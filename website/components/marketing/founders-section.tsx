"use client"

import { useEffect, useLayoutEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Linkedin, X } from "lucide-react"
import type { Founder } from "@/lib/marketing/types"
import { captureCtaClicked, trackLinkClick } from "@/lib/marketing/analytics"
import { MARKETING_BODY_TEXT, MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

interface FoundersSectionProps {
  headline: string
  subhead: string
  founders: Founder[]
}

function founderSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function SocialLinks({ founder, className }: { founder: Founder; className?: string }) {
  const slug = founderSlug(founder.name)

  return (
    <div className={cn("flex min-h-10 items-center justify-end gap-3", className)}>
      <a
        href={founder.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DED1] bg-white text-[#3D443E] transition-colors hover:border-[#007ACC]/40 hover:text-[#007ACC]"
        aria-label={`${founder.name} on LinkedIn`}
        onClick={() =>
          trackLinkClick(`about_founder_linkedin_${slug}`, "LinkedIn", founder.linkedin, {
            external: true,
          })
        }
      >
        <Linkedin className="h-4 w-4" />
      </a>
      {founder.x && (
        <a
          href={founder.x}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DED1] bg-white text-[#3D443E] transition-colors hover:border-[#007ACC]/40 hover:text-[#007ACC]"
          aria-label={`${founder.name} on X`}
          onClick={() =>
            trackLinkClick(`about_founder_x_${slug}`, "X", founder.x!, { external: true })
          }
        >
          <XIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}

function FounderBioDialog({
  founder,
  open,
  onOpenChange,
}: {
  founder: Founder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const titleId = useId()

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

  if (!open || !founder) return null
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
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-xl flex-col overflow-hidden rounded-[1.25rem] border border-[#E4DED1] bg-white shadow-[0_24px_90px_rgba(15,17,16,0.18)] sm:max-h-[min(720px,calc(100dvh-2rem))] sm:rounded-[1.75rem]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E4DED1] px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS)}
            >
              {founder.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-[#6F756F]">{founder.title}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#007ACC]">{founder.tagline}</p>
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
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <div className="space-y-4">
            {founder.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-sm leading-7 text-[#5F665F] sm:text-[0.9375rem] sm:leading-8">
                {paragraph}
              </p>
            ))}
          </div>
          <SocialLinks founder={founder} className="mt-7" />
        </div>
      </div>
    </div>,
    document.body
  )
}

function FounderCard({ founder, onReadBio }: { founder: Founder; onReadBio: () => void }) {
  const slug = founderSlug(founder.name)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#E4DED1] bg-[#F8F6F0] shadow-[0_12px_35px_rgba(15,17,16,0.05)] transition-all hover:-translate-y-1 hover:border-[#007ACC]/30 hover:shadow-[0_20px_55px_rgba(15,17,16,0.09)] sm:rounded-[1.75rem]">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden border-b border-[#E4DED1] bg-[#EDE8DC]">
        <Image
          src={founder.image}
          alt={`${founder.name}, ${founder.title}`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 28rem"
          priority
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-unbounded text-lg font-bold leading-snug text-[#0F1110] sm:text-xl">
          {founder.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#6F756F]">{founder.title}</p>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#007ACC]">{founder.tagline}</p>
        <div className="mt-auto flex items-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => {
              captureCtaClicked({
                cta_location: `about_founder_read_bio_${slug}`,
                cta_label: "Read bio",
                destination: "founder_bio_dialog",
                destination_type: "dialog",
              })
              onReadBio()
            }}
            className="text-sm font-semibold text-[#0F1110] underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            Read bio
          </button>
          <SocialLinks founder={founder} className="ml-auto" />
        </div>
      </div>
    </article>
  )
}

export function FoundersSection({ headline, subhead, founders }: FoundersSectionProps) {
  const [activeFounder, setActiveFounder] = useState<Founder | null>(null)

  return (
    <section className="bg-[#F6F3EB] pb-14 pt-7 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <h2 className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
            {headline}
          </h2>
          <p className={cn("mx-auto mt-4 max-w-2xl text-[#5F665F]", MARKETING_BODY_TEXT)}>
            {subhead}
          </p>
        </div>
        <div className="mx-auto grid max-w-sm grid-cols-1 items-stretch gap-6 sm:max-w-md md:max-w-4xl md:grid-cols-2 md:gap-6 lg:gap-8">
          {founders.map((founder) => (
            <FounderCard
              key={founder.name}
              founder={founder}
              onReadBio={() => setActiveFounder(founder)}
            />
          ))}
        </div>
      </div>
      <FounderBioDialog
        founder={activeFounder}
        open={!!activeFounder}
        onOpenChange={(open) => {
          if (!open) setActiveFounder(null)
        }}
      />
    </section>
  )
}
