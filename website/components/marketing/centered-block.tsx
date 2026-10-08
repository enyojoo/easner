"use client"

import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

interface CenteredBlockProps {
  headline: string
  body: string
  stat?: string
  className?: string
}

export function CenteredBlock({ headline, body, stat, className = "bg-white" }: CenteredBlockProps) {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Headline level="section">{headline}</Headline>
        <p className={cn("mt-6 text-web-body", MARKETING_BODY_TEXT)}>{body}</p>
        {stat && (
          <div className="mt-8 inline-flex rounded-[16px] border border-web-eyebrow-border bg-surface-tint px-6 py-4 text-sm font-semibold leading-7 text-brand-navy shadow-sm sm:text-base">
            {stat}
          </div>
        )}
      </div>
    </section>
  )
}
