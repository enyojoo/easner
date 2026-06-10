"use client"

import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketingLink } from "./marketing-link"
import { OpenAccountButton } from "./open-account-dialog"
import { PersonaCtas } from "./persona-ctas"
import { VisualSlot } from "./visual-slot"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import {
  MARKETING_HEADING_CAPS,
  MARKETING_PAGE_HERO_TITLE,
  MARKETING_SECTION_TITLE,
  MARKETING_SUBSECTION_TITLE,
  SPLIT_COPY_CARD,
  SPLIT_GRID_GAP,
  SPLIT_VISUAL_CONTAINER,
} from "@/lib/marketing/layout-constants"
import type { Cta } from "@/lib/marketing/types"

interface SplitSectionProps {
  headline: string
  body?: string
  bullets?: string[]
  visualSlot?: string
  altText?: string
  visual?: ReactNode
  reverse?: boolean
  badge?: string
  ctas?: Cta[]
  h1?: boolean
  subhead?: string
  variant?: "hero" | "content"
}

function SplitCtas({ ctas, h1 }: { ctas: Cta[]; h1?: boolean }) {
  if (ctas.some((cta) => cta.store)) {
    return <PersonaCtas ctas={ctas} className="mt-8 max-w-md" storeLayout={h1 ? "grid" : "row"} />
  }

  return (
    <div className="mt-8 flex flex-row flex-wrap gap-3">
      {ctas.map((cta, i) =>
        cta.action === "open-account" ? (
          <OpenAccountButton
            key={cta.label}
            showArrow={i === 0}
            className="h-11 rounded-full bg-[#007ACC] px-5 text-sm text-white shadow-[0_12px_30px_rgba(0,122,204,0.18)] hover:bg-[#0062A3] sm:h-12 sm:px-6"
          />
        ) : (
          <Button
            key={cta.label}
            asChild
            size="lg"
            variant={i === 0 ? "default" : "outline"}
            className={
              i === 0
                ? "h-11 rounded-full bg-[#007ACC] px-5 text-sm text-white shadow-[0_12px_30px_rgba(0,122,204,0.18)] hover:bg-[#0062A3] sm:h-12 sm:px-6"
                : "h-11 rounded-full border-[#D9D4C7] bg-white/80 px-5 text-sm text-[#0F1110] hover:bg-white sm:h-12 sm:px-6"
            }
          >
            <MarketingLink href={cta.href} external={cta.external}>
              {cta.label}
              {i === 0 && !cta.external && cta.action !== "open-account" && (
                <ArrowRight className="h-4 w-4" />
              )}
            </MarketingLink>
          </Button>
        )
      )}
    </div>
  )
}

function CopyBlock({
  headline,
  subhead,
  body,
  bullets,
  badge,
  ctas,
  h1,
  boxed,
}: {
  headline: string
  subhead?: string
  body?: string
  bullets?: string[]
  badge?: string
  ctas?: Cta[]
  h1?: boolean
  boxed: boolean
}) {
  const HeadingTag = h1 ? "h1" : "h2"

  const content = (
    <>
      {badge && <StatusBadge label={badge} className="mb-4" />}
      <HeadingTag
        className={cn(
          "font-unbounded font-bold text-[#0F1110]",
          h1 ? MARKETING_PAGE_HERO_TITLE : cn(MARKETING_SUBSECTION_TITLE, MARKETING_HEADING_CAPS)
        )}
      >
        {headline}
      </HeadingTag>
      {subhead && (
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#5F665F] sm:text-lg sm:leading-8 md:text-xl">{subhead}</p>
      )}
      {body && (
        <p className={cn("max-w-2xl leading-7 text-[#5F665F] sm:leading-8", subhead ? "mt-4" : "mt-5 text-base sm:text-lg")}>
          {body}
        </p>
      )}
      {bullets && bullets.length > 0 && (
        <ul className="mt-7 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-[#3D443E]">
              <span className="mt-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF5FD]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#007ACC]" />
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      {ctas && ctas.length > 0 && <SplitCtas ctas={ctas} h1={h1} />}
    </>
  )

  if (boxed) {
    return <div className={SPLIT_COPY_CARD}>{content}</div>
  }

  return <div>{content}</div>
}

export function SplitSection({
  headline,
  body,
  bullets,
  visualSlot,
  altText,
  visual,
  reverse = false,
  badge,
  ctas,
  h1 = false,
  subhead,
  variant,
}: SplitSectionProps) {
  const resolvedVariant = variant ?? (h1 ? "hero" : "content")
  const hasVisual = !!(visual || (visualSlot && altText))
  const isContent = resolvedVariant === "content"

  return (
    <section className={cn("bg-[#F6F3EB] pb-14 pt-7 md:pb-24 md:pt-12", h1 && "bg-transparent")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2",
            isContent ? cn(SPLIT_GRID_GAP, "items-stretch") : "items-start gap-10 lg:gap-16",
            reverse && "lg:[&>*:first-child]:order-2"
          )}
        >
          <CopyBlock
            headline={headline}
            subhead={subhead}
            body={body}
            bullets={bullets}
            badge={badge}
            ctas={ctas}
            h1={h1}
            boxed={isContent && hasVisual}
          />
          {hasVisual && (
            <div className={SPLIT_VISUAL_CONTAINER}>
              {visual ?? (
                <VisualSlot
                  assetId={visualSlot!}
                  alt={altText!}
                  aspect="fill"
                  className="h-full rounded-none border-0 bg-transparent shadow-none"
                  priority={h1}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function TextOnlySection({
  headline,
  body,
}: {
  headline: string
  body?: string
}) {
  return (
    <section className="bg-[#F6F3EB] pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
            {headline}
          </h2>
          {body && <p className="mt-5 text-base leading-7 text-[#5F665F] sm:text-lg sm:leading-8">{body}</p>}
        </div>
      </div>
    </section>
  )
}
