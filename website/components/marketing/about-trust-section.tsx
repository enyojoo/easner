"use client"

import { ArrowRight } from "lucide-react"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { aboutTrust } from "@/lib/marketing/content/about"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

export function AboutTrustSection() {
  return (
    <section className="bg-white pb-14 pt-7 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-web-hairline bg-web-plate p-6 shadow-[0_12px_35px_rgba(15,17,16,0.05)] sm:rounded-[1.75rem] sm:p-10">
          <Headline level="section">
            {aboutTrust.headline}
          </Headline>
          <p className={cn("mt-5 text-web-body", MARKETING_BODY_TEXT)}>{aboutTrust.body}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {aboutTrust.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 rounded-[16px] border border-web-hairline bg-white/80 p-4 text-sm leading-6 text-web-nav"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <MarketingLink
            href={aboutTrust.learnMoreHref}
            analyticsLocation="about_trust_compliance"
            ctaLabel={aboutTrust.learnMoreLabel}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-colors hover:text-primary-text"
          >
            {aboutTrust.learnMoreLabel}
            <ArrowRight className="h-4 w-4" />
          </MarketingLink>
        </div>
      </div>
    </section>
  )
}
