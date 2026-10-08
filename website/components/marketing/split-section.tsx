"use client"

import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketingLink } from "./marketing-link"
import { OpenAccountButton } from "./open-account-dialog"
import { PersonaCtas } from "./persona-ctas"
import { VisualSlot } from "./visual-slot"
import { Eyebrow } from "@/components/ds/eyebrow"
import { cn } from "@/lib/utils"
import { MARKETING_BODY_TEXT, SPLIT_COPY_CARD, SPLIT_GRID_GAP, SPLIT_VISUAL_CONTAINER } from "@/lib/marketing/layout-constants"
import type { Cta } from "@/lib/marketing/types"
import { Headline } from "@/components/ds/headline"

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
  ctaDescription?: string
  variant?: "hero" | "content"
}

function SplitCtas({
  ctas,
  isHero,
  ctaDescription,
}: {
  ctas: Cta[]
  isHero?: boolean
  ctaDescription?: string
}) {
  if (ctas.some((cta) => cta.store)) {
    return (
      <PersonaCtas
        ctas={ctas}
        className={cn("mt-8 max-w-md", isHero && "mx-auto lg:mx-0")}
        description={ctaDescription}
        surface={ctas.find((cta) => cta.analyticsLocation)?.analyticsLocation ?? "product_hero"}
      />
    )
  }

  return (
    <div
      className={cn(
        "mt-8 flex flex-row flex-wrap gap-3",
        isHero && "justify-center lg:justify-start"
      )}
    >
      {ctas.map((cta, i) =>
        cta.action === "open-account" ? (
          <OpenAccountButton
            key={cta.label}
            ctaLocation={cta.analyticsLocation}
            showArrow={i === 0}
          />
        ) : (
          <Button
            key={cta.label}
            asChild
            variant={i === 0 ? "primary" : "outline"}
            pill
          >
            <MarketingLink href={cta.href} external={cta.external} analyticsLocation={cta.analyticsLocation} ctaLabel={cta.label}>
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
  isHero,
  ctaDescription,
}: {
  headline: string
  subhead?: string
  body?: string
  bullets?: string[]
  badge?: string
  ctas?: Cta[]
  h1?: boolean
  boxed: boolean
  isHero?: boolean
  ctaDescription?: string
}) {
  const HeadingTag = h1 ? "h1" : "h2"

  const content = (
    <>
      {badge && <Eyebrow className="mb-4">{badge}</Eyebrow>}
      <Headline level={h1 ? "page" : "sub"} as={HeadingTag}>
        {headline}
      </Headline>
      {subhead && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-web-body",
            MARKETING_BODY_TEXT,
            isHero && "mx-auto lg:mx-0"
          )}
        >
          {subhead}
        </p>
      )}
      {body && (
        <p className={cn("max-w-2xl text-web-body", MARKETING_BODY_TEXT, subhead ? "mt-4" : "mt-5")}>
          {body}
        </p>
      )}
      {bullets && bullets.length > 0 && (
        <ul className="mt-7 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-web-nav">
              <span className="mt-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-tint">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      {ctas && ctas.length > 0 && (
        <SplitCtas ctas={ctas} isHero={isHero} ctaDescription={ctaDescription} />
      )}
    </>
  )

  if (boxed) {
    return <div className={SPLIT_COPY_CARD}>{content}</div>
  }

  return (
    <div className={cn(isHero && "text-center lg:text-left")}>{content}</div>
  )
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
  ctaDescription,
}: SplitSectionProps) {
  const resolvedVariant = variant ?? (h1 ? "hero" : "content")
  const hasVisual = !!(visual || (visualSlot && altText))
  const isContent = resolvedVariant === "content"

  return (
    <section className={cn("bg-web-band pb-14 pt-7 md:pb-24 md:pt-12", h1 && "bg-transparent")}>
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
            isHero={!isContent}
            ctaDescription={ctaDescription}
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
    <section className="bg-web-band pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Headline level="section">
            {headline}
          </Headline>
          {body && <p className={cn("mt-5 text-web-body", MARKETING_BODY_TEXT)}>{body}</p>}
        </div>
      </div>
    </section>
  )
}
